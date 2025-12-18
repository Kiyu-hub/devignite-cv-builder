# Netlify Build Dependency Resolution Guide

## 🎯 The Golden Rule

**ANY package that is `require()`'d or `import`'ed during the BUILD process MUST be in `dependencies`, NOT `devDependencies`.**

---

## 🔍 Root Cause Analysis

### The Problem
Netlify's build process may skip `devDependencies` in production mode, causing "Cannot find module" errors for packages that are actually needed during the build.

### Why It Happens
- Locally, `npm install` installs BOTH dependencies and devDependencies
- On Netlify, depending on configuration, only `dependencies` may be installed for production builds
- If a build tool is in `devDependencies`, it won't be available during the build

---

## ✅ Correct Dependency Classification

### `dependencies` (Production Build Requirements)
**Rule:** Anything needed to BUILD or RUN the application in production.

**Our Build Dependencies:**
```json
{
  "dependencies": {
    // Build Tools
    "vite": "^5.4.20",                        // ✅ Vite bundler
    "@vitejs/plugin-react": "^4.7.0",         // ✅ Vite React plugin
    "typescript": "5.6.3",                     // ✅ TypeScript compiler
    "esbuild": "^0.25.0",                      // ✅ Used by Vite
    
    // CSS/PostCSS Tools
    "postcss": "^8.4.47",                      // ✅ CSS processor
    "autoprefixer": "^10.4.20",                // ✅ PostCSS plugin (in postcss.config.js)
    "tailwindcss": "^3.4.17",                  // ✅ Tailwind CSS framework
    "@tailwindcss/typography": "^0.5.15",      // ✅ Tailwind plugin (in tailwind.config.ts)
    "@tailwindcss/vite": "^4.1.3",             // ✅ Tailwind Vite plugin
    "tailwindcss-animate": "^1.0.7",           // ✅ Tailwind animation plugin
    
    // Runtime Dependencies
    "react": "^18.3.1",                        // ✅ React framework
    "express": "^4.21.2",                      // ✅ Backend server
    // ... all other runtime packages
  }
}
```

### `devDependencies` (Development-Only Tools)
**Rule:** Anything ONLY needed during LOCAL development, NOT for building or running.

**Our Dev-Only Dependencies:**
```json
{
  "devDependencies": {
    // Type Definitions (not needed for build, only for IDE)
    "@types/node": "20.16.11",                 // ✅ TypeScript types
    "@types/express": "4.17.21",               // ✅ TypeScript types
    "@types/react": "^18.3.11",                // ✅ TypeScript types
    "@types/react-dom": "^18.3.1",             // ✅ TypeScript types
    "@types/ws": "^8.5.13",                    // ✅ TypeScript types
    // ... other @types/*
    
    // Development Tools
    "tsx": "^4.20.5",                          // ✅ Local dev server only
    "drizzle-kit": "^0.31.4",                  // ✅ Database migrations (local)
    
    // Replit-Specific (not needed for Netlify)
    "@replit/vite-plugin-cartographer": "^0.3.1",
    "@replit/vite-plugin-dev-banner": "^0.1.1",
    "@replit/vite-plugin-runtime-error-modal": "^0.0.3"
  }
}
```

---

## 🚨 How to Identify Build Dependencies

### Method 1: Check Config Files
Look for `require()` or `import` statements in:

1. **`vite.config.ts`**
   ```typescript
   import { defineConfig } from "vite"          // ✅ vite → dependencies
   import react from "@vitejs/plugin-react"    // ✅ @vitejs/plugin-react → dependencies
   ```

2. **`postcss.config.js`**
   ```javascript
   plugins: {
     tailwindcss: {},      // ✅ tailwindcss → dependencies
     autoprefixer: {},     // ✅ autoprefixer → dependencies
   }
   ```

3. **`tailwind.config.ts`**
   ```typescript
   plugins: [
     require("tailwindcss-animate"),           // ✅ tailwindcss-animate → dependencies
     require("@tailwindcss/typography")        // ✅ @tailwindcss/typography → dependencies
   ]
   ```

### Method 2: Read the Error Message
Netlify tells you exactly what's missing:

```
Cannot find module 'autoprefixer'
Cannot find module '@tailwindcss/typography'
```

**Solution:** Move that package from devDependencies to dependencies.

---

## 📝 Step-by-Step Fix Process

When you get a "Cannot find module" error on Netlify:

### Step 1: Identify the Missing Package
```bash
# From Netlify logs:
Cannot find module 'package-name'
```

