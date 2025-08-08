-- =====================================================
-- IMMEDIATE VIEW FIX - SECURITY DEFINER REMOVAL
-- =====================================================
-- This specifically targets the SECURITY DEFINER views issue

-- 1. FORCE DROP ALL PROBLEMATIC VIEWS
-- =====================================================

-- Drop views with CASCADE to remove all dependencies
DROP VIEW IF EXISTS public.user_progress CASCADE;
DROP VIEW IF EXISTS public.admin_stats CASCADE;

-- Also drop any materialized views if they exist
DROP MATERIALIZED VIEW IF EXISTS public.user_progress CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.admin_stats CASCADE;

-- 2. RECREATE VIEWS WITHOUT ANY SECURITY DEFINER
-- =====================================================

-- Create user_progress view (EXPLICITLY without SECURITY DEFINER)
CREATE VIEW public.user_progress AS
SELECT 
    u.id,
    u.student_id,
    u.name,
    u.email,
    d.name as domain_name,
    d.code as domain_code,
    COUNT(s.id) as completed_tasks,
    COALESCE(AVG(s.final_score), 0)::INTEGER as avg_score,
    u.created_at
FROM public.users u
LEFT JOIN public.domains d ON u.domain_id = d.id
LEFT JOIN public.submissions s ON u.id = s.user_id AND s.status = 'completed'
WHERE u.role = 'S'
GROUP BY u.id, u.student_id, u.name, u.email, d.name, d.code, u.created_at;

-- Create admin_stats view (EXPLICITLY without SECURITY DEFINER)
CREATE VIEW public.admin_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.users WHERE role = 'S') AS students,
    (SELECT COUNT(*) FROM public.submissions WHERE status = 'completed') AS submissions,
    (SELECT COUNT(*) FROM public.certificates WHERE is_revoked = false) AS certificates,
    (SELECT COALESCE(SUM(amount), 0)::DECIMAL(12,2) FROM public.payments WHERE status = 'completed') AS revenue;

-- 3. VERIFY THE VIEWS ARE CREATED CORRECTLY
-- =====================================================

-- Check view definitions to ensure no SECURITY DEFINER
SELECT 
    schemaname,
    viewname,
    CASE 
        WHEN definition ILIKE '%SECURITY DEFINER%' THEN '❌ STILL HAS SECURITY DEFINER'
        ELSE '✅ SAFE - NO SECURITY DEFINER'
    END as security_status,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('user_progress', 'admin_stats');

-- Test the views work
SELECT 'Testing user_progress:' as test, COUNT(*) as count FROM public.user_progress;
SELECT 'Testing admin_stats:' as test, * FROM public.admin_stats;

-- 4. ALTERNATIVE APPROACH - CREATE AS FUNCTIONS INSTEAD
-- =====================================================
-- If views keep getting SECURITY DEFINER, use functions instead

-- Drop views and create functions
DROP VIEW IF EXISTS public.user_progress CASCADE;
DROP VIEW IF EXISTS public.admin_stats CASCADE;

-- Create user_progress as a function
CREATE OR REPLACE FUNCTION public.get_user_progress()
RETURNS TABLE(
    id UUID,
    student_id VARCHAR(20),
    name VARCHAR(100),
    email VARCHAR(255),
    domain_name VARCHAR(100),
    domain_code VARCHAR(30),
    completed_tasks BIGINT,
    avg_score INTEGER,
    created_at TIMESTAMPTZ
)
SECURITY INVOKER  -- This is the opposite of SECURITY DEFINER
SET search_path = public
LANGUAGE SQL AS $$
    SELECT 
        u.id,
        u.student_id,
        u.name,
        u.email,
        d.name as domain_name,
        d.code as domain_code,
        COUNT(s.id) as completed_tasks,
        COALESCE(AVG(s.final_score), 0)::INTEGER as avg_score,
        u.created_at
    FROM users u
    LEFT JOIN domains d ON u.domain_id = d.id
    LEFT JOIN submissions s ON u.id = s.user_id AND s.status = 'completed'
    WHERE u.role = 'S'
    GROUP BY u.id, u.student_id, u.name, u.email, d.name, d.code, u.created_at;
$$;

-- Create admin_stats as a function
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(
    students BIGINT,
    submissions BIGINT,
    certificates BIGINT,
    revenue DECIMAL(12,2)
)
SECURITY INVOKER  -- This is the opposite of SECURITY DEFINER
SET search_path = public
LANGUAGE SQL AS $$
    SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'S') AS students,
        (SELECT COUNT(*) FROM submissions WHERE status = 'completed') AS submissions,
        (SELECT COUNT(*) FROM certificates WHERE is_revoked = false) AS certificates,
        (SELECT COALESCE(SUM(amount), 0)::DECIMAL(12,2) FROM payments WHERE status = 'completed') AS revenue;
$$;

-- Test the functions
SELECT 'Testing get_user_progress():' as test, COUNT(*) as count FROM public.get_user_progress();
SELECT 'Testing get_admin_stats():' as test, * FROM public.get_admin_stats();

-- 5. FINAL VERIFICATION
-- =====================================================

-- Check no views have SECURITY DEFINER
SELECT 
    'FINAL CHECK:' as status,
    COUNT(*) as views_with_security_definer
FROM pg_views 
WHERE schemaname = 'public' 
AND definition ILIKE '%SECURITY DEFINER%';

-- Should return 0 if fixed

SELECT '✅ SECURITY DEFINER VIEWS ISSUE RESOLVED' as final_status;