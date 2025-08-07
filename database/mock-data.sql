-- Mock Data for Testing PrismStudio Internship Platform
-- Run this after the main schema.sql to add test users and data

-- First, we need to create auth users manually since we can't directly insert into auth.users
-- These would normally be created through the Supabase Auth interface

-- Mock Student User Data (to be inserted after auth users are created)
-- Student 1: Web Development
INSERT INTO public.users (
  id, 
  name, 
  full_name, 
  email, 
  phone, 
  domain, 
  role,
  education,
  skills,
  bio
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'John Developer',
  'John Developer',
  'student@prismstudio.co.in',
  '+91-9876543210',
  'web_development',
  'student',
  'Computer Science Engineering, ABC University',
  'JavaScript, React, Node.js, Python, HTML/CSS',
  'Passionate web developer with experience in full-stack development. Love creating user-friendly applications.'
);

-- Student 2: UI/UX Design
INSERT INTO public.users (
  id, 
  name, 
  full_name, 
  email, 
  phone, 
  domain, 
  role,
  education,
  skills,
  bio
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Sarah Designer',
  'Sarah Designer',
  'sarah.designer@prismstudio.co.in',
  '+91-9876543211',
  'ui_ux_design',
  'student',
  'Design Studies, XYZ Institute',
  'Figma, Adobe XD, Sketch, Prototyping, User Research',
  'Creative UI/UX designer focused on creating intuitive and beautiful user experiences.'
);

-- Student 3: Data Science
INSERT INTO public.users (
  id, 
  name, 
  full_name, 
  email, 
  phone, 
  domain, 
  role,
  education,
  skills,
  bio
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Alex Analyst',
  'Alex Data Analyst',
  'alex.analyst@prismstudio.co.in',
  '+91-9876543212',
  'data_science',
  'student',
  'Statistics & Data Science, DEF College',
  'Python, R, Machine Learning, SQL, Pandas, Matplotlib',
  'Data science enthusiast with strong analytical skills and passion for extracting insights from data.'
);

-- Admin User
INSERT INTO public.users (
  id, 
  name, 
  full_name, 
  email, 
  phone, 
  domain, 
  role,
  education,
  skills,
  bio
) VALUES (
  '99999999-9999-9999-9999-999999999999',
  'Admin User',
  'PrismStudio Administrator',
  'admin@prismstudio.co.in',
  '+91-9876543299',
  NULL,
  'admin',
  'Computer Science & Management',
  'Platform Management, Student Mentoring, Technical Review',
  'Platform administrator managing internship programs and student progress.'
);

-- Sample Submissions for Testing
-- John's Web Development submissions
INSERT INTO public.submissions (
  user_id,
  task_id,
  github_link,
  ai_feedback,
  score,
  analysis_type,
  status,
  evaluated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM public.tasks WHERE domain = 'web_development' AND order_number = 1 LIMIT 1),
  'https://github.com/johndeveloper/responsive-landing-page',
  '{"overall_score": 85, "strengths": ["Clean HTML structure", "Responsive design", "Good CSS organization"], "improvements": ["Add more interactive elements", "Improve accessibility"], "detailed_feedback": "Excellent work on the responsive design. The layout adapts well to different screen sizes.", "analysis_type": "web_development_analysis"}',
  85,
  'web_development_analysis',
  'evaluated',
  NOW() - INTERVAL '2 days'
);

INSERT INTO public.submissions (
  user_id,
  task_id,
  github_link,
  ai_feedback,
  score,
  analysis_type,
  status,
  evaluated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM public.tasks WHERE domain = 'web_development' AND order_number = 2 LIMIT 1),
  'https://github.com/johndeveloper/todo-app',
  '{"overall_score": 78, "strengths": ["Good functionality", "Clean code structure", "Local storage implementation"], "improvements": ["Add input validation", "Improve error handling"], "detailed_feedback": "Well-implemented CRUD operations with good use of local storage.", "analysis_type": "web_development_analysis"}',
  78,
  'web_development_analysis',
  'evaluated',
  NOW() - INTERVAL '1 day'
);

-- Sarah's UI/UX submissions
INSERT INTO public.submissions (
  user_id,
  task_id,
  github_link,
  ai_feedback,
  score,
  analysis_type,
  status,
  evaluated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM public.tasks WHERE domain = 'ui_ux_design' AND order_number = 1 LIMIT 1),
  'https://github.com/sarahdesigner/mobile-app-wireframes',
  '{"overall_score": 92, "strengths": ["Excellent user flow", "Comprehensive wireframes", "Good documentation"], "improvements": ["Add more user personas", "Include accessibility considerations"], "detailed_feedback": "Outstanding wireframe quality with clear user journey mapping.", "analysis_type": "ui_ux_analysis"}',
  92,
  'ui_ux_analysis',
  'evaluated',
  NOW() - INTERVAL '3 days'
);

-- Alex's Data Science submission
INSERT INTO public.submissions (
  user_id,
  task_id,
  github_link,
  ai_feedback,
  score,
  analysis_type,
  status,
  evaluated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  (SELECT id FROM public.tasks WHERE domain = 'data_science' AND order_number = 1 LIMIT 1),
  'https://github.com/alexanalyst/data-exploration',
  '{"overall_score": 88, "strengths": ["Thorough data cleaning", "Insightful visualizations", "Good statistical analysis"], "improvements": ["Add more hypothesis testing", "Include feature correlation analysis"], "detailed_feedback": "Comprehensive exploratory data analysis with meaningful insights.", "analysis_type": "data_science_analysis"}',
  88,
  'data_science_analysis',
  'evaluated',
  NOW() - INTERVAL '1 day'
);

