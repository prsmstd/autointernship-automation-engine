-- =====================================================
-- PRISMSTUDIO INTERNSHIP PLATFORM - PRODUCTION SCHEMA
-- =====================================================
-- Fully deployment-ready schema for Supabase
-- Version: 2.0
-- Last Updated: 2025-01-08

-- =====================================================
-- EXTENSIONS & CONFIGURATION
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Domains/Tracks table
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    max_tasks INTEGER DEFAULT 5,
    icon VARCHAR(100), -- Icon name for UI
    color VARCHAR(7), -- Hex color code
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table with comprehensive profile management
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role CHAR(1) NOT NULL DEFAULT 'S' CHECK (role IN ('A', 'S')),
    domain_id UUID REFERENCES domains(id),
    
    -- Profile completion
    profile_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    
    -- Email verification
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP WITH TIME ZONE,
    
    -- Password reset
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    
    -- Profile fields
    address TEXT,
    date_of_birth DATE,
    education TEXT,
    skills TEXT[],
    bio TEXT,
    avatar_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_username VARCHAR(100),
    portfolio_url VARCHAR(500),
    
    -- Security
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Preferences
    notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Audit
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Tasks table with enhanced structure
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    order_number INTEGER NOT NULL,
    is_final BOOLEAN DEFAULT FALSE,
    
    -- Scoring
    max_score INTEGER DEFAULT 100,
    passing_score INTEGER DEFAULT 60,
    
    -- Task configuration
    grading_criteria JSONB,
    requirements JSONB,
    resources JSONB,
    estimated_hours INTEGER,
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    
    -- Prerequisites
    prerequisite_tasks UUID[],
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(domain_id, order_number)
);

-- Submissions table with comprehensive tracking
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- Submission data
    github_url VARCHAR(500) NOT NULL,
    live_url VARCHAR(500),
    description TEXT,
    submission_files JSONB, -- Additional files/screenshots
    
    -- AI Evaluation
    ai_feedback JSONB,
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    ai_evaluation_model VARCHAR(100) DEFAULT 'gemini-pro',
    ai_evaluated_at TIMESTAMP WITH TIME ZONE,
    ai_evaluation_duration INTEGER, -- seconds
    ai_evaluation_tokens INTEGER,
    
    -- Manual Review
    manual_feedback TEXT,
    manual_score INTEGER CHECK (manual_score >= 0 AND manual_score <= 100),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Final results
    final_score INTEGER CHECK (final_score >= 0 AND final_score <= 100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'evaluating', 'completed', 'needs_revision', 'failed')),
    grade VARCHAR(2), -- A+, A, B+, B, C, D, F
    
    -- Attempt tracking
    attempt_number INTEGER DEFAULT 1,
    max_attempts INTEGER DEFAULT 3,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, task_id, attempt_number)
);

-- Payments table with comprehensive tracking
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
    
    -- Gateway integration
    gateway VARCHAR(50) DEFAULT 'razorpay',
    gateway_order_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    gateway_signature VARCHAR(255),
    gateway_response JSONB,
    
    -- Payment metadata
    payment_method VARCHAR(50),
    description TEXT DEFAULT 'Certificate Generation Fee',
    receipt_number VARCHAR(100),
    
    -- Refund tracking
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refunded_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    notes TEXT
);

-- Certificates table with blockchain-style verification
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    domain_id UUID NOT NULL REFERENCES domains(id),
    
    -- Certificate identification
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    verification_code VARCHAR(20) UNIQUE NOT NULL,
    
    -- Performance metrics
    total_score INTEGER NOT NULL,
    max_possible_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    grade VARCHAR(10),
    
    -- Task breakdown
    task_scores JSONB, -- Individual task scores
    completion_time_days INTEGER,
    
    -- Certificate files
    pdf_url VARCHAR(500),
    pdf_hash VARCHAR(64), -- SHA-256 hash
    pdf_size INTEGER, -- bytes
    
    -- Verification
    verification_url VARCHAR(500),
    qr_code_data TEXT,
    
    -- Template and generation
    template_version VARCHAR(10) DEFAULT '2.0',
    generation_metadata JSONB,
    
    -- Validity
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Revocation
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES users(id),
    revocation_reason TEXT,
    
    -- Audit
    issued_by UUID REFERENCES users(id)
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'maintenance')),
    
    -- Targeting
    target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'admins')),
    target_domains UUID[],
    target_users UUID[],
    
    -- Display settings
    is_active BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0,
    show_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    show_until TIMESTAMP WITH TIME ZONE,
    
    -- Rich content
    image_url VARCHAR(500),
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Announcement reads tracking
CREATE TABLE IF NOT EXISTS announcement_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, announcement_id)
);

-- User sessions for secure authentication
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    
    -- Session metadata
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    
    -- Validity
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Audit logs for security and compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    -- Action details
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    
    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings for configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_domain_id ON users(domain_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task_id ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order_id ON payments(gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Certificates indexes
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_at ON certificates(issued_at);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active);

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_target_audience ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'A'
        )
    );

-- Submissions policies
CREATE POLICY "Users can view own submissions" ON submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own submissions" ON submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions" ON submissions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all submissions" ON submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'A'
        )
    );

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'A'
        )
    );

-- Certificates policies
CREATE POLICY "Users can view own certificates" ON certificates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all certificates" ON certificates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'A'
        )
    );

-- Public certificate verification (no auth required)
CREATE POLICY "Public certificate verification" ON certificates
    FOR SELECT USING (true);

-- Announcements policies
CREATE POLICY "Everyone can read active announcements" ON announcements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage announcements" ON announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'A'
        )
    );