### Step 2: Check Current Location
```bash
# In package.json, find the package
grep -A 2 "package-name" package.json
```

### Step 3: Move to Dependencies
```json
// FROM devDependencies:
"devDependencies": {
  "package-name": "^1.0.0",  // ❌ Remove from here
}

// TO dependencies:
"dependencies": {
  "package-name": "^1.0.0",  // ✅ Add here
}
```

### Step 4: Update Lock File
```bash
npm install
```

### Step 5: Verify Build Locally
```bash
npm run build
# Should succeed without errors
```

### Step 6: Commit and Deploy
```bash
git add package.json package-lock.json
git commit -m "Move package-name to dependencies for Netlify build"
git push origin main
```

---

## 🎓 Lessons Learned

### Build Failures We Fixed

1. **Issue:** `vite: not found`
   - **Cause:** `vite` was in devDependencies
   - **Fix:** Moved to dependencies

2. **Issue:** `Cannot find module 'autoprefixer'`
   - **Cause:** `autoprefixer` was in devDependencies
   - **Fix:** Moved to dependencies (along with postcss, tailwindcss)

3. **Issue:** `Cannot find module '@tailwindcss/typography'`
   - **Cause:** Tailwind plugins were in devDependencies
   - **Fix:** Moved `@tailwindcss/typography` and `@tailwindcss/vite` to dependencies

### The Pattern
Each time, the solution was the same: **Move build-time dependencies from devDependencies to dependencies.**

---

## ✅ Final Dependency Structure

### Complete Build Chain

```
Build Process Flow:
1. npm install (installs dependencies)
2. npm run build (runs vite build)
3. vite reads vite.config.ts
   ├── requires: vite ✅
   ├── requires: @vitejs/plugin-react ✅
   └── requires: typescript ✅
4. vite processes CSS
   ├── reads postcss.config.js
   │   ├── requires: postcss ✅
   │   ├── requires: autoprefixer ✅
   │   └── requires: tailwindcss ✅
   └── reads tailwind.config.ts
       ├── requires: @tailwindcss/typography ✅
       ├── requires: @tailwindcss/vite ✅
       └── requires: tailwindcss-animate ✅
5. esbuild compiles TypeScript
   └── requires: esbuild ✅
6. Build succeeds ✅
```

**All dependencies marked ✅ are in `dependencies`, not `devDependencies`.**

---

## 🔒 Prevention Strategy

### 1. Before Adding Any New Package

Ask yourself: **"Is this needed during the build process?"**

- **YES** → Add to `dependencies`
- **NO** → Add to `devDependencies`

### 2. Test Locally with Production-Like Install

```bash
# Simulate Netlify's install
rm -rf node_modules
npm ci --omit=dev  # Only installs dependencies, not devDependencies

# Try to build
npm run build

# If it fails, you've found a misplaced dependency
```

### 3. Check Config Files After Adding Plugins

After adding a Vite plugin, PostCSS plugin, or Tailwind plugin:

1. Check `vite.config.ts` for imports
2. Check `postcss.config.js` for requires
3. Check `tailwind.config.ts` for requires
4. Ensure all are in `dependencies`

---

## 🚀 Quick Reference

### Build Dependencies (Must be in `dependencies`)
- ✅ vite
- ✅ @vitejs/plugin-react
- ✅ typescript
- ✅ esbuild
- ✅ postcss
- ✅ autoprefixer
- ✅ tailwindcss
- ✅ @tailwindcss/typography
- ✅ @tailwindcss/vite
- ✅ tailwindcss-animate

### Dev-Only Dependencies (Can be in `devDependencies`)
- ✅ @types/* (all TypeScript type definitions)
- ✅ tsx (local dev server)
- ✅ drizzle-kit (database tools)
- ✅ @replit/* (Replit-specific plugins)

---

## 📊 Success Metrics

**After all fixes:**
- ✅ Build time: ~5 seconds
- ✅ Bundle size: 517KB (155KB gzipped)
- ✅ No module resolution errors
- ✅ Successful Netlify deployments
- ✅ No TypeScript errors

---

## 🎯 When to Use This Guide

Use this guide whenever you:
1. Add a new build tool or plugin
2. Get "Cannot find module" errors on Netlify
3. Set up a new project with Vite + Tailwind
4. Help others debug Netlify build failures

---

**Last Updated:** December 18, 2025  
**Status:** ✅ All Build Dependencies Correctly Classified  
**Build Status:** ✅ Passing on Netlify
