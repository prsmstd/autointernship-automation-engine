-- =====================================================
-- PRISMSTUDIO INTERNSHIP PLATFORM - FREE TIER OPTIMIZED
-- =====================================================
-- Optimized for Supabase Free Tier (500MB storage limit)
-- Maintains full functionality with efficient storage
-- Version: 2.1-FreeTier
-- Last Updated: 2025-01-08

-- =====================================================
-- EXTENSIONS (Minimal Required)
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- OPTIMIZED CORE TABLES
-- =====================================================

-- Domains table (minimal storage)
CREATE TABLE domains (
    id SMALLSERIAL PRIMARY KEY, -- Use SMALLSERIAL instead of UUID
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500), -- Reduced from TEXT
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (storage optimized)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL, -- Reduced from 255
    phone VARCHAR(15), -- Reduced from 20
    role CHAR(1) NOT NULL DEFAULT 'S' CHECK (role IN ('A', 'S')),
    domain_id SMALLINT REFERENCES domains(id),
    
    -- Student ID (auto-generated for students)
    student_id VARCHAR(20) UNIQUE, -- Format: PS2506DS148 (PS-Year-Month-Course-Number)
    
    -- Essential profile fields only
    profile_completed BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(100), -- Reduced from 255
    
    -- Security (minimal)
    failed_login_attempts SMALLINT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table (optimized)
CREATE TABLE tasks (
    id SMALLSERIAL PRIMARY KEY,
    domain_id SMALLINT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL, -- Reduced from 255
    description TEXT NOT NULL,
    order_number SMALLINT NOT NULL,
    is_final BOOLEAN DEFAULT FALSE,
    max_score SMALLINT DEFAULT 100,
    
    -- Simplified requirements (JSON instead of separate fields)
    requirements JSONB,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(domain_id, order_number)
);

-- Submissions table (highly optimized)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id SMALLINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- Essential submission data
    github_url VARCHAR(300) NOT NULL, -- Reduced from 500
    live_url VARCHAR(300), -- Reduced from 500
    description VARCHAR(1000), -- Limited description
    
    -- AI Evaluation (optimized)
    ai_feedback JSONB, -- Compressed feedback
    ai_score SMALLINT CHECK (ai_score >= 0 AND ai_score <= 100),
    ai_evaluated_at TIMESTAMPTZ,
    
    -- Final results
    final_score SMALLINT CHECK (final_score >= 0 AND final_score <= 100),
    status VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('pending', 'evaluating', 'completed', 'needs_revision')),
    
    -- Timestamps
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, task_id)
);

-- Payments table (essential fields only)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(6,2) NOT NULL, -- Reduced precision
    status VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    
    -- Gateway essentials
    gateway_order_id VARCHAR(100), -- Reduced from 255
    gateway_payment_id VARCHAR(100), -- Reduced from 255
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Certificates table (optimized)
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    domain_id SMALLINT NOT NULL REFERENCES domains(id),
    
    -- Certificate identification
    certificate_number VARCHAR(20) UNIQUE NOT NULL, -- Reduced from 50
    verification_code VARCHAR(10) UNIQUE NOT NULL, -- Reduced from 20
    
    -- Performance metrics
    total_score SMALLINT NOT NULL,
    max_possible_score SMALLINT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    
    -- Certificate file
    pdf_url VARCHAR(300), -- Reduced from 500
    
    -- Timestamps
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Revocation (simplified)
    is_revoked BOOLEAN DEFAULT FALSE
);

-- Announcements table (minimal)
CREATE TABLE announcements (
    id SMALLSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL, -- Reduced from 255
    content VARCHAR(1000) NOT NULL, -- Limited content
    type VARCHAR(10) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    target_audience VARCHAR(10) DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'admins')),
    
    is_active BOOLEAN DEFAULT TRUE,
    show_until TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

-- User sessions (essential only)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(100) UNIQUE NOT NULL, -- Reduced from 255
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- System settings (minimal)
CREATE TABLE system_settings (
    key VARCHAR(50) PRIMARY KEY, -- Use key as primary key
    value VARCHAR(200) NOT NULL, -- Reduced from JSONB
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ESSENTIAL INDEXES ONLY
-- =====================================================

-- Users (most critical)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_domain_id ON users(domain_id);
CREATE INDEX idx_users_student_id ON users(student_id);

-- Submissions (query heavy)
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_task_id ON submissions(task_id);
CREATE INDEX idx_submissions_status ON submissions(status);

-- Certificates (verification queries)
CREATE INDEX idx_certificates_verification_code ON certificates(verification_code);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);

