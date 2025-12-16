# 🔑 Admin Dashboard - API Key Configuration Guide

## Overview

The **API Keys** section in the admin dashboard provides a secure, user-friendly interface to configure all third-party service credentials without manually editing configuration files.

## Accessing the Configuration Panel

1. **Login as Admin**: Use your admin credentials at `/admin/login`
2. **Navigate to API Keys**: Click on "API Keys" in the admin sidebar
3. **View Configuration Status**: See the overview of configured services at the top

---

## Configuration Status Dashboard

At the top of the page, you'll see 4 status cards:

### 1. Configuration Status
- Shows **X/8** progress (how many required services are configured)
- All 8 services should be green for full functionality

### 2. Authentication (Clerk)
- ✅ **Green**: Both Clerk keys are configured
- ⚠️ **Orange**: Missing one or both Clerk keys
- **Required for**: User login, signup, and authentication

### 3. File Storage (Cloudinary)
- ✅ **Green**: All 3 Cloudinary credentials are configured
- ⚠️ **Orange**: Missing one or more Cloudinary credentials
- **Required for**: Profile photo uploads, CV attachments

### 4. AI Features (Groq)
- ✅ **Green**: Groq API key is configured
- ⚠️ **Orange**: Groq API key is missing
- **Required for**: CV optimization, cover letter generation, ATS analysis

---

## How to Configure a Service

### Step 1: Click "Configure Key"
Click the **"Configure Key"** button in the top-right corner.

### Step 2: Select Service
From the dropdown, select the service you want to configure:

#### **Essential Services (Required for Basic Operation):**

1. **Cloudinary Cloud Name**
   - What it is: Your Cloudinary account identifier
   - Get it from: https://cloudinary.com/console
   - Example: `dxyz123abc`
   - Used for: Profile photo uploads

2. **Cloudinary API Key**
   - What it is: Public API key for Cloudinary
   - Get it from: https://cloudinary.com/console
   - Example: `123456789012345`
   - Used for: Authenticating file uploads

3. **Cloudinary API Secret**
   - What it is: Private API secret for Cloudinary
   - Get it from: https://cloudinary.com/console
   - Example: `abcdefGHIJKLMNOP123`
   - Used for: Secure file operations

4. **Clerk Publishable Key**
   - What it is: Frontend authentication key
   - Get it from: https://dashboard.clerk.com/
   - Example: `pk_test_...`
   - Used for: Client-side authentication

5. **Clerk Secret Key**
   - What it is: Backend authentication key
   - Get it from: https://dashboard.clerk.com/
   - Example: `sk_test_...`
   - Used for: Server-side authentication

6. **Groq AI API Key**
   - What it is: API key for Groq AI service
   - Get it from: https://console.groq.com/keys
   - Example: `gsk_...`
   - Used for: CV optimization, cover letters

7. **Resend API Key**
   - What it is: Email service API key
   - Get it from: https://resend.com/api-keys
   - Example: `re_...`
   - Used for: Sending email notifications

8. **Database URL**
   - What it is: PostgreSQL connection string
   - Get it from: https://supabase.com/dashboard/projects
   - Example: `postgresql://user:pass@host:5432/db`
   - Used for: Database connection

#### **Optional Services (For Payment Processing):**

9. **Paystack Secret Key**
   - What it is: Backend payment key
   - Get it from: https://dashboard.paystack.com/#/settings/developer
   - Example: `sk_test_...`
   - Used for: Processing payments

10. **Paystack Public Key**
    - What it is: Frontend payment key
    - Get it from: https://dashboard.paystack.com/#/settings/developer
    - Example: `pk_test_...`
    - Used for: Payment forms

### Step 3: Get Your API Key

When you select a service, you'll see:
- **Description**: What the key is used for
- **"Get Key" Link**: Direct link to get the API key from the service provider

Click **"Get Key"** to open the service's dashboard in a new tab.

### Step 4: Enter the Key

1. Copy the API key from the service provider's dashboard
2. Paste it into the **API Key / Value** field
3. Click **"Save Key"**

The key is securely stored in the database and immediately available to the application.

---

## Managing Existing Keys

### View Configured Keys

In the **"Configured Keys"** table, you'll see:
- **Service**: Name and description of the service
- **API Key**: Masked by default (e.g., `pk_t****...xyz`)
- **Last Updated**: When the key was last modified
- **Actions**: Show/hide and delete buttons

### Show/Hide Keys

- Click the **eye icon** 👁️ to reveal the full key
- Click the **eye-off icon** 🙈 to mask it again

### Update a Key

