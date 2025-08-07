# Mock Data Setup Guide

This guide will help you set up mock data for testing the PrismStudio Internship Platform.

## Quick Start (Mock Authentication)

The easiest way to test the platform is using the built-in mock authentication:

### Mock Login Credentials

**Student Account:**
- Email: `student@prismstudio.co.in`
- Password: `student123`
- Access: Student dashboard, task submissions, progress tracking

**Admin Account:**
- Email: `admin@prismstudio.co.in`
- Password: `admin123`
- Access: Admin panel, user management, analytics

### How to Use Mock Login

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/login`

3. Use the mock credentials above to login

4. The system will automatically set authentication cookies and redirect you to the appropriate dashboard

## Database Setup (Optional - for full functionality)

If you want to test with a real database, follow these steps:

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env.local`
3. Run the main schema in SQL Editor:
   ```sql
   -- Copy and paste contents of database/schema.sql
   ```
4. Run the mock data script:
   ```sql
   -- Copy and paste contents of database/mock-data.sql
   ```

### 2. Create Auth Users (Manual)

In Supabase Dashboard > Authentication > Users, create these users:

**Student User:**
- Email: `student@prismstudio.co.in`
- Password: `student123`
- User ID: `11111111-1111-1111-1111-111111111111`

**Admin User:**
- Email: `admin@prismstudio.co.in`
- Password: `admin123`
- User ID: `99999999-9999-9999-9999-999999999999`

### 3. Environment Variables

Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Mock Credentials (for testing)
NEXT_PUBLIC_MOCK_STUDENT_EMAIL=student@prismstudio.co.in
NEXT_PUBLIC_MOCK_STUDENT_PASSWORD=student123
NEXT_PUBLIC_MOCK_ADMIN_EMAIL=admin@prismstudio.co.in
NEXT_PUBLIC_MOCK_ADMIN_PASSWORD=admin123

# Other configurations (optional for testing)
GEMINI_API_KEY=your_google_gemini_api_key
GITHUB_TOKEN=your_github_personal_access_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing Features

### Student Dashboard
- Login as student to access:
  - Task list for web development domain
  - Submission history
  - Progress tracking
  - Certificate status

### Admin Dashboard
- Login as admin to access:
  - User management
  - Submission reviews
  - Analytics and statistics
  - Announcement management

### Certificate Verification
Test the certificate verification system with these sample certificate IDs:
- `PRISM-2025-DEMO123`
- `PRISM-2025-WEB001`
- `PRISM-2025-UIUX002`
- `PRISM-2025-DATA003`

Visit `/verify` and enter any of these IDs to test the verification system.

## Troubleshooting

### Icons Not Loading
The Font Awesome icons should now load properly. If you still see blank icons:
1. Check your internet connection
2. Clear browser cache
3. Restart the development server

### Authentication Issues
If you get "unauthorized access" errors:
1. Make sure you're using the correct mock credentials
2. Clear browser cookies and try again
3. Check that the middleware is properly configured

### Database Connection Issues
If using real Supabase:
1. Verify your environment variables are correct
2. Check that RLS policies are properly set
3. Ensure the mock data was inserted correctly

## Mock Data Included

The mock data includes:
- 3 student users across different domains
- 1 admin user
- Sample task submissions with AI feedback
- Payment records
- Generated certificates
- System announcements

This provides a complete testing environment without needing external API keys or services.