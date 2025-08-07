# 🚀 Production Deployment Guide

## ✅ Pre-Deployment Checklist

### **Build Test**
```bash
npm run build
```
Should complete without errors.

### **Environment Setup**
Copy `.env.example` to `.env.local` and configure:

#### **Required for Production:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_APP_URL` - Your production domain

#### **Optional (but recommended):**
- Google OAuth keys for Google login
- Gemini API key for AI evaluation
- Razorpay keys for payments
- Resend API key for emails

## 🗄️ Database Setup

### **1. Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy URL and keys to environment variables

### **2. Run Database Schema**
```sql
-- Copy and paste contents of database/schema.sql into Supabase SQL Editor
```

### **3. Add Mock Data (Optional)**
```sql
-- Copy and paste contents of database/mock-data.sql for testing
```

### **4. Create Storage Bucket**
- Go to Storage in Supabase
- Create bucket named `certificates`
- Make it public

## 🔐 Authentication Setup

### **Mock Authentication (Always Available)**
The platform includes built-in mock authentication that works in production:
- **Student**: `student@prismstudio.co.in` / `student123`
- **Admin**: `admin@prismstudio.co.in` / `admin123`

### **Google OAuth (Optional)**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add your domain to authorized origins
4. Add environment variables

### **Email/Password (Automatic)**
Users can sign up with email/password through Supabase Auth.

## 🌐 Deployment Options

### **Option 1: Vercel (Recommended)**
```bash
# 1. Push to GitHub
git add .
git commit -m "Production ready"
git push origin main

# 2. Deploy to Vercel
# - Connect GitHub repo
# - Add environment variables
# - Deploy
```

### **Option 2: Netlify**
```bash
# 1. Build command: npm run build
# 2. Publish directory: .next
# 3. Add environment variables
```

### **Option 3: Self-hosted**
```bash
# 1. Build the app
npm run build

# 2. Start production server
npm start
```

## 🧪 Production Testing

### **1. Mock Authentication Test**
- Login with `student@prismstudio.co.in` / `student123`
- Login with `admin@prismstudio.co.in` / `admin123`
- Verify both dashboards work

### **2. Google Login Test**
- Test Google OAuth flow
- Verify new user profile creation
- Check domain selection for new users

### **3. Database Integration Test**
- Verify data loads from Supabase
- Test user profile creation
- Check task loading

### **4. Feature Testing**
- Domain selection
- Task submission (if AI configured)
- Payment flow (if Razorpay configured)
- Certificate verification

## 🔧 Production Configuration

### **Security Headers**
Already configured in `middleware.ts`:
- HTTPS enforcement
- Security headers
- Rate limiting
- CORS protection

### **Performance**
- Next.js 15 with optimizations
- Image optimization enabled
- Static generation where possible
- Efficient database queries

### **Error Handling**
- Graceful fallbacks for missing services
- User-friendly error messages
- Comprehensive logging
- Mock mode when services unavailable

## 📊 Monitoring

### **Built-in Features**
- Auth debug panel (development only)
- Console logging for errors
- User activity tracking
- Payment monitoring

### **Recommended Additions**
- Sentry for error tracking
- Analytics (Google Analytics, etc.)
- Uptime monitoring
- Performance monitoring

## 🚀 Go-Live Steps

### **1. Final Build Test**
```bash
npm run build
npm start
```

### **2. Environment Variables**
- Copy all required variables to production
- Test database connection
- Verify external API keys

### **3. Deploy**
- Push to production
- Run smoke tests
- Monitor for errors

### **4. DNS & SSL**
- Point domain to deployment
- Verify SSL certificate
- Test from multiple locations

## 🎯 Post-Deployment

### **Immediate Tasks**
- [ ] Test all authentication methods
- [ ] Verify database connectivity
- [ ] Check all dashboards load
- [ ] Test mock user login
- [ ] Verify certificate verification

### **Ongoing Maintenance**
- Monitor error logs
- Update dependencies regularly
- Backup database
- Monitor performance
- Scale as needed

## 🆘 Troubleshooting

### **Common Issues**

**Build Errors:**
- Check TypeScript errors
- Verify all imports
- Update dependencies

**Authentication Issues:**
- Verify Supabase keys
- Check RLS policies
- Test mock authentication

**Database Connection:**
- Verify Supabase URL
- Check service role key
- Test database queries

**Performance Issues:**
- Enable caching
- Optimize images
- Check database indexes

## 🎉 Success Metrics

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Mock authentication works
- ✅ Google login works (if configured)
- ✅ Student dashboard loads
- ✅ Admin dashboard loads
- ✅ Database integration works
- ✅ All features function properly

**The platform is now production-ready with both mock and real authentication!** 🚀