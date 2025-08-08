-- =====================================================
-- CRITICAL SECURITY FIXES - RUN IMMEDIATELY
-- =====================================================
-- These fixes address ERROR-level security issues from Supabase linter

-- 1. ENABLE RLS ON MISSING TABLES (CRITICAL)
-- =====================================================

-- Enable RLS on domains table
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tasks table  
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Enable RLS on announcements table
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Enable RLS on system_settings table
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 2. CREATE RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Domains: Everyone can read active domains
CREATE POLICY "domains_read_policy" ON domains
    FOR SELECT USING (is_active = true);

-- Admins can manage domains
CREATE POLICY "domains_admin_policy" ON domains
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'A')
    );

-- Tasks: Everyone can read active tasks
CREATE POLICY "tasks_read_policy" ON tasks
    FOR SELECT USING (is_active = true);

-- Admins can manage tasks
CREATE POLICY "tasks_admin_policy" ON tasks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'A')
    );

-- Announcements: Everyone can read active announcements
CREATE POLICY "announcements_read_policy" ON announcements
    FOR SELECT USING (is_active = true);

-- Admins can manage announcements
CREATE POLICY "announcements_admin_policy" ON announcements
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'A')
    );

-- System Settings: Only admins can access
CREATE POLICY "system_settings_admin_policy" ON system_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'A')
    );

-- 3. FIX SECURITY DEFINER VIEWS (CRITICAL)
-- =====================================================

-- Drop and recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS user_progress;
DROP VIEW IF EXISTS admin_stats;

-- Recreate user_progress view (normal view, not SECURITY DEFINER)
CREATE VIEW user_progress AS
SELECT 
    u.id,
    u.student_id,
    u.name,
    u.email,
    d.name as domain_name,
    d.code as domain_code,
    COUNT(s.id) as completed_tasks,
    AVG(s.final_score)::INTEGER as avg_score,
    u.created_at
FROM users u
LEFT JOIN domains d ON u.domain_id = d.id
LEFT JOIN submissions s ON u.id = s.user_id AND s.status = 'completed'
WHERE u.role = 'S'
GROUP BY u.id, u.student_id, u.name, u.email, d.name, d.code, u.created_at;

-- Recreate admin_stats view (normal view, not SECURITY DEFINER)
CREATE VIEW admin_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'S') AS students,
    (SELECT COUNT(*) FROM submissions WHERE status = 'completed') AS submissions,
    (SELECT COUNT(*) FROM certificates WHERE is_revoked = false) AS certificates,
    (SELECT COALESCE(SUM(amount), 0)::DECIMAL(12,2) FROM payments WHERE status = 'completed') AS revenue;

-- 4. SECURE FUNCTION SEARCH PATHS (HIGH PRIORITY)
-- =====================================================

-- Fix all functions with mutable search_path
-- This prevents SQL injection through search_path manipulation

-- Update update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Update generate_student_id function
CREATE OR REPLACE FUNCTION generate_student_id(domain_code TEXT)
RETURNS TEXT 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    year_month TEXT := TO_CHAR(NOW(), 'YYMM');
    seq INTEGER;
    sid TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(RIGHT(student_id, 3) AS INTEGER)), 0) + 1
        INTO seq
    FROM users
    WHERE role = 'S'
        AND student_id LIKE 'PS' || year_month || domain_code || '%';

    sid := 'PS' || year_month || domain_code || LPAD(seq::TEXT, 3, '0');
    RETURN sid;
END;
$$;

-- Update generate_cert_number function
CREATE OR REPLACE FUNCTION generate_cert_number(user_student_id TEXT)
RETURNS TEXT 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    RETURN user_student_id;
END;
$$;

-- Update generate_verification_code function
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    code TEXT;
BEGIN
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    WHILE EXISTS (SELECT 1 FROM certificates WHERE verification_code = code) LOOP
        code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    END LOOP;
    
    RETURN code;
END;
$$;

-- Update auto_generate_student_id function
CREATE OR REPLACE FUNCTION auto_generate_student_id()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    domain_code TEXT;
BEGIN
    IF NEW.role = 'S' AND NEW.domain_id IS NOT NULL AND NEW.student_id IS NULL THEN
        SELECT code INTO domain_code FROM domains WHERE id = NEW.domain_id;
        NEW.student_id := generate_student_id(domain_code);
    END IF;
    RETURN NEW;
END;
$$;

