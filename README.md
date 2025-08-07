# 🚀 PrismStudio Internship Automation Platform

A complete AI-powered internship management platform with automated evaluation, certificate generation, and payment processing. Built with Next.js 14, Supabase, and Google Gemini AI.

## 🌟 Features

### 🤖 AI-Powered Evaluation
- **Gemini Flash Integration**: Automatic GitHub repository analysis
- **Multi-Domain Support**: Specialized evaluation for 6 different domains
- **Detailed Feedback**: Comprehensive scoring with strengths and improvements
- **Real-time Processing**: Fast evaluation with structured results

### 🎓 Complete Internship Management
- **6 Specialized Domains**: Web Dev, UI/UX, Data Science, PCB, Embedded, FPGA
- **30 Progressive Tasks**: 5 tasks per domain with increasing difficulty
- **Progress Tracking**: Real-time dashboard with completion status
- **Mentor System**: AI-powered guidance and feedback

### 💳 Automated Payment & Certificates
- **Razorpay Integration**: Secure ₹99 certificate payments
- **Auto Certificate Generation**: Professional PDF certificates
- **Blockchain Verification**: SHA256 hash-based certificate validation
- **Public Verification Portal**: Anyone can verify certificates

### 📊 Advanced Dashboards
- **Student Dashboard**: Progress tracking, submissions, certificates
- **Admin Dashboard**: User management, analytics, revenue tracking
- **Real-time Updates**: Live statistics and notifications

### 🔒 Enterprise Security
- **Row Level Security**: Database-level access control
- **Authentication**: Supabase Auth with role-based access
- **Payment Security**: Cryptographic signature validation
- **Data Protection**: GDPR-compliant privacy controls

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Font Awesome** - Icons and visual elements

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Database-level access control

### AI & Integrations
- **Google Gemini Flash** - AI evaluation engine (500 requests/day free)
- **GitHub API** - Repository content extraction
- **Razorpay** - Payment processing (with mock fallback)
- **Resend** - Email notifications

### Infrastructure
- **Vercel** - Deployment and hosting
- **Supabase Storage** - File storage for certificates
- **Custom Domain** - prismstudio.co.in ready

## 📁 Project Structure

```
internship-automation-engine/
├── app/                          # Next.js App Router
│   ├── about/                    # About page
│   ├── admin/                    # Admin dashboard
│   ├── api/                      # API routes
│   │   ├── evaluate/             # AI evaluation endpoint
│   │   └── payment/              # Payment processing
│   ├── dashboard/                # Student dashboard
│   ├── internships/              # Internship opportunities
│   ├── privacy/                  # Privacy policy
│   ├── services/                 # Services page
│   ├── terms/                    # Terms of use
│   ├── verify/                   # Certificate verification
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── providers.tsx             # Context providers
├── components/                   # Reusable components
│   ├── admin/                    # Admin components
│   ├── auth/                     # Authentication components
│   └── dashboard/                # Dashboard components
├── database/                     # Database schema
│   └── schema.sql                # Complete database setup
├── lib/                          # Utility libraries
│   ├── ai-evaluator.ts           # Gemini AI integration
│   ├── certificate-generator.ts  # PDF certificate generation
│   └── supabase.ts               # Database client
├── .env.local                    # Environment variables
├── .env.example                  # Environment template
└── README.md                     # This file
```

## 🚀 Quick Start (5 Minutes)

### 1. Clone and Install
```bash
git clone <repository-url>
cd internship-automation-engine
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in your API keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Configuration
GEMINI_API_KEY=your_google_gemini_api_key
GITHUB_TOKEN=your_github_personal_access_token

# Payment Configuration (Optional - leave empty for mock payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Email Configuration
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://prismstudio.co.in
CERTIFICATE_PRICE=9900
DEFAULT_DOMAIN=web_development
```

### 3. Database Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → New Query
3. Copy the entire contents of `database/schema.sql`
4. Run the SQL to create all tables and sample data
5. Go to Storage → Create bucket named `certificates` (make it public)

### 4. Test Locally
```bash
npm run dev
```
Visit `http://localhost:3000` and test the platform!

## 📋 Detailed Setup Guide

### Supabase Configuration