-- Sessions (authentication)
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);

-- =====================================================
-- SIMPLIFIED RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Simple policies (reduced complexity)
CREATE POLICY "users_policy" ON users FOR ALL USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'A')
);

CREATE POLICY "submissions_policy" ON submissions FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'A')
);

CREATE POLICY "payments_policy" ON payments FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'A')
);

CREATE POLICY "certificates_policy" ON certificates FOR SELECT USING (true); -- Public verification

CREATE POLICY "sessions_policy" ON user_sessions FOR ALL USING (
    auth.uid() = user_id
);

-- =====================================================
-- ESSENTIAL FUNCTIONS ONLY
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add essential triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Student ID generator (PS-Year-Month-Course-Number format)
CREATE OR REPLACE FUNCTION generate_student_id(domain_code TEXT)
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    sequence_num INTEGER;
    student_id TEXT;
BEGIN
    -- Get current year and month (e.g., "2506" for June 2025)
    year_month := TO_CHAR(NOW(), 'YYMM');
    
    -- Get next sequence number for this domain and month
    SELECT COALESCE(MAX(CAST(SUBSTRING(student_id FROM domain_code || '(\d+)$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM users
    WHERE student_id LIKE 'PS' || year_month || domain_code || '%'
    AND role = 'S';
    
    -- Format: PS + YearMonth + DomainCode + SequenceNumber
    student_id := 'PS' || year_month || domain_code || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN student_id;
END;
$$ LANGUAGE plpgsql;

-- Certificate number generator (same format as student ID)
CREATE OR REPLACE FUNCTION generate_cert_number(user_student_id TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Use the student ID as certificate number for consistency
    RETURN user_student_id;
END;
$$ LANGUAGE plpgsql;

-- Verification code generator (simplified)
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
BEGIN
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    WHILE EXISTS (SELECT 1 FROM certificates WHERE verification_code = code) LOOP
        code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate student ID for new students
CREATE OR REPLACE FUNCTION auto_generate_student_id()
RETURNS TRIGGER AS $$
DECLARE
    domain_code TEXT;
BEGIN
    -- Only generate for students with a domain
    IF NEW.role = 'S' AND NEW.domain_id IS NOT NULL AND NEW.student_id IS NULL THEN
        -- Get domain code
        SELECT code INTO domain_code FROM domains WHERE id = NEW.domain_id;
        
        -- Generate student ID
        NEW.student_id := generate_student_id(domain_code);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for student ID generation
CREATE TRIGGER generate_student_id_trigger
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION auto_generate_student_id();

-- =====================================================
-- OPTIMIZED DEFAULT DATA
-- =====================================================

-- Insert domains (minimal data)
INSERT INTO domains (code, name, description) VALUES
('WD', 'Web Development', 'Full-stack web development'),
('UD', 'UI/UX Design', 'User interface design'),
('DS', 'Data Science', 'Data analysis and ML'),
('PD', 'PCB Design', 'Circuit board design'),
('EP', 'Embedded Systems', 'Microcontroller programming'),
('FV', 'FPGA & Verilog', 'Digital circuit design')
ON CONFLICT (code) DO NOTHING;

-- Default admin (change password immediately)
INSERT INTO users (email, password_hash, name, role, email_verified, profile_completed) VALUES
('admin@prismstudio.co.in', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXfs2Sk9/KF.', 'Admin', 'A', true, true)
ON CONFLICT (email) DO NOTHING;

-- Essential system settings
INSERT INTO system_settings (key, value) VALUES
('cert_fee', '99.00'),
('max_attempts', '3'),
('maintenance', 'false')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STORAGE OPTIMIZATION VIEWS
-- =====================================================

-- Efficient user dashboard view
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

-- Admin stats view
CREATE VIEW admin_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'S') as students,
    (SELECT COUNT(*) FROM submissions WHERE status = 'completed') as submissions,
    (SELECT COUNT(*) FROM certificates WHERE is_revoked = false) as certificates,
    (SELECT SUM(amount::INTEGER) FROM payments WHERE status = 'completed') as revenue;

-- =====================================================
-- MAINTENANCE FUNCTIONS
-- =====================================================

-- Clean old sessions (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Database size monitoring
CREATE OR REPLACE FUNCTION get_db_size()
RETURNS TABLE(
    table_name TEXT,
    size_mb NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        ROUND(pg_total_relation_size(schemaname||'.'||tablename) / 1024.0 / 1024.0, 2) as size_mb
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON DATABASE postgres IS 'PrismStudio Internship Platform - Free Tier Optimized';
COMMENT ON TABLE users IS 'User accounts - optimized for storage efficiency';
COMMENT ON TABLE submissions IS 'Task submissions with compressed AI feedback';
COMMENT ON TABLE certificates IS 'Certificates with minimal storage footprint';

-- =====================================================
-- OPTIMIZATION NOTES
-- =====================================================

/*
STORAGE OPTIMIZATIONS APPLIED:

1. Data Types:
   - UUID only where necessary (users, submissions, payments, certificates)
   - SMALLSERIAL for domains and tasks (saves 4 bytes per row)
   - SMALLINT for scores and counts (saves 2 bytes per row)
   - Reduced VARCHAR lengths based on actual usage
   - Limited TEXT fields to essential ones only

2. Indexes:
   - Only essential indexes for query performance
   - Removed redundant composite indexes
   - Focus on most queried columns

3. Tables:
   - Removed audit_logs table (use Supabase built-in logging)
   - Simplified announcement_reads (track in application)
   - Merged related fields into JSONB where appropriate
   - Removed optional profile fields

4. Functions:
   - Simplified certificate generation
   - Removed complex analytics functions
   - Essential triggers only

5. RLS Policies:
   - Simplified policy logic
   - Reduced policy count
   - More efficient policy checks

ESTIMATED STORAGE SAVINGS:
- ~60% reduction in storage usage
- Maintains full functionality
- Optimized for <100MB database size
- Suitable for 1000+ users on free tier

MONITORING:
- Use get_db_size() function to monitor table sizes
- Run cleanup_expired_sessions() weekly
- Monitor with: SELECT * FROM get_db_size();
*/
-- =====
====================
-- FreeTier v2.1 – Hardening Patch
-- =========================

-- 1) Extensions: needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Safer revenue calc in admin_stats (DECIMAL not INTEGER)
DROP VIEW IF EXISTS admin_stats;
CREATE VIEW admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'S')                  AS students,
  (SELECT COUNT(*) FROM submissions WHERE status = 'completed')  AS submissions,
  (SELECT COUNT(*) FROM certificates WHERE is_revoked = false)   AS certificates,
  (SELECT COALESCE(SUM(amount), 0)::DECIMAL(12,2) 
     FROM payments WHERE status = 'completed')                   AS revenue;

-- 3) Timestamp triggers for more tables (keeps "updated_at" honest)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_tasks_updated_at'
  ) THEN
    CREATE TRIGGER update_tasks_updated_at
      BEFORE UPDATE ON tasks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at'
  ) THEN
    -- Add updated_at column to payments if not exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'payments' AND column_name = 'updated_at'
    ) THEN
      ALTER TABLE payments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    CREATE TRIGGER update_payments_updated_at
      BEFORE UPDATE ON payments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END$$;

-- 4) Student-ID generator: faster & deterministic (uses RIGHT(...,3))
--    Format: PSYYMM<DOMAIN><###>
DROP FUNCTION IF EXISTS generate_student_id(TEXT);
CREATE OR REPLACE FUNCTION generate_student_id(domain_code TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- 5) Cert number/verification code: ensure proper lengths
ALTER TABLE certificates
  ALTER COLUMN certificate_number TYPE VARCHAR(20),
  ALTER COLUMN verification_code TYPE VARCHAR(10);