-- Update cleanup_expired_sessions function
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Update reset_failed_logins function
CREATE OR REPLACE FUNCTION reset_failed_logins(p_user_id UUID)
RETURNS VOID 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE users
        SET failed_login_attempts = 0,
            locked_until = NULL,
            last_login = NOW()
    WHERE id = p_user_id;
END;
$$;

-- Update get_db_size function
CREATE OR REPLACE FUNCTION get_db_size()
RETURNS TABLE(
    table_name TEXT,
    size_mb NUMERIC
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        ROUND(pg_total_relation_size(schemaname||'.'||tablename) / 1024.0 / 1024.0, 2) as size_mb
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$;

-- Update get_storage_stats function
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE(
    metric TEXT,
    value TEXT,
    status TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    db_size_mb NUMERIC;
    total_rows INTEGER;
BEGIN
    SELECT pg_database_size(current_database()) / 1024.0 / 1024.0 INTO db_size_mb;
    
    SELECT (
        (SELECT COUNT(*) FROM users) +
        (SELECT COUNT(*) FROM submissions) +
        (SELECT COUNT(*) FROM certificates) +
        (SELECT COUNT(*) FROM payments) +
        (SELECT COUNT(*) FROM user_sessions)
    ) INTO total_rows;
    
    RETURN QUERY VALUES 
        ('database_size_mb', ROUND(db_size_mb, 2)::TEXT, 
         CASE 
            WHEN db_size_mb < 200 THEN '🟢 Good'
            WHEN db_size_mb < 400 THEN '🟡 Monitor'
            ELSE '🔴 Action Needed'
         END),
        ('total_rows', total_rows::TEXT, 
         CASE 
            WHEN total_rows < 50000 THEN '🟢 Good'
            WHEN total_rows < 100000 THEN '🟡 Monitor'
            ELSE '🔴 Action Needed'
         END),
        ('free_tier_usage', ROUND((db_size_mb / 500.0) * 100, 1)::TEXT || '%',
         CASE 
            WHEN db_size_mb < 200 THEN '🟢 Good'
            WHEN db_size_mb < 400 THEN '🟡 Monitor'
            ELSE '🔴 Action Needed'
         END);
END;
$$;

-- Update prune_old_data function
CREATE OR REPLACE FUNCTION prune_old_data()
RETURNS TABLE(
    action TEXT,
    rows_affected INTEGER
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    sessions_deleted INTEGER;
    tokens_cleared INTEGER;
    old_feedback_compressed INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS sessions_deleted = ROW_COUNT;
    
    UPDATE users 
    SET email_verification_token = NULL 
    WHERE email_verification_token IS NOT NULL 
    AND created_at < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS tokens_cleared = ROW_COUNT;
    
    UPDATE submissions 
    SET ai_feedback = jsonb_build_object(
        'score', ai_feedback->>'score',
        'summary', LEFT(ai_feedback->>'summary', 200)
    )
    WHERE ai_feedback IS NOT NULL 
    AND submitted_at < NOW() - INTERVAL '6 months'
    AND jsonb_typeof(ai_feedback) = 'object';
    GET DIAGNOSTICS old_feedback_compressed = ROW_COUNT;
    
    RETURN QUERY VALUES 
        ('expired_sessions_deleted', sessions_deleted),
        ('verification_tokens_cleared', tokens_cleared),
        ('ai_feedback_compressed', old_feedback_compressed);
END;
$$;

-- Update weekly_maintenance function
CREATE OR REPLACE FUNCTION weekly_maintenance()
RETURNS TABLE(
    task TEXT,
    result TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    cleanup_results RECORD;
    storage_stats RECORD;
BEGIN
    FOR cleanup_results IN SELECT * FROM prune_old_data() LOOP
        RETURN QUERY VALUES (cleanup_results.action, cleanup_results.rows_affected::TEXT);
    END LOOP;
    
    ANALYZE;
    RETURN QUERY VALUES ('statistics_updated', 'completed');
    
    SELECT value INTO storage_stats FROM get_storage_stats() WHERE metric = 'database_size_mb';
    RETURN QUERY VALUES ('storage_check', storage_stats::TEXT || ' MB');
END;
$$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verify policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as command
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test functions work
SELECT 'Functions test:' as test;
SELECT generate_student_id('DS') as sample_student_id;
SELECT * FROM get_storage_stats() LIMIT 1;

-- Success message
SELECT '✅ CRITICAL SECURITY FIXES APPLIED SUCCESSFULLY' as status;