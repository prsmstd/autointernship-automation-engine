# 🚀 Deployment Guide - PrismStudio Internship Platform

## Pre-Deployment Checklist

### ✅ 1. Database Setup (Supabase)
1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project: "PrismStudio Internship"
   - Save database password

2. **Execute Database Schema**
   - Go to SQL Editor in Supabase
   - Copy entire contents of `database/schema.sql`
   - Run the SQL (creates 5 tables + 30 tasks)

3. **Create Storage Bucket**
   - Go to Storage > New bucket
   - Name: `certificates`
   - Make it **Public**

4. **Get API Keys**
   - Go to Settings > API
   - Copy: Project URL, anon key, service_role key

### ✅ 2. Environment Variables
Update `.env.local` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token

# Payment Configuration (Leave empty for mock payments)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# Email Configuration
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://prismstudio.co.in
CERTIFICATE_PRICE=9900
DEFAULT_DOMAIN=web_development
```

### ✅ 3. Local Testing

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Core Features**
   - Visit `http://localhost:3000`
   - Sign up for new account
   - Select a domain (e.g., Web Development)
   - Submit a task with GitHub repo
   - Check AI evaluation works
   - Test certificate verification at `/verify`

3. **Test Admin Features**
   - In Supabase, change your user role to 'admin'
   - Sign out and back in
   - Should redirect to `/admin`
   - Check all admin dashboard features

## Vercel Deployment

### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Choose "Next.js" framework preset

### Step 2: Environment Variables
Add these in Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=https://prismstudio.co.in
CERTIFICATE_PRICE=9900
DEFAULT_DOMAIN=web_development
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

### Step 3: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Test deployment URL

### Step 4: Custom Domain
1. In Vercel dashboard, go to Domains
2. Add `prismstudio.co.in`
3. Update DNS records in GoDaddy:
   - Type: CNAME
   - Name: @
   - Value: cname.vercel-dns.com

## Domain Configuration (GoDaddy)

### DNS Settings
1. Go to GoDaddy DNS Management
2. Add/Update these records:

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 1 Hour

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 1 Hour
```

### SSL Certificate
- Vercel automatically provides SSL
- Your site will be available at `https://prismstudio.co.in`

## Post-Deployment Testing

### 1. Core Functionality
- [ ] Landing page loads correctly
- [ ] User registration/login works
- [ ] Domain selection appears
- [ ] Tasks load for selected domain
- [ ] AI evaluation processes submissions
- [ ] Progress tracking updates
- [ ] Mock payment system works
- [ ] Certificate generation works
- [ ] Certificate verification works

### 2. Admin Dashboard
- [ ] Admin user can access `/admin`
- [ ] All statistics display correctly
- [ ] User management works
- [ ] Submission tracking works
- [ ] Payment monitoring works
- [ ] Certificate management works

### 3. Performance
- [ ] Page load times < 3 seconds
- [ ] AI evaluation completes within 30 seconds
- [ ] Certificate generation works
- [ ] Mobile responsiveness

## Production Enhancements

### 1. Add Real Razorpay (Optional)
```env
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key
```

### 2. Email Notifications
- Resend API is already configured
- Emails will be sent for:
  - Welcome messages
  - Task completions
  - Certificate issuance

### 3. Monitoring
- Vercel provides built-in analytics
- Monitor API usage in Supabase
- Check Gemini API quota usage

## Troubleshooting

### Common Issues

**"Supabase connection error"**
- Check API keys are correct
- Verify Supabase project is active
- Check RLS policies are enabled

**"AI evaluation failed"**
- Verify Gemini API key
- Check API quota limits
- Ensure GitHub repo is public

**"Certificate generation failed"**
- Check Supabase storage bucket exists
- Verify bucket is public
- Check storage permissions

**"Domain not working"**
- DNS changes can take 24-48 hours
- Check CNAME records are correct
- Verify Vercel domain configuration

### Support
- Email: team@prismstudio.co.in
- Check Vercel deployment logs
- Monitor Supabase logs

## Success Metrics

After deployment, you should have:
- ✅ **6 domains** with 5 tasks each (30 total)
- ✅ **AI evaluation** using Gemini Flash
- ✅ **Mock payment system** (ready for Razorpay)
- ✅ **Certificate generation** and verification
- ✅ **Admin dashboard** with full management
- ✅ **Professional landing page**
- ✅ **Mobile-responsive design**
- ✅ **Production-ready security**

The platform is now ready for production use! 🎉