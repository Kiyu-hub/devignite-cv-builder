# 🚀 Netlify Deployment Guide - DevIgnite CV Builder

## ✅ Prerequisites Configured

All required API keys are set up:
- ✅ Supabase PostgreSQL database
- ✅ Clerk authentication
- ✅ Resend email service
- ✅ Groq AI for CV optimization

---

## 📋 Environment Variables for Netlify

Copy these to your Netlify environment variables:

### Required Variables:

**⚠️ IMPORTANT: Copy these from your `.env` file (not committed to GitHub for security)**

```bash
# Database (get from Supabase)
DATABASE_URL=postgresql://...

# Clerk Authentication (get from clerk.com)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Admin Credentials (your admin email and password)
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password

# Email Service (get from resend.com)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=your-email@domain.com

# Groq AI (get from groq.com)
GROQ_API_KEY=gsk_...

# Cloudinary File Storage (get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Application
NODE_ENV=production
PORT=3000
```

**Note:** All actual values are in your local `.env` file. Copy them to Netlify's environment variables dashboard.

### Optional (add later):
```bash
# Paystack Payment Gateway
PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_PUBLIC_KEY=pk_test_your_key
```

---

## 🚀 Deploy to Netlify

### Option 1: Deploy via Netlify CLI (Fastest)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Option 2: Deploy via Netlify Dashboard

1. Go to https://app.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to **GitHub**
4. Select repository: **Kiyu-hub/devignite-cv-builder**
5. Build settings (auto-detected from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `dist/public`
6. Click **"Add environment variables"**
7. Paste all the environment variables from above
8. Click **"Deploy site"**

---

## 📝 Post-Deployment Steps

1. **Update Clerk Settings:**
   - Go to https://dashboard.clerk.com/
   - Add your Netlify URL to allowed origins
   - Format: `https://your-site.netlify.app`

2. **Test Admin Access:**
   - Go to `https://your-site.netlify.app`
   - Sign up with `kiyuhubdevignite.cv@gmail.com`
   - You'll have admin privileges

3. **Update APP_URL:**
   - In Netlify environment variables
   - Set `APP_URL=https://your-actual-netlify-url.app`

---

## ⚙️ Build Configuration

The `netlify.toml` is already configured with:
- ✅ Node 20
- ✅ Client-side routing redirects
- ✅ Security headers
- ✅ Optimized build settings

---

## 🔍 Troubleshooting

### Build Fails
- Check all environment variables are set in Netlify
- Verify DATABASE_URL is correct
- Check build logs for specific errors

### 500 Errors
- Database connection issue - verify Supabase URL
- Check Netlify function logs
- Ensure all required env variables are set

### Authentication Issues
- Update Clerk allowed origins with your Netlify URL
- Clear browser cache and cookies
- Check VITE_CLERK_PUBLISHABLE_KEY is set

---

## 🎉 Success!

Once deployed, your app will be live at:
`https://your-site-name.netlify.app`

All features enabled:
- ✅ User authentication
- ✅ CV generation
- ✅ PDF downloads
- ✅ AI optimization (Groq)
- ✅ Email notifications (Resend)
- ✅ Admin dashboard