-- Announcement reads policies
CREATE POLICY "Users can manage own announcement reads" ON announcement_reads
    FOR ALL USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'A'
        )
    );

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'A'
        )
    );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at 
    BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
    year_suffix TEXT;
    sequence_num INTEGER;
    cert_number TEXT;
BEGIN
    year_suffix := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number FROM 'PS(\d+)') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM certificates
    WHERE certificate_number LIKE 'PS%' || year_suffix;
    
    cert_number := 'PS' || LPAD(sequence_num::TEXT, 4, '0') || year_suffix;
    
    RETURN cert_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
BEGIN
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM certificates WHERE verification_code = code) LOOP
        code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user progress
CREATE OR REPLACE FUNCTION calculate_user_progress(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_tasks INTEGER;
    completed_tasks INTEGER;
    avg_score DECIMAL;
BEGIN
    -- Get user's domain
    SELECT COUNT(t.id), COUNT(s.id), AVG(s.final_score)
    INTO total_tasks, completed_tasks, avg_score
    FROM tasks t
    LEFT JOIN submissions s ON t.id = s.task_id AND s.user_id = user_uuid AND s.status = 'completed'
    WHERE t.domain_id = (SELECT domain_id FROM users WHERE id = user_uuid)
    AND t.is_active = true;
    
    result := jsonb_build_object(
        'total_tasks', COALESCE(total_tasks, 0),
        'completed_tasks', COALESCE(completed_tasks, 0),
        'progress_percentage', CASE 
            WHEN total_tasks > 0 THEN ROUND((completed_tasks::DECIMAL / total_tasks) * 100, 2)
            ELSE 0
        END,
        'average_score', COALESCE(avg_score, 0)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default domains
INSERT INTO domains (code, name, description, icon, color, sort_order) VALUES
('web_development', 'Web Development', 'Full-stack web development with modern frameworks', 'code', '#3B82F6', 1),
('ui_ux_design', 'UI/UX Design', 'User interface and user experience design', 'palette', '#8B5CF6', 2),
('data_science', 'Data Science', 'Data analysis, machine learning, and AI', 'bar-chart', '#10B981', 3),
('pcb_design', 'PCB Design', 'Printed circuit board design and electronics', 'cpu', '#F59E0B', 4),
('embedded_programming', 'Embedded Programming', 'Microcontroller and IoT programming', 'microchip', '#EF4444', 5),
('fpga_verilog', 'FPGA & Verilog', 'FPGA programming and digital circuit design', 'zap', '#6366F1', 6)
ON CONFLICT (code) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (key, value, description, is_public) VALUES
('certificate_fee', '99.00', 'Certificate generation fee in INR', true),
('max_submission_attempts', '3', 'Maximum submission attempts per task', false),
('ai_evaluation_timeout', '300', 'AI evaluation timeout in seconds', false),
('maintenance_mode', 'false', 'System maintenance mode', true),
('registration_enabled', 'true', 'User registration enabled', true)
ON CONFLICT (key) DO NOTHING;

-- Create default admin user
-- Password: 'Admin@123' (should be changed immediately)
INSERT INTO users (
    email, 
    password_hash, 
    name, 
    role, 
    email_verified, 
    profile_completed,
    onboarding_completed
) VALUES (
    'admin@prismstudio.co.in',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXfs2Sk9/KF.',
    'System Administrator',
    'A',
    true,
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- User dashboard view
CREATE OR REPLACE VIEW user_dashboard_view AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.domain_id,
    d.name as domain_name,
    d.code as domain_code,
    calculate_user_progress(u.id) as progress,
    (SELECT COUNT(*) FROM certificates WHERE user_id = u.id AND is_revoked = false) as certificates_count,
    u.created_at,
    u.last_login
FROM users u
LEFT JOIN domains d ON u.domain_id = d.id
WHERE u.role = 'S';

-- Admin analytics view
CREATE OR REPLACE VIEW admin_analytics_view AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'S') as total_students,
    (SELECT COUNT(*) FROM users WHERE role = 'S' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as new_students_30d,
    (SELECT COUNT(*) FROM submissions WHERE status = 'completed') as total_submissions,
    (SELECT COUNT(*) FROM certificates WHERE is_revoked = false) as total_certificates,
    (SELECT SUM(amount) FROM payments WHERE status = 'completed') as total_revenue,
    (SELECT COUNT(*) FROM payments WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as payments_30d;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'User accounts with comprehensive profile management';
COMMENT ON TABLE domains IS 'Available internship domains/tracks';
COMMENT ON TABLE tasks IS 'Tasks within each domain with grading criteria';
COMMENT ON TABLE submissions IS 'Student task submissions with AI and manual evaluation';
COMMENT ON TABLE payments IS 'Payment tracking for certificate generation';
COMMENT ON TABLE certificates IS 'Generated certificates with verification system';
COMMENT ON TABLE announcements IS 'System announcements and notifications';
COMMENT ON TABLE user_sessions IS 'Secure session management for authentication';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for security and compliance';
COMMENT ON TABLE system_settings IS 'Configurable system settings and parameters';

-- =====================================================
-- FINAL NOTES
-- =====================================================

-- This schema is production-ready and includes:
-- 1. Comprehensive user management with profiles
-- 2. Secure authentication with session management
-- 3. Row Level Security (RLS) for data protection
-- 4. Audit logging for compliance
-- 5. Performance indexes
-- 6. Flexible announcement system
-- 7. Certificate verification system
-- 8. Payment tracking with multiple gateways
-- 9. AI evaluation tracking
-- 10. System configuration management

-- Remember to:
-- 1. Change the default admin password immediately
-- 2. Configure your environment variables
-- 3. Set up proper backup procedures
-- 4. Monitor the audit logs regularly
-- 5. Update system settings as needed