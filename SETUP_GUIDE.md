# DevIgnite CV Builder - Quick Setup Guide

## ⚡ Quick Start (No External Services!)

**The EASIEST way to run this app is to use FREE online databases:**

### Option 1: Neon (Recommended - Fastest Setup)

1. **Get FREE Database** (2 minutes):
   - Go to https://neon.tech/
   - Click "Sign up" (use GitHub)
   - Click "Create Project"
   - Copy the connection string (looks like: `postgresql://user...@...neon.tech/dbname`)

2. **Get FREE Auth** (2 minutes):
   - Go to https://clerk.com/
   - Sign up and create application
   - Copy API keys from dashboard

3. **Paste into .env file**:
   ```env
   DATABASE_URL=your_neon_connection_string
   CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Run**:
   ```bash
   npm run db:push  # Create tables
   npm run dev      # Start app
   ```

**DONE! App runs at http://localhost:5000** 🎉

---

### Option 2: Render Database (You mentioned you have this)

1. Go to https://dashboard.render.com/
2. Click your PostgreSQL database
3. Copy "External Database URL" from Connections section
4. Paste into `.env` file as `DATABASE_URL`
5. Get Clerk keys (see above)
6. Run the commands above

---

## Why Not SQLite?

This app uses PostgreSQL-specific features (JSON columns, advanced queries) that SQLite doesn't support. But Neon's free tier is perfect for development - it's serverless and requires NO setup!

## What You Get FREE:

### Neon Database (neon.tech)
- ✅ 3 GB storage
- ✅ Unlimited queries
- ✅ No credit card required

### Clerk Auth (clerk.com)
- ✅ 10,000 monthly active users
- ✅ All auth features
- ✅ No credit card required

---

## Complete Environment Variables

```env
# Database (REQUIRED) - Get from neon.tech or render.com
DATABASE_URL=postgresql://user:pass@host/db

# Clerk Authentication (REQUIRED) - Get from clerk.com
CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key

# Admin Credentials
ADMIN_EMAIL=admin@devignite.com
ADMIN_PASSWORD=admin123

# Cloudinary File Storage (REQUIRED for profile photos)
# Get from: https://cloudinary.com/console (FREE 25GB)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional (add later for full features)
GROQ_API_KEY=gsk_your_key
RESEND_API_KEY=re_your_key
PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_PUBLIC_KEY=pk_test_your_key

# Application
APP_URL=http://localhost:5000
NODE_ENV=development
```

---

## Commands

```bash
# Install dependencies (already done)
npm install

# Create database tables (first time only)
npm run db:push

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Troubleshooting

### "DATABASE_URL must be set"
- Check `.env` file exists in project root
- Verify DATABASE_URL is on one line (no line breaks)

### "Publishable key not valid"
- Get real Clerk keys from clerk.com
- Make sure all 3 Clerk variables are set

### Port 5000 in use
```bash
PORT=3000 npm run dev
```

---

## 🚀 That's It!

Total time: **5 minutes** to get a fully working app with:
- ✅ Database (Neon)
- ✅ Authentication (Clerk)  
- ✅ File uploads
- ✅ PDF generation
- ✅ AI features (when you add Groq key)

No complex setup, no Docker, no local PostgreSQL install needed!