To update an existing key:
1. Click **"Configure Key"**
2. Select the same service
3. Enter the new key value
4. Click **"Save Key"**

The old key will be replaced with the new one.

### Delete a Key

To remove a key:
1. Click the **trash icon** 🗑️ next to the key
2. Confirm the deletion

**⚠️ Warning**: Deleting a required key will break the associated functionality!

---

## Security Features

### 🔒 Secure Storage
- All keys are stored in the database with encryption at rest
- Keys are never exposed in frontend code or URLs
- Only admins can view or modify keys

### 🎭 Key Masking
- Keys are masked by default in the UI
- Only first 4 and last 4 characters are shown
- Must explicitly click "show" to reveal full key

### 📝 Audit Trail
- Last updated timestamp for each key
- Admin-only access to configuration panel

---

## Troubleshooting

### Service Shows as "Not Configured"

**Problem**: Status card shows orange warning
**Solution**: 
1. Check if all required keys for that service are added
2. For Cloudinary: Need all 3 keys (Cloud Name, API Key, Secret)
3. For Clerk: Need both keys (Publishable and Secret)

### "Failed to save key" Error

**Problem**: Key won't save
**Possible causes**:
1. **Invalid key format**: Check the key is copied correctly (no extra spaces)
2. **Network error**: Check your internet connection
3. **Permission denied**: Ensure you're logged in as admin

### Feature Not Working After Adding Key

**Problem**: Added key but feature still doesn't work
**Solution**:
1. **Restart the application** - some keys require server restart
2. **Check key is correct** - verify in service provider's dashboard
3. **Test mode vs production** - ensure using correct environment keys

### Can't Find "Get Key" Link

**Problem**: Link opens wrong page
**Solution**: 
- Navigate to service's dashboard manually
- Look for "API Keys" or "Credentials" section
- Generate new key if needed

---

## Quick Setup Checklist

Use this checklist to configure all required services:

### Essential Configuration (Required)

- [ ] **Cloudinary Cloud Name** - Get from https://cloudinary.com/console
- [ ] **Cloudinary API Key** - Get from https://cloudinary.com/console
- [ ] **Cloudinary API Secret** - Get from https://cloudinary.com/console
- [ ] **Clerk Publishable Key** - Get from https://dashboard.clerk.com/
- [ ] **Clerk Secret Key** - Get from https://dashboard.clerk.com/
- [ ] **Groq AI API Key** - Get from https://console.groq.com/keys
- [ ] **Resend API Key** - Get from https://resend.com/api-keys
- [ ] **Database URL** - Get from https://supabase.com/dashboard/projects

### Optional Configuration (For Payments)

- [ ] **Paystack Secret Key** - Get from https://dashboard.paystack.com/
- [ ] **Paystack Public Key** - Get from https://dashboard.paystack.com/

---

## Free Tier Limits

All required services offer generous free tiers:

| Service | Free Tier | Limit |
|---------|-----------|-------|
| **Cloudinary** | ✅ Free | 25GB storage, 25GB bandwidth/month |
| **Clerk** | ✅ Free | 10,000 monthly active users |
| **Groq** | ✅ Free | 14,400 requests/day |
| **Resend** | ✅ Free | 3,000 emails/month |
| **Supabase** | ✅ Free | 500MB database, 1GB file storage |
| **Paystack** | ✅ Free | Test mode (unlimited), 1.5% + ₵0.30 per transaction |

---

## Best Practices

### 🔐 Security

1. **Never share API keys** publicly or in screenshots
2. **Use test/development keys** during setup
3. **Rotate keys regularly** for production
4. **Delete unused keys** to reduce attack surface

### 📊 Monitoring

1. **Check status dashboard** regularly
2. **Verify keys work** after adding them
3. **Monitor usage** on service provider dashboards
4. **Set up billing alerts** to avoid surprise charges

### 🔄 Maintenance

1. **Document key sources** for your team
2. **Keep backup** of keys in secure password manager
3. **Update keys** before they expire
4. **Test after updates** to ensure functionality

---

## Support

If you need help:

1. **Check service documentation**: Each "Get Key" link goes to the official dashboard
2. **Verify key format**: Compare with example placeholders
3. **Test in isolation**: Add one key at a time to identify issues
4. **Contact support**: Reach out to service provider if keys don't work

---

## Summary

The API Key Configuration panel provides:

✅ **User-friendly interface** - No manual file editing
✅ **Secure storage** - Keys encrypted in database
✅ **Status overview** - Quick health check of services
✅ **Direct links** - Easy access to get keys
✅ **Audit trail** - Track when keys were updated

**Result**: Configure your entire application in 5-10 minutes without touching code!
