-- Internship Automation Engine Database Schema (Enhanced)
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Enhanced with domain support and profile fields)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT, -- For profile display
  email TEXT NOT NULL UNIQUE,
  phone VARCHAR(20),
  address VARCHAR(500),
  date_of_birth DATE,
  education VARCHAR(200),
  skills VARCHAR(300),
  bio VARCHAR(1000),
  domain VARCHAR(30), -- Domain of internship (ui_ux_design, web_development, data_science, etc.)
  role VARCHAR(10) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table (Enhanced with domain support)
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  domain VARCHAR(30) NOT NULL, -- Domain this task belongs to
  order_number SMALLINT NOT NULL,
  is_final BOOLEAN DEFAULT FALSE,
  max_score SMALLINT DEFAULT 100,
  grading_criteria TEXT NOT NULL, -- Detailed grading criteria as text
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(domain, order_number) -- Ensure unique ordering per domain
);

-- Submissions table (Enhanced with better AI feedback structure)
CREATE TABLE public.submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  task_id UUID REFERENCES public.tasks(id) NOT NULL,
  github_link TEXT NOT NULL,
  ai_feedback JSONB, -- Structured AI feedback
  score FLOAT,
  analysis_type VARCHAR(50), -- Type of analysis performed (code_analysis, ui_ux_analysis, etc.)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'evaluated', 'approved')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  evaluated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, task_id)
);

-- Payments table (Enhanced with better tracking)
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  amount INTEGER NOT NULL, -- Amount in paise (₹99 = 9900 paise)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(200),
  payment_method VARCHAR(20), -- card, netbanking, upi, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificates table (Enhanced with blockchain-ready verification)
CREATE TABLE public.certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL UNIQUE,
  certificate_id VARCHAR(20) NOT NULL UNIQUE, -- PS2506DS148 format
  student_id VARCHAR(20), -- College student ID if provided
  pdf_url VARCHAR(500) NOT NULL,
  cert_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA256 hash for verification
  metadata JSONB, -- Student name, final task title, etc.
  verification_url VARCHAR(100), -- Public verification URL
  cert_type VARCHAR(20) DEFAULT 'standard' CHECK (cert_type IN ('standard', 'best_performer')),
  grade VARCHAR(5), -- A+, A, B+, etc.
  project_title VARCHAR(200),
  supervisor_name VARCHAR(100),
  supervisor_email VARCHAR(100),
  skills JSONB, -- Array of skills covered
  duration_months INTEGER DEFAULT 2,
  completion_date DATE,
  is_verified BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements table (For admin announcements to students)
CREATE TABLE public.announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  target_domain VARCHAR(30), -- Optional: target specific domain students
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcement_reads table to track which users have read which announcements
CREATE TABLE public.announcement_reads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- Verification logs table for security and audit
CREATE TABLE public.verification_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  certificate_id VARCHAR(20) NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  verification_hash VARCHAR(64),
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  request_method VARCHAR(10),
  country_code VARCHAR(2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate limiting table
CREATE TABLE public.rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address INET NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ip_address, endpoint)
);

-- Institutions table for college partnerships
CREATE TABLE public.institutions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20) UNIQUE,
  type VARCHAR(50), -- university, college, institute
  address TEXT,
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  website VARCHAR(200),
  is_active BOOLEAN DEFAULT TRUE,
  partnership_level VARCHAR(20) DEFAULT 'basic', -- basic, premium, enterprise
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table for enhanced security
CREATE TABLE public.user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create essential indexes only (optimized for storage)
CREATE INDEX idx_users_domain ON public.users(domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_submissions_user_task ON public.submissions(user_id, task_id);
CREATE INDEX idx_payments_user_status ON public.payments(user_id, status);
CREATE INDEX idx_certificates_cert_id ON public.certificates(certificate_id);
CREATE INDEX idx_certificates_hash ON public.certificates(cert_hash);
CREATE INDEX idx_announcements_active_created ON public.announcements(is_active, created_at DESC) WHERE is_active = true;
CREATE INDEX idx_announcement_reads_user_announcement ON public.announcement_reads(user_id, announcement_id);
CREATE INDEX idx_verification_logs_cert_id ON public.verification_logs(certificate_id);
CREATE INDEX idx_verification_logs_ip_time ON public.verification_logs(ip_address, verified_at);
CREATE INDEX idx_rate_limits_ip_endpoint ON public.rate_limits(ip_address, endpoint);
CREATE INDEX idx_rate_limits_window ON public.rate_limits(window_start) WHERE blocked_until IS NULL;
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token) WHERE is_active = true;
CREATE INDEX idx_user_sessions_user_active ON public.user_sessions(user_id, is_active, expires_at);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tasks policies (public read access for authenticated users)
CREATE POLICY "Everyone can read tasks" ON public.tasks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage tasks" ON public.tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Submissions policies
CREATE POLICY "Users can read own submissions" ON public.submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own submissions" ON public.submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions" ON public.submissions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all submissions" ON public.submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payments policies
CREATE POLICY "Users can read own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Certificates policies
CREATE POLICY "Certificates are publicly readable" ON public.certificates
  FOR SELECT USING (true); -- Public verification access

