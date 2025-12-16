# 🚀 Devignite CV Platform

A professional SaaS platform for creating, customizing, and optimizing CVs with AI-powered features.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)

## ✨ Features

- 🎨 **12 Professional CV Templates** - ATS-friendly designs with single-column, two-column, and creative layouts
- 🤖 **AI-Powered Optimization** - Content enhancement, cover letter generation, LinkedIn optimization, and ATS analysis (Groq AI)
- 💳 **Payment Integration** - Secure Paystack payment processing
- 📧 **Email Delivery** - Automated CV delivery via Resend
- 📄 **PDF Generation** - High-quality PDF export using Puppeteer
- 🔐 **Authentication** - Secure Clerk authentication with Google, GitHub, Apple, and Email
- 📦 **Tiered Pricing** - Basic (Free), Pro, and Premium plans with different capabilities
- 📊 **Admin Dashboard** - User management, analytics, email logs, and API key configuration
- ☁️ **Cloud Storage** - Cloudinary integration for profile photos and media
- 🎯 **Usage Limits** - Plan-based feature access and usage tracking

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + Shadcn UI
- TanStack Query for data fetching
- Wouter for routing
- Clerk React for authentication

### Backend
- Express.js with TypeScript
- Clerk Express for JWT verification
- Drizzle ORM with PostgreSQL (Neon)
- Puppeteer for PDF generation
- Groq AI (Llama 3.3 70B) for content optimization
- Paystack for payments
- Resend for emails

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL database (or Neon account)
- Clerk account for authentication
- Paystack account (for payments)
- Groq API key (free tier available)
- Resend API key (for emails)

### Environment Variables

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

**Quick Setup (5 minutes):**

1. **Database** (Supabase/Neon - Free tier available)
2. **Authentication** (Clerk - Free tier available)
3. **File Storage** (Cloudinary - Free tier available)
4. **AI Features** (Groq - Free tier available)
5. **Email** (Resend - Free tier available)

All required services have generous free tiers. No credit card required for development!

**Environment Variables:**

```env
# Database (Required)
DATABASE_URL=postgresql://...

# Authentication (Required)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Cloud Storage (Required)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Features (Required)
GROQ_API_KEY=gsk_...

# Email Service (Required)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=your-email@domain.com

# Admin Account (Required)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-password

# Payment Processing (Optional - for production)
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# Application
NODE_ENV=production
APP_URL=https://your-site.netlify.app
```

### Installation

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Quick setup guide (5 minutes)
- **[NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md)** - Deployment to Netlify
- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** - Admin account setup
- **[ADMIN_API_KEYS_GUIDE.md](./ADMIN_API_KEYS_GUIDE.md)** - API key configuration via admin dashboard
- **[CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md)** - Cloudinary cloud storage setup

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (copy from .env.example)
cp .env.example .env
# Edit .env with your credentials

# 3. Push database schema
npm run db:push

# 4. Start development server
npm run dev
```

Visit `http://localhost:5000` 🎉

## 🏗️ Project Structure

```
devignite-cv-builder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   └── hooks/         # Custom React hooks
│   └── index.html
├── server/                 # Express backend
│   ├── lib/               # Server utilities
│   ├── middleware/        # Express middleware
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
├── config/                 # Configuration files
└── public/                 # Static assets
```

## 🔑 Admin Dashboard

Access the admin dashboard at `/admin/login` with your admin credentials.

**Features:**
- 📊 Sales overview and analytics
- 👥 User management (upgrade plans, reset usage)
- 📧 Email logs
- 🔑 API key configuration (no manual .env editing!)
- 📈 Platform analytics

## 🌐 Deployment

### Netlify (Recommended)

See [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) for complete instructions.

**Quick Deploy:**

1. **Push to GitHub**:
```bash
git add .
git commit -m "Deploy to Netlify"
git push origin main
git branch -M main
git remote add origin https://github.com/yourusername/devignite.git
git push -u origin main
```

2. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist/public`
     - Functions directory: (leave empty - we're using Express)

3. **Environment Variables**:
   - Add all environment variables from your `.env` file in Netlify dashboard
   - Go to Site settings → Environment variables
   - Add each variable

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy your application

### Important Notes for Production

- Update `REPLIT_DEV_DOMAIN` environment variable to your Netlify domain
- Configure Paystack callback URLs in Paystack dashboard
- Set up Clerk production instance with your production domain
- Update CORS settings if needed

## Package Tiers

### Basic - GHS 50
- 1 CV template
- 1 edit
- PDF download

### Standard - GHS 120
- 1 CV template
- 3 edits
- PDF download
- AI-powered cover letter generation

### Premium - GHS 150
- 3 CV templates
- Unlimited edits
- PDF download
- AI-powered cover letter generation
- LinkedIn profile optimization
- ATS compatibility analysis

## AI Features

- **CV Optimization**: Enhance professional language and ATS compatibility
- **Cover Letter Generation**: Create personalized cover letters based on job details
- **LinkedIn Optimization**: Generate optimized headline and about section
- **ATS Analysis**: Score your CV's ATS compatibility with detailed recommendations

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user

### CVs
- `GET /api/cvs` - List user's CVs
- `POST /api/cvs` - Create new CV
- `GET /api/cvs/:id` - Get CV by ID
- `PATCH /api/cvs/:id` - Update CV
- `DELETE /api/cvs/:id` - Delete CV

### Orders
- `GET /api/orders` - List user's orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/:id/download` - Download CV PDF
- `POST /api/orders/:id/send-email` - Send CV via email

### Payments
- `POST /api/payments/initialize` - Initialize Paystack payment
- `GET /api/payments/verify/:reference` - Verify payment

### AI Features
- `POST /api/ai/optimize-cv` - Optimize CV content
- `POST /api/ai/generate-cover-letter` - Generate cover letter
- `POST /api/ai/optimize-linkedin` - Optimize LinkedIn profile
- `POST /api/ai/analyze-ats` - Analyze ATS compatibility

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions, please open an issue on GitHub.
