-- Production-ready database schema for PrismStudio Internship Platform

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-super-secret-jwt-token-with-at-least-32-characters';

-- Users table with proper role management
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hashed password
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role CHAR(1) NOT NULL DEFAULT 'S' CHECK (role IN ('A', 'S')), -- A=Admin, S=Student
    domain VARCHAR(50), -- web_development, ui_ux_design, data_science, etc.
    profile_completed BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional profile fields
    address TEXT,
    date_of_birth DATE,
    education TEXT,
    skills TEXT,
    bio TEXT,
    
    -- Security fields
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_domain ON users(domain);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Domains/Tracks table
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- web_development, ui_ux_design, etc.
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    max_tasks INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    order_number INTEGER NOT NULL,
    is_final BOOLEAN DEFAULT FALSE,
    max_score INTEGER DEFAULT 100,
    grading_criteria JSONB, -- Structured grading criteria
    requirements JSONB, -- Task requirements and deliverables
    resources JSONB, -- Learning resources and links
    estimated_hours INTEGER,
    difficulty_level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(domain_id, order_number)
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    github_url VARCHAR(500) NOT NULL,
    live_url VARCHAR(500), -- Optional live demo URL
    description TEXT, -- Student's description of their work
    
    -- AI Evaluation
    ai_feedback JSONB, -- Structured AI feedback
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    ai_evaluation_model VARCHAR(100), -- Which AI model was used
    ai_evaluated_at TIMESTAMP WITH TIME ZONE,
    
    -- Manual Review (optional)
    manual_feedback TEXT,
    manual_score INTEGER CHECK (manual_score >= 0 AND manual_score <= 100),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Final scores
    final_score INTEGER CHECK (final_score >= 0 AND final_score <= 100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'evaluating', 'completed', 'needs_revision')),
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate submissions
    UNIQUE(user_id, task_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    
    -- Payment gateway details
    gateway VARCHAR(50), -- razorpay, stripe, etc.
    gateway_order_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    gateway_signature VARCHAR(255),
    gateway_response JSONB, -- Full gateway response
    
    -- Payment metadata
    payment_method VARCHAR(50), -- card, upi, netbanking, etc.
    description TEXT DEFAULT 'Certificate Generation Fee',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    notes TEXT
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    
    -- Certificate details
    certificate_number VARCHAR(50) UNIQUE NOT NULL, -- Human-readable cert number
    domain_id UUID NOT NULL REFERENCES domains(id),
    
    -- Performance metrics
    total_score INTEGER NOT NULL,
    max_possible_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    grade VARCHAR(10), -- A+, A, B+, B, C
    
    -- Certificate files
    pdf_url VARCHAR(500), -- S3/CDN URL to PDF
    pdf_hash VARCHAR(64), -- SHA-256 hash for integrity
    
    -- Verification
    verification_code VARCHAR(20) UNIQUE NOT NULL, -- Short code for public verification
    verification_url VARCHAR(500), -- Public verification URL
    
    -- Metadata
    template_version VARCHAR(10) DEFAULT '1.0',
    generation_metadata JSONB, -- Template used, generation params, etc.
    
    -- Timestamps
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiry
    
    -- Audit
    issued_by UUID REFERENCES users(id),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES users(id),
    revocation_reason TEXT
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'admins')),
    target_domain VARCHAR(50), -- Optional: target specific domain
    
    -- Display settings
    is_active BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE,
    show_until TIMESTAMP WITH TIME ZONE,
    
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

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- login, logout, submit_task, etc.
    resource_type VARCHAR(50), -- user, task, submission, etc.
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for secure session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY users_own_data ON users
    FOR ALL USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'A');

-- Students can only see their own submissions
CREATE POLICY submissions_own_data ON submissions
    FOR ALL USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'A');

-- Students can only see their own payments
CREATE POLICY payments_own_data ON payments
    FOR ALL USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'A');

-- Students can only see their own certificates
CREATE POLICY certificates_own_data ON certificates
    FOR ALL USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'A');

-- Everyone can read active announcements
CREATE POLICY announcements_read_all ON announcements
    FOR SELECT USING (is_active = true);

-- Only admins can manage announcements
CREATE POLICY announcements_admin_manage ON announcements
    FOR ALL USING (auth.jwt() ->> 'role' = 'A');

-- Users can manage their own announcement reads
CREATE POLICY announcement_reads_own ON announcement_reads
    FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own sessions
CREATE POLICY sessions_own_data ON user_sessions
    FOR ALL USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'A');

-- Insert default domains
INSERT INTO domains (code, name, description) VALUES
('web_development', 'Web Development', 'Full-stack web development with modern frameworks'),
('ui_ux_design', 'UI/UX Design', 'User interface and user experience design'),
('data_science', 'Data Science', 'Data analysis, machine learning, and AI'),
('pcb_design', 'PCB Design', 'Printed circuit board design and electronics'),
('embedded_programming', 'Embedded Programming', 'Microcontroller and IoT programming'),
('fpga_verilog', 'FPGA & Verilog', 'FPGA programming and digital circuit design')
ON CONFLICT (code) DO NOTHING;

-- Create default admin user (password should be changed immediately)
-- Password: 'admin123' hashed with bcrypt
INSERT INTO users (email, password_hash, name, role, email_verified) VALUES
('admin@prismstudio.co.in', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXfs2Sk9/KF.', 'System Administrator', 'A', true)
ON CONFLICT (email) DO NOTHING;

-- Functions for common operations

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
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

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON COLUMN users.role IS 'A=Admin, S=Student';
COMMENT ON TABLE submissions IS 'Student task submissions with AI and manual evaluation';
COMMENT ON TABLE certificates IS 'Generated certificates with verification system';
COMMENT ON TABLE user_sessions IS 'Secure session management for authentication';