CREATE POLICY "Users can read own certificates" ON public.certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage certificates" ON public.certificates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Announcements policies
CREATE POLICY "Students can read active announcements" ON public.announcements
  FOR SELECT USING (
    is_active = true AND 
    (target_domain IS NULL OR target_domain = (
      SELECT domain FROM public.users WHERE id = auth.uid()
    ))
  );

CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Announcement reads policies
CREATE POLICY "Users can view their own reads" ON public.announcement_reads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark announcements as read" ON public.announcement_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reads" ON public.announcement_reads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reads" ON public.announcement_reads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate certificate ID
CREATE OR REPLACE FUNCTION generate_certificate_id(user_domain TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  cert_id TEXT;
  domain_code TEXT;
  year_month TEXT;
  sequence_num INTEGER;
BEGIN
  -- Get year and month (e.g., 2506 for June 2025)
  year_month := TO_CHAR(NOW(), 'YYMM');
  
  -- Map domain to code
  domain_code := CASE 
    WHEN user_domain = 'web_development' THEN 'WEB'
    WHEN user_domain = 'ui_ux_design' THEN 'UI'
    WHEN user_domain = 'data_science' THEN 'DS'
    WHEN user_domain = 'pcb_design' THEN 'PCB'
    WHEN user_domain = 'embedded_programming' THEN 'EMB'
    WHEN user_domain = 'fpga_verilog' THEN 'FPGA'
    ELSE 'GEN'
  END;
  
  -- Get next sequence number for this domain and month
  SELECT COALESCE(MAX(CAST(RIGHT(certificate_id, 3) AS INTEGER)), 100) + 1
  INTO sequence_num
  FROM public.certificates 
  WHERE certificate_id LIKE 'PS' || year_month || domain_code || '%';
  
  -- Format: PS2506DS148 (PS + YYMM + DOMAIN + XXX)
  cert_id := 'PS' || year_month || domain_code || LPAD(sequence_num::TEXT, 3, '0');
  
  -- Ensure uniqueness (fallback)
  WHILE EXISTS (SELECT 1 FROM public.certificates WHERE certificate_id = cert_id) LOOP
    sequence_num := sequence_num + 1;
    cert_id := 'PS' || year_month || domain_code || LPAD(sequence_num::TEXT, 3, '0');
  END LOOP;
  
  RETURN cert_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate certificate hash
CREATE OR REPLACE FUNCTION generate_cert_hash(user_id UUID, cert_id TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(user_id::TEXT || cert_id || NOW()::TEXT, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate certificate data
CREATE OR REPLACE FUNCTION set_certificate_data()
RETURNS TRIGGER AS $$
DECLARE
  user_domain_val TEXT;
BEGIN
  -- Get user's domain
  SELECT domain INTO user_domain_val FROM public.users WHERE id = NEW.user_id;
  
  IF NEW.certificate_id IS NULL THEN
    NEW.certificate_id := generate_certificate_id(user_domain_val);
  END IF;
  IF NEW.cert_hash IS NULL THEN
    NEW.cert_hash := generate_cert_hash(NEW.user_id, NEW.certificate_id);
  END IF;
  IF NEW.verification_url IS NULL THEN
    NEW.verification_url := 'https://www.prismstudio.co.in/verification?cert=' || NEW.certificate_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_certificate_data
  BEFORE INSERT ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION set_certificate_data();

-- Insert comprehensive task data for all domains
INSERT INTO public.tasks (title, description, domain, order_number, is_final, grading_criteria, max_score) VALUES
-- Web Development Tasks
('Responsive Landing Page', 'Create a modern, responsive landing page using HTML, CSS, and JavaScript. The page should include navigation, hero section, features, and contact form with mobile-first design approach.', 'web_development', 1, false, 'HTML Structure and Semantics (20%), CSS Styling and Responsiveness (30%), JavaScript Functionality (25%), Design Quality and UX (15%), Code Organization and Best Practices (10%)', 100),
('Interactive Web Application', 'Build a dynamic web application with CRUD operations, local storage functionality, and user interactions. Examples: Todo app, expense tracker, or inventory management system.', 'web_development', 2, false, 'Core Functionality (35%), Code Quality and Structure (25%), User Interface and Experience (20%), Error Handling and Validation (10%), Documentation and Setup (10%)', 100),
('API Integration Project', 'Develop a web application that integrates with external APIs, handles asynchronous operations, and displays dynamic data. Examples: Weather app, news aggregator, or cryptocurrency tracker.', 'web_development', 3, false, 'API Integration and Data Handling (30%), Asynchronous Programming (25%), User Interface Design (20%), Error Handling and Edge Cases (15%), Performance and Optimization (10%)', 100),
('Full-Stack Web Application', 'Create a complete web application with both frontend and backend components, database integration, and user authentication if applicable.', 'web_development', 4, false, 'Frontend Implementation (25%), Backend Logic (25%), Database Design and Integration (20%), Security and Authentication (15%), Overall Architecture (15%)', 100),
('Advanced Web Project', 'Develop a complex web application showcasing advanced concepts like state management, routing, testing, or deployment. Should demonstrate mastery of web development principles.', 'web_development', 5, true, 'Technical Complexity (30%), Code Quality and Architecture (25%), Feature Completeness (20%), Testing and Documentation (15%), Innovation and Creativity (10%)', 100),

-- UI/UX Design Tasks
('Mobile App Wireframes and Prototypes', 'Design comprehensive wireframes and interactive prototypes for a mobile application. Include user personas, user journey mapping, and complete user flow documentation.', 'ui_ux_design', 1, false, 'Design Quality and Visual Hierarchy (25%), User Experience and Flow (25%), Wireframe Completeness (20%), Prototype Interactivity (15%), Documentation and Presentation (15%)', 100),
('Website Redesign Project', 'Redesign an existing website focusing on improved user experience, accessibility, and modern design principles. Include before/after comparisons and design rationale.', 'ui_ux_design', 2, false, 'Design Improvement and Innovation (30%), User Experience Enhancement (25%), Visual Design Quality (20%), Accessibility Considerations (15%), Design Process Documentation (10%)', 100),
('Design System Creation', 'Create a comprehensive design system including color palettes, typography, components, icons, and style guides. Should be suitable for a digital product or brand.', 'ui_ux_design', 3, false, 'Design System Completeness (30%), Component Quality and Consistency (25%), Documentation and Guidelines (20%), Visual Design Excellence (15%), Usability and Implementation (10%)', 100),
('User Research and Testing Project', 'Conduct user research, create personas, design solutions based on findings, and document the complete UX research process with actionable insights.', 'ui_ux_design', 4, false, 'Research Methodology (25%), Data Analysis and Insights (25%), Design Solutions Based on Research (20%), Documentation Quality (15%), Presentation and Communication (15%)', 100),
('Complete Product Design', 'Design a complete digital product from concept to high-fidelity prototypes, including user research, information architecture, wireframes, and final designs.', 'ui_ux_design', 5, true, 'Concept and Strategy (20%), Information Architecture (20%), Visual Design Quality (25%), Prototype Functionality (20%), Overall Design Process (15%)', 100),

-- Data Science Tasks
('Exploratory Data Analysis', 'Perform comprehensive exploratory data analysis on a provided or chosen dataset. Include data cleaning, statistical analysis, visualizations, and actionable insights.', 'data_science', 1, false, 'Data Cleaning and Preprocessing (25%), Statistical Analysis (25%), Data Visualization Quality (25%), Insights and Conclusions (15%), Code Quality and Documentation (10%)', 100),
('Machine Learning Classification', 'Build and evaluate a machine learning classification model. Include feature engineering, model selection, hyperparameter tuning, and performance evaluation.', 'data_science', 2, false, 'Model Implementation (30%), Feature Engineering (20%), Model Evaluation and Validation (25%), Code Quality and Documentation (15%), Results Interpretation (10%)', 100),
('Data Visualization Dashboard', 'Create an interactive data visualization dashboard using tools like Plotly, Dash, or similar. Should tell a compelling data story with multiple chart types.', 'data_science', 3, false, 'Visualization Design and Clarity (30%), Interactivity and User Experience (25%), Data Storytelling (20%), Technical Implementation (15%), Documentation (10%)', 100),
('Time Series Analysis', 'Perform time series analysis and forecasting on temporal data. Include trend analysis, seasonality detection, and predictive modeling.', 'data_science', 4, false, 'Time Series Analysis Techniques (30%), Forecasting Model Quality (25%), Data Preprocessing (20%), Results Validation (15%), Documentation and Insights (10%)', 100),
('End-to-End ML Project', 'Complete an end-to-end machine learning project including data collection, preprocessing, modeling, evaluation, and deployment considerations.', 'data_science', 5, true, 'Project Scope and Complexity (25%), Technical Implementation (25%), Model Performance (20%), Documentation and Reproducibility (15%), Innovation and Insights (15%)', 100),

-- PCB Design Tasks
('Basic Circuit Design', 'Design a basic electronic circuit with proper component selection, schematic creation, and PCB layout. Examples: LED driver, sensor interface, or power supply circuit.', 'pcb_design', 1, false, 'Circuit Design and Functionality (30%), Component Selection (20%), Schematic Quality (25%), PCB Layout (15%), Documentation (10%)', 100),
('Microcontroller Interface Board', 'Design a PCB for microcontroller-based project with proper interfacing, power management, and communication protocols (UART, SPI, I2C).', 'pcb_design', 2, false, 'Circuit Complexity and Functionality (30%), PCB Layout and Routing (25%), Component Placement (20%), Design Rule Compliance (15%), Documentation and Testing (10%)', 100),
('Multi-layer PCB Design', 'Create a multi-layer PCB design with proper layer stackup, signal integrity considerations, and advanced routing techniques.', 'pcb_design', 3, false, 'Layer Stackup Design (25%), Signal Integrity (25%), Routing Quality (25%), Manufacturing Considerations (15%), Documentation (10%)', 100),
('RF Circuit Design', 'Design an RF circuit board with impedance matching, antenna design, and high-frequency considerations.', 'pcb_design', 4, false, 'RF Design Principles (30%), Impedance Matching (25%), Layout Considerations (20%), Simulation and Analysis (15%), Documentation (10%)', 100),
('Complete Product PCB', 'Design a complete product PCB from requirements to manufacturing files, including mechanical considerations, thermal management, and compliance.', 'pcb_design', 5, true, 'Design Completeness (25%), Technical Excellence (25%), Manufacturing Readiness (20%), Documentation Quality (15%), Innovation and Optimization (15%)', 100),

-- Embedded Programming Tasks
('Basic Embedded System', 'Program a microcontroller for basic I/O operations, sensor interfacing, and simple control algorithms using C/C++.', 'embedded_programming', 1, false, 'Code Functionality (30%), Hardware Interface (25%), Code Quality and Structure (20%), Documentation (15%), Testing and Validation (10%)', 100),
('Communication Protocols', 'Implement communication protocols (UART, SPI, I2C) for interfacing multiple devices and sensors in an embedded system.', 'embedded_programming', 2, false, 'Protocol Implementation (30%), Multi-device Communication (25%), Error Handling (20%), Code Organization (15%), Documentation (10%)', 100),
('Real-time System Design', 'Develop a real-time embedded system with interrupt handling, task scheduling, and timing-critical operations.', 'embedded_programming', 3, false, 'Real-time Performance (30%), Interrupt Handling (25%), System Architecture (20%), Code Efficiency (15%), Documentation (10%)', 100),
('IoT Device Development', 'Create an IoT device with wireless connectivity, sensor data collection, and cloud/server communication capabilities.', 'embedded_programming', 4, false, 'IoT Functionality (30%), Wireless Communication (25%), Data Management (20%), Power Optimization (15%), Documentation (10%)', 100),
('Advanced Embedded Project', 'Develop a complex embedded system incorporating multiple advanced concepts like RTOS, bootloader, or custom protocols.', 'embedded_programming', 5, true, 'Technical Complexity (30%), System Integration (25%), Performance Optimization (20%), Code Quality (15%), Innovation (10%)', 100),

-- FPGA Verilog Tasks
('Basic Digital Circuits', 'Implement basic digital circuits using Verilog HDL including combinational and sequential logic designs with proper testbenches.', 'fpga_verilog', 1, false, 'Verilog Code Quality (30%), Circuit Functionality (25%), Testbench Completeness (20%), Synthesis Results (15%), Documentation (10%)', 100),
('State Machine Design', 'Design and implement finite state machines for control applications using Verilog, including proper state encoding and transition logic.', 'fpga_verilog', 2, false, 'State Machine Design (30%), Verilog Implementation (25%), Timing Analysis (20%), Testbench Quality (15%), Documentation (10%)', 100),
('Communication Interfaces', 'Implement communication interfaces (UART, SPI, I2C) in Verilog with proper protocol handling and error detection.', 'fpga_verilog', 3, false, 'Protocol Implementation (30%), Verilog Code Quality (25%), Interface Compliance (20%), Testing and Verification (15%), Documentation (10%)', 100),
('Memory Controllers', 'Design memory controllers and interface circuits in Verilog for different memory types (SRAM, DRAM, Flash).', 'fpga_verilog', 4, false, 'Controller Design (30%), Memory Interface (25%), Timing Compliance (20%), Verification (15%), Documentation (10%)', 100),
('Complex Digital System', 'Implement a complex digital system like a processor, DSP unit, or communication controller using advanced Verilog concepts.', 'fpga_verilog', 5, true, 'System Complexity (30%), Design Architecture (25%), Performance Optimization (20%), Verification Quality (15%), Innovation (10%)', 100);

-- Create admin user (update with actual admin email)
-- INSERT INTO public.users (id, name, email, role) VALUES 
-- ((SELECT id FROM auth.users WHERE email = 'admin@prismstudio.co.in'), 'Admin User', 'admin@prismstudio.co.in', 'admin');