-- 6) Tighten FK behavior (no accidental cascades on paid certs)
ALTER TABLE certificates
  DROP CONSTRAINT IF EXISTS certificates_payment_id_fkey,
  ADD CONSTRAINT certificates_payment_id_fkey
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

-- 7) Login lock hygiene: small helper to reset failed attempts on success
DROP FUNCTION IF EXISTS reset_failed_logins(UUID);
CREATE OR REPLACE FUNCTION reset_failed_logins(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users
     SET failed_login_attempts = 0,
         locked_until = NULL,
         last_login = NOW()
   WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 8) Useful extra indexes (tiny but effective on Free tier)
DO $$
BEGIN
  -- tasks by domain & order
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_domain_order') THEN
    CREATE INDEX idx_tasks_domain_order ON tasks(domain_id, order_number);
  END IF;

  -- payments by status then created_at (reporting)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_status_created') THEN
    CREATE INDEX idx_payments_status_created ON payments(status, created_at);
  END IF;

  -- certs by domain & issued_at (verification export)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_certificates_domain_issued') THEN
    CREATE INDEX idx_certificates_domain_issued ON certificates(domain_id, issued_at);
  END IF;
END$$;

-- 9) Data pruning function for Free tier storage management
CREATE OR REPLACE FUNCTION prune_old_data()
RETURNS TABLE(
    action TEXT,
    rows_affected INTEGER
) AS $$
DECLARE
    sessions_deleted INTEGER;
    tokens_cleared INTEGER;
    old_feedback_compressed INTEGER;