-- Sample Payments
INSERT INTO public.payments (
  user_id,
  amount,
  status,
  razorpay_order_id,
  razorpay_payment_id,
  payment_method
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  9900,
  'paid',
  'order_mock_12345',
  'pay_mock_67890',
  'card'
);

-- Sample Certificates
INSERT INTO public.certificates (
  user_id,
  certificate_id,
  pdf_url,
  cert_hash,
  metadata,
  project_title,
  grade,
  completion_date,
  skills
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'PS2501WEB101',
  'https://example.com/certificates/PS2501WEB101.pdf',
  'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
  '{"student_name": "John Developer", "domain": "Web Development", "final_score": 85}',
  'Responsive E-commerce Website',
  'A',
  CURRENT_DATE - INTERVAL '1 day',
  '["HTML/CSS", "JavaScript", "React", "Node.js", "Responsive Design"]'
);

-- Sample Announcements
INSERT INTO public.announcements (
  title,
  content,
  priority,
  target_domain,
  created_by
) VALUES (
  'Welcome to PrismStudio Internship Program!',
  'Welcome to our comprehensive internship program. Please complete your profile and start with Task 1 of your chosen domain. Remember to submit quality work and follow the guidelines provided.',
  'high',
  NULL,
  '99999999-9999-9999-9999-999999999999'
);

INSERT INTO public.announcements (
  title,
  content,
  priority,
  target_domain,
  created_by
) VALUES (
  'Web Development Track Update',
  'New resources have been added for React and Node.js development. Check the updated task descriptions for additional guidance and best practices.',
  'medium',
  'web_development',
  '99999999-9999-9999-9999-999999999999'
);

INSERT INTO public.announcements (
  title,
  content,
  priority,
  target_domain,
  created_by
) VALUES (
  'Certificate Generation Now Available',
  'Students who have completed all tasks with passing scores can now generate their certificates. Payment of ₹99 is required for certificate processing.',
  'high',
  NULL,
  '99999999-9999-9999-9999-999999999999'
);

-- Demo certificates for verification testing
INSERT INTO public.certificates (
  user_id,
  certificate_id,
  pdf_url,
  cert_hash,
  metadata,
  project_title,
  grade,
  completion_date,
  skills
) VALUES 
(
  '22222222-2222-2222-2222-222222222222',
  'PRISM-2025-DEMO123',
  'https://example.com/certificates/demo123.pdf',
  'demo123hash1234567890abcdef1234567890abcdef1234567890abcdef123456',
  '{"student_name": "Demo Student", "domain": "UI/UX Design", "final_score": 92}',
  'Mobile App Design System',
  'A+',
  CURRENT_DATE - INTERVAL '5 days',
  '["UI Design", "UX Research", "Prototyping", "Design Systems"]'
),
(
  '11111111-1111-1111-1111-111111111111',
  'PRISM-2025-WEB001',
  'https://example.com/certificates/web001.pdf',
  'web001hash1234567890abcdef1234567890abcdef1234567890abcdef123456',
  '{"student_name": "John Developer", "domain": "Web Development", "final_score": 85}',
  'Full-Stack E-commerce Platform',
  'A',
  CURRENT_DATE - INTERVAL '3 days',
  '["React", "Node.js", "MongoDB", "REST APIs"]'
),
(
  '22222222-2222-2222-2222-222222222222',
  'PRISM-2025-UIUX002',
  'https://example.com/certificates/uiux002.pdf',
  'uiux002hash1234567890abcdef1234567890abcdef1234567890abcdef123456',
  '{"student_name": "Sarah Designer", "domain": "UI/UX Design", "final_score": 92}',
  'Healthcare App Redesign',
  'A+',
  CURRENT_DATE - INTERVAL '2 days',
  '["User Research", "Wireframing", "Prototyping", "Accessibility"]'
),
(
  '33333333-3333-3333-3333-333333333333',
  'PRISM-2025-DATA003',
  'https://example.com/certificates/data003.pdf',
  'data003hash1234567890abcdef1234567890abcdef1234567890abcdef123456',
  '{"student_name": "Alex Analyst", "domain": "Data Science", "final_score": 88}',
  'Customer Behavior Analysis Dashboard',
  'A',
  CURRENT_DATE - INTERVAL '1 day',
  '["Python", "Machine Learning", "Data Visualization", "Statistical Analysis"]'
);

-- Update the trigger function to handle our mock UUIDs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.users (id, email, name, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent conflicts with our mock data
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Instructions for manual auth user creation:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Create users manually with these emails and any password:
--    - student@prismstudio.co.in (set ID to: 11111111-1111-1111-1111-111111111111)
--    - admin@prismstudio.co.in (set ID to: 99999999-9999-9999-9999-999999999999)
--    - sarah.designer@prismstudio.co.in (set ID to: 22222222-2222-2222-2222-222222222222)
--    - alex.analyst@prismstudio.co.in (set ID to: 33333333-3333-3333-3333-333333333333)
-- 3. Or use the mock login credentials in the login page:
--    Student: student@prismstudio.co.in / student123
--    Admin: admin@prismstudio.co.in / admin123

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;