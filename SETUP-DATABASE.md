# 🗄️ Supabase Database Setup Guide

## Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Execute the Schema
1. Copy the ENTIRE contents of `database/schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** (or press Ctrl+Enter)
4. Wait for execution to complete

### Step 3: Verify Setup
After running the schema, you should see:
- ✅ **Success message** (may show "No rows returned" - this is normal)
- ✅ **5 tables created**: users, tasks, submissions, payments, certificates
- ✅ **30 tasks inserted** (5 tasks per domain × 6 domains)

### Step 4: Check Tables
Go to **Table Editor** and verify these tables exist:
- `users` - User profiles and roles
- `tasks` - 30 tasks across 6 domains
- `submissions` - Student submissions
- `payments` - Payment records
- `certificates` - Generated certificates

### Step 5: Create Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `certificates`
4. Make it **Public**
5. Click **Create bucket**

## Verification Commands

Run these in SQL Editor to verify setup:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify task count by domain
SELECT domain, COUNT(*) as task_count 
FROM tasks 
GROUP BY domain 
ORDER BY domain;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Expected results:
- 5 tables: certificates, payments, submissions, tasks, users
- 6 domains with 5 tasks each (30 total)
- All tables should have `rowsecurity = true`

## Troubleshooting

**"relation already exists" errors:**
- This is normal if you're re-running the schema
- The script handles existing tables gracefully

**"permission denied" errors:**
- Make sure you're using the service role key
- Check that RLS policies are properly set

**"function does not exist" errors:**
- Make sure the UUID extension is enabled
- Re-run the entire schema from the beginning

## Test the Setup

After database setup:

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Visit:** http://localhost:3000

3. **Sign up** for a new account

4. **Check database:**
   - Your user should appear in the `users` table
   - You should be able to select a domain
   - Tasks should load for your selected domain

## Production Deployment

For production deployment to Vercel:

1. **Environment Variables:**
   Add these to Vercel environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `GITHUB_TOKEN`
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_APP_URL=https://prismstudio.co.in`
   - `CERTIFICATE_PRICE=9900`
   - `DEFAULT_DOMAIN=web_development`

2. **Domain Configuration:**
   - Point prismstudio.co.in to your Vercel deployment
   - Update Supabase Auth settings with your domain

3. **Deploy:**
   ```bash
   vercel --prod
   ```

The database is now ready for production! 🚀