BEGIN
    -- Clean expired sessions (older than 30 days)
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS sessions_deleted = ROW_COUNT;
    
    -- Clear old verification tokens
    UPDATE users 
    SET email_verification_token = NULL 
    WHERE email_verification_token IS NOT NULL 
    AND created_at < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS tokens_cleared = ROW_COUNT;
    
    -- Compress old AI feedback (keep only essential data)
    UPDATE submissions 
    SET ai_feedback = jsonb_build_object(
        'score', ai_feedback->>'score',
        'summary', LEFT(ai_feedback->>'summary', 200)
    )
    WHERE ai_feedback IS NOT NULL 
    AND submitted_at < NOW() - INTERVAL '6 months'
    AND jsonb_typeof(ai_feedback) = 'object';
    GET DIAGNOSTICS old_feedback_compressed = ROW_COUNT;
    
    -- Return results
    RETURN QUERY VALUES 
        ('expired_sessions_deleted', sessions_deleted),
        ('verification_tokens_cleared', tokens_cleared),
        ('ai_feedback_compressed', old_feedback_compressed);
END;
$$ LANGUAGE plpgsql;

-- 10) Storage monitoring function (enhanced)
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE(
    metric TEXT,
    value TEXT,
    status TEXT
) AS $$
DECLARE
    db_size_mb NUMERIC;
    total_rows INTEGER;
BEGIN
    -- Get database size in MB
    SELECT pg_database_size(current_database()) / 1024.0 / 1024.0 INTO db_size_mb;
    
    -- Get total row count
    SELECT (
        (SELECT COUNT(*) FROM users) +
        (SELECT COUNT(*) FROM submissions) +
        (SELECT COUNT(*) FROM certificates) +
        (SELECT COUNT(*) FROM payments) +
        (SELECT COUNT(*) FROM user_sessions)
    ) INTO total_rows;
    
    -- Return metrics with status
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
$$ LANGUAGE plpgsql;

-- 11) Automated maintenance scheduler (call this weekly)
CREATE OR REPLACE FUNCTION weekly_maintenance()
RETURNS TABLE(
    task TEXT,
    result TEXT
) AS $$
DECLARE
    cleanup_results RECORD;
    storage_stats RECORD;
BEGIN
    -- Run data pruning
    FOR cleanup_results IN SELECT * FROM prune_old_data() LOOP
        RETURN QUERY VALUES (cleanup_results.action, cleanup_results.rows_affected::TEXT);
    END LOOP;
    
    -- Update statistics
    ANALYZE;
    RETURN QUERY VALUES ('statistics_updated', 'completed');
    
    -- Check storage status
    SELECT value INTO storage_stats FROM get_storage_stats() WHERE metric = 'database_size_mb';
    RETURN QUERY VALUES ('storage_check', storage_stats::TEXT || ' MB');
END;
$$ LANGUAGE plpgsql;

-- =========================
-- PRODUCTION SAFETY CHECKS
-- =========================

-- Verify critical functions exist
DO $$
BEGIN
    -- Check if gen_random_uuid works
    PERFORM gen_random_uuid();
    RAISE NOTICE '✅ gen_random_uuid() working';
    
    -- Check student ID generation
    PERFORM generate_student_id('DS');
    RAISE NOTICE '✅ Student ID generation working';
    
    -- Check storage monitoring
    PERFORM get_storage_stats();
    RAISE NOTICE '✅ Storage monitoring working';
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION '❌ Production safety check failed: %', SQLERRM;
END$$;

-- =========================
-- FINAL OPTIMIZATIONS
-- =========================

-- Vacuum and analyze for optimal performance
VACUUM ANALYZE;

-- Final storage report
SELECT 
    '🎯 Production-Ready Schema Deployed' as status,
    pg_size_pretty(pg_database_size(current_database())) as database_size,
    (SELECT COUNT(*) FROM users WHERE role = 'S') as students_ready,
    (SELECT COUNT(*) FROM domains) as domains_active;

COMMENT ON DATABASE postgres IS 'PrismStudio Internship Platform - Production Hardened v2.1';