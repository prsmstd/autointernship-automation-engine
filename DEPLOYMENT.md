# 🚀 Production Deployment Guide

This guide will help you deploy the Internship Automation Engine to production with real API integrations.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Supabase Account** - For database and authentication
2. **Google AI Studio Account** - For Gemini API key
3. **Razorpay Account** - For payment processing
4. **Vercel Account** - For hosting (recommended)
5. **GitHub Repository** - For code hosting

## 🔧 Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### 1.2 Run Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `database/schema.sql`
3. Run the SQL to create all tables and functions

### 1.3 Configure Storage
1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `certificates`
3. Make it public for certificate downloads
4. Set appropriate policies for file access

### 1.4 Get API Keys
- **Project URL**: Found in Settings > API
- **Anon Key**: Found in Settings > API
- **Service Role Key**: Found in Settings > API (keep this secret!)

## 🤖 Step 2: AI Setup (Google Gemini)

### 2.1 Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key for environment variables

### 2.2 Optional: GitHub Token
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Create a token with `public_repo` access
3. This improves GitHub repository analysis

## 💳 Step 3: Payment Setup (Razorpay)

### 3.1 Create Razorpay Account
1. Go to [razorpay.com](https://razorpay.com)
2. Sign up and complete KYC verification
3. Go to Settings > API Keys

### 3.2 Get API Keys
- **Key ID**: Your public key
- **Key Secret**: Your private key (keep secret!)

### 3.3 Configure Webhooks (Optional)
1. Go to Settings > Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`

## 🌐 Step 4: Deployment (Vercel)

### 4.1 Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select the `internship-automation-engine` folder as root

### 4.2 Configure Environment Variables
Add these environment variables in Vercel dashboard:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token_optional

# Payment Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Email Configuration (Optional)
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
CERTIFICATE_PRICE=9900
```

### 4.3 Deploy
1. Click "Deploy" in Vercel
2. Wait for deployment to complete
3. Test the application

## 🔒 Step 5: Security Configuration

### 5.1 Supabase Security
1. Enable Row Level Security (RLS) on all tables
2. Configure authentication providers if needed
3. Set up proper CORS policies

### 5.2 Environment Variables
- Never commit API keys to version control
- Use Vercel's environment variable system
- Rotate keys regularly

### 5.3 Domain Configuration
1. Add your custom domain in Vercel
2. Update `NEXT_PUBLIC_APP_URL` environment variable
3. Update Razorpay webhook URLs

## 📊 Step 6: Monitoring & Analytics

### 6.1 Vercel Analytics
1. Enable Vercel Analytics in your dashboard
2. Monitor performance and usage

### 6.2 Supabase Monitoring
1. Monitor database usage in Supabase dashboard
2. Set up alerts for high usage

### 6.3 Error Tracking
Consider adding error tracking services like:
- Sentry
- LogRocket
- Vercel's built-in error tracking

## 🧪 Step 7: Testing Production

### 7.1 Test User Flow
1. Sign up as a new user
2. Select a domain
3. Submit a task with a real GitHub repository
4. Verify AI evaluation works
5. Test payment flow
6. Verify certificate generation

### 7.2 Test Admin Features
1. Create an admin user in the database
2. Test admin dashboard functionality
3. Verify all analytics work

### 7.3 Test Certificate Verification
1. Generate a certificate
2. Test the verification URL
3. Ensure public verification works

## 🔄 Step 8: Maintenance

### 8.1 Regular Updates
- Update dependencies monthly
- Monitor for security vulnerabilities
- Update API integrations as needed

### 8.2 Database Maintenance
- Monitor database size and performance
- Clean up old data if needed
- Backup important data regularly

### 8.3 Cost Monitoring
- Monitor Supabase usage
- Track Gemini API usage
- Monitor Razorpay transaction fees

## 🚨 Troubleshooting

### Common Issues

**Database Connection Errors**
- Check Supabase URL and keys
- Verify RLS policies are correct
- Check network connectivity

**AI Evaluation Failures**
- Verify Gemini API key is valid
- Check API quota limits
- Ensure GitHub repositories are public

**Payment Issues**
- Verify Razorpay keys are correct
- Check webhook configuration
- Ensure proper error handling

**Certificate Generation Failures**
- Check Supabase storage configuration
- Verify PDF generation dependencies
- Check file permissions

## 📞 Support

For technical issues:
- Check the application logs in Vercel
- Review Supabase logs
- Check API provider status pages

## 🎉 Success!

Once deployed, your Internship Automation Engine will be fully operational with:

✅ **Real AI Evaluation** - Gemini analyzes actual GitHub repositories  
✅ **Secure Payments** - Razorpay processes real payments  
✅ **PDF Certificates** - Automatically generated and stored  
✅ **Public Verification** - Blockchain-ready certificate verification  
✅ **Admin Dashboard** - Complete system monitoring  
✅ **Multi-Domain Support** - 6 different internship tracks  

The system will handle everything automatically from student registration to certificate generation with zero manual intervention!