#### 1. Create Project
- Go to [supabase.com](https://supabase.com)
- Click "New Project"
- Name: "PrismStudio Internship"
- Choose region and set password
- Wait for project creation (2-3 minutes)

#### 2. Get API Keys
- Go to Settings → API
- Copy these values to your `.env.local`:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

#### 3. Setup Database
- Go to SQL Editor → New Query
- Copy entire `database/schema.sql` content
- Click "Run" to execute
- Verify 5 tables created: users, tasks, submissions, payments, certificates

#### 4. Create Storage
- Go to Storage → New bucket
- Name: `certificates`
- Make it **Public**
- This stores generated certificate PDFs

### API Keys Setup

#### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Add to `GEMINI_API_KEY` in `.env.local`
4. Free tier: 500 requests/day

#### GitHub Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:user`
4. Add to `GITHUB_TOKEN` in `.env.local`

#### Razorpay (Optional)
1. Create account at [razorpay.com](https://razorpay.com)
2. Complete KYC verification
3. Get API keys from Dashboard
4. Add to Razorpay variables in `.env.local`
5. **Note**: Leave empty for mock payments

#### Resend Email
1. Create account at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Add to `RESEND_API_KEY` in `.env.local`

## 🌐 Deployment Guide

### Vercel Deployment

#### 1. Prepare Repository
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Choose "Next.js" framework preset
4. Add all environment variables from `.env.local`
5. Click "Deploy"

#### 3. Custom Domain Setup
1. In Vercel dashboard → Domains
2. Add `prismstudio.co.in`
3. In GoDaddy DNS settings:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (up to 48 hours)

### Environment Variables for Production
Add these in Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
GITHUB_TOKEN=your_github_token
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_APP_URL=https://prismstudio.co.in
CERTIFICATE_PRICE=9900
DEFAULT_DOMAIN=web_development
RAZORPAY_KEY_ID=your_razorpay_key_or_empty
RAZORPAY_KEY_SECRET=your_razorpay_secret_or_empty
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_or_empty
```

## 🧪 Testing Guide

### Local Testing
1. **Start server**: `npm run dev`
2. **Visit**: `http://localhost:3000`
3. **Test features**:
   - Sign up for new account
   - Select domain (Web Development)
   - Submit GitHub repo for Task 1
   - Check AI evaluation results
   - Test certificate verification

### Demo Certificates
Test certificate verification with these IDs:
- `PRISM-2025-DEMO123` - Demo Student
- `PRISM-2025-WEB001` - John Developer
- `PRISM-2025-UIUX002` - Sarah Designer
- `PRISM-2025-DATA003` - Alex Analyst

### Production Testing
1. **Deploy to Vercel**
2. **Test all features** on live domain
3. **Verify email notifications**
4. **Test payment processing**
5. **Check certificate generation**

## 📊 Platform Features

### Student Experience
1. **Registration**: Simple email-based signup
2. **Domain Selection**: Choose from 6 specializations
3. **Progressive Tasks**: 5 tasks with increasing difficulty
4. **AI Feedback**: Detailed evaluation with scores
5. **Certificate**: Professional PDF upon completion

### Admin Experience
1. **Dashboard**: Complete system overview
2. **User Management**: View and manage all users
3. **Submissions**: Track all task submissions
4. **Payments**: Monitor certificate payments
5. **Analytics**: Revenue and usage statistics

### AI Evaluation Process
1. **GitHub Analysis**: Extract repository contents
2. **Domain-Specific**: Tailored evaluation criteria
3. **Comprehensive Scoring**: Multiple assessment dimensions
4. **Detailed Feedback**: Strengths and improvement areas
5. **Pass/Fail Decision**: Automatic progression control

## 🔧 Customization

### Adding New Domains
1. **Update Database**: Add tasks to `tasks` table
2. **Update Components**: Add domain to selection interface
3. **Update AI Logic**: Add domain-specific evaluation
4. **Test Thoroughly**: Ensure all features work

### Modifying Tasks
1. **Edit Database**: Update task descriptions and criteria
2. **Update AI Prompts**: Modify evaluation logic
3. **Test Evaluation**: Ensure AI provides good feedback

### Styling Changes
1. **Tailwind CSS**: Modify utility classes
2. **Global Styles**: Update `globals.css`
3. **Components**: Customize individual components

## 🐛 Troubleshooting

### Common Issues

#### "supabaseKey is required"
- **Cause**: Missing or incorrect Supabase API keys
- **Solution**: Check `.env.local` file, restart server

#### "AI evaluation failed"
- **Cause**: Invalid Gemini API key or quota exceeded
- **Solution**: Verify API key, check quota limits

#### "Certificate generation failed"
- **Cause**: Missing storage bucket or permissions
- **Solution**: Create public `certificates` bucket in Supabase

#### "Payment processing error"
- **Cause**: Razorpay configuration issues
- **Solution**: Leave Razorpay keys empty for mock payments

### Getting Help
- **Email**: team@prismstudio.co.in
- **Documentation**: Check this README
- **Logs**: Check Vercel deployment logs
- **Database**: Monitor Supabase logs

## 📈 Scaling Considerations

### Performance Optimization
- **Database Indexing**: Already optimized in schema
- **API Caching**: Consider Redis for high traffic
- **CDN**: Vercel provides global CDN
- **Image Optimization**: Use Next.js Image component

### Cost Management
- **Supabase**: Free tier supports 50,000 monthly active users
- **Gemini API**: 500 free requests/day, then pay-per-use
- **Vercel**: Free tier for personal projects
- **Razorpay**: 2% transaction fee

### Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Logs**: Database and API monitoring
- **Error Tracking**: Consider Sentry integration
- **Uptime Monitoring**: Use external service

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Submit pull request with detailed description

### Code Standards
- **TypeScript**: Use strict typing
- **ESLint**: Follow configured rules
- **Prettier**: Format code consistently
- **Testing**: Add tests for new features

## 📄 License

This project is proprietary software owned by PrismStudio. All rights reserved.

## 📞 Support

For technical support or business inquiries:

- **Email**: team@prismstudio.co.in
- **Website**: https://prismstudio.co.in
- **LinkedIn**: https://www.linkedin.com/company/prismstudioss/
- **Instagram**: https://www.instagram.com/prismstudio__

---

**Built with ❤️ by PrismStudio Team**

*Empowering businesses, enabling futures through innovative technology solutions.*