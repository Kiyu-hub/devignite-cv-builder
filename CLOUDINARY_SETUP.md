# 📸 Cloudinary Setup Guide

## What is Cloudinary?

Cloudinary is a cloud-based file storage service for images and media. Your app now uses Cloudinary instead of local file storage for profile photos, making it perfect for production deployment.

## Why Cloudinary?

- ✅ **FREE tier**: 25 GB storage, 25 GB monthly bandwidth
- ✅ **No credit card required** for free tier
- ✅ **Automatic image optimization** and transformations
- ✅ **CDN delivery** - fast worldwide
- ✅ **Perfect for deployment** - no local file storage needed

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/
2. Click **"Sign Up For Free"**
3. Sign up with email or GitHub
4. Verify your email

### Step 2: Get Your Credentials

After signing up, you'll see the **Dashboard**:

1. Look for the **"Account Details"** section
2. You'll see three values:
   - **Cloud Name**: e.g., `dxxx123abc`
   - **API Key**: e.g., `123456789012345`
   - **API Secret**: e.g., `abcdefGHIJKLMNOP123` (click eye icon to reveal)

### Step 3: Add to .env File

Copy your credentials and add them to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefGHIJKLMNOP123
```

### Step 4: Restart Your App

```bash
npm run dev
```

That's it! Profile photo uploads now go directly to Cloudinary. 🎉

---

## 🧪 Testing the Integration

1. **Run the app**: `npm run dev`
2. **Log in** to your account
3. **Upload a profile photo** in the CV builder
4. **Check Cloudinary Dashboard**:
   - Go to https://cloudinary.com/console/media_library
   - You should see your uploaded image in the `devignite-cv-profiles` folder

---

## 📦 What Changed?

### Before (Local Storage):
- Files saved to `public/uploads/` folder
- URLs like: `/uploads/profile-123456.jpg`
- ❌ Doesn't work on serverless platforms (Netlify, Vercel)
- ❌ Files lost on every deployment

### After (Cloudinary):
- Files uploaded to Cloudinary cloud
- URLs like: `https://res.cloudinary.com/your-cloud/image/upload/...`
- ✅ Works everywhere
- ✅ Persistent storage
- ✅ Automatic image optimization (500x500px, auto quality)

---

## 🎯 Features Enabled

Your app automatically applies these optimizations:

1. **Size limit**: 500x500px max (keeps files small)
2. **Auto quality**: Cloudinary optimizes compression
3. **Folder organization**: All photos in `devignite-cv-profiles/`
4. **Security**: Images are private until you publish them

---

## 💰 Free Tier Limits

**What you get FREE:**
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 transformations/month
- 2 users

**Perfect for:**
- ✅ Development and testing
- ✅ Small to medium apps (thousands of users)
- ✅ Personal projects

**Need more?** Paid plans start at $89/month (you won't need this unless you have 100,000+ users).

---

## 🔒 Security Notes

1. **Never commit** your API Secret to GitHub
2. `.env` file is already in `.gitignore` (safe)
3. For production (Netlify), add credentials in:
   - Netlify Dashboard → Site settings → Environment variables

---

## 🛠️ Troubleshooting

### Error: "Must supply cloud_name"
- Check that `CLOUDINARY_CLOUD_NAME` is set in `.env`
- Restart the app after adding credentials

### Error: "Invalid API Key"
- Verify your API Key and Secret are correct
- Copy directly from Cloudinary Dashboard

### Images not showing
- Check Cloudinary Media Library: https://cloudinary.com/console/media_library
- Verify the URL returned by the upload endpoint

### Still using local storage?
- Make sure you restarted the app after adding credentials
- Check `server/routes.ts` - upload endpoint should use `cloudinary.uploader.upload_stream`

---

## 📚 Resources

- **Cloudinary Dashboard**: https://cloudinary.com/console
- **Media Library**: https://cloudinary.com/console/media_library
- **Documentation**: https://cloudinary.com/documentation
- **Node.js SDK**: https://cloudinary.com/documentation/node_integration

---

## ✅ Checklist

- [ ] Created Cloudinary account
- [ ] Got Cloud Name, API Key, API Secret
- [ ] Added credentials to `.env` file
- [ ] Restarted the app
- [ ] Tested profile photo upload
- [ ] Verified image appears in Cloudinary dashboard

**Done!** Your app now uses professional cloud storage. 🚀
