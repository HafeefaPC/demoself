# Complete Aadhaar Verification Implementation Guide for Vercel

## 📋 Overview
This guide will help you implement the complete Aadhaar verification system in a new Next.js project and deploy it on Vercel.

## 🚀 Step-by-Step Implementation Procedure

### Step 1: Create New Next.js Project
1. Create a new Next.js project:
   ```bash
   npx create-next-app@latest your-aadhaar-project
   cd your-aadhaar-project
   ```

2. Choose the following options:
   - TypeScript: Yes
   - ESLint: Yes
   - Tailwind CSS: Yes
   - `src/` directory: Yes
   - App Router: Yes
   - Customize default import alias: No

### Step 2: Install Required Dependencies
Run these commands in your new project:
```bash
npm install @xone-labs/aadharjs @zxing/library jimp jsqr qr-scanner qrcode-reader sharp
```

### Step 3: Copy Configuration Files
Copy these files from the original project to your new project:

#### A. TypeScript Configuration
- **File to copy**: `tsconfig.json`
- **Location**: Root directory of new project
- **Purpose**: Ensures proper TypeScript configuration with path aliases

#### B. Next.js Configuration
- **File to copy**: `next.config.ts`
- **Location**: Root directory of new project
- **Purpose**: Next.js configuration

#### C. PostCSS Configuration
- **File to copy**: `postcss.config.mjs`
- **Location**: Root directory of new project
- **Purpose**: Tailwind CSS configuration

### Step 4: Copy Core Utility Files
Create the following directory structure and copy files:

#### A. Create `src/utils/` directory
Copy these files to `src/utils/`:
- `aadhaarQRExtractor.ts` - Main QR extraction logic
- `realAadhaarQRExtractor.ts` - Advanced QR extraction
- `realQRScanner.ts` - ZXing-based QR scanner
- `simpleAadhaarQRExtractor.ts` - Simple QR extraction

### Step 5: Copy React Components
Create the following directory structure and copy files:

#### A. Create `src/components/` directory
Copy these files to `src/components/`:
- `AadhaarQRProcessor.tsx` - Main QR processing component
- `AadhaarDataInput.tsx` - Manual data input form

### Step 6: Copy API Endpoints
Create the following directory structure and copy files:

#### A. Create `src/app/api/` directory structure
Copy these directories to `src/app/api/`:
- `process-aadhaar/` (with `route.ts` inside)
- `read-aadhaar-qr/` (with `route.ts` inside)

### Step 7: Copy Type Definitions
Create the following directory structure and copy files:

#### A. Create `src/types/` directory
Copy these files to `src/types/`:
- `selfProtocol.ts` - Type definitions for Aadhaar data

### Step 8: Update Global CSS
Copy the content from `src/app/globals.css` to your new project's `src/app/globals.css`

### Step 9: Environment Variables Setup

#### A. Local Development Environment
1. Create `.env.local` file in your project root
2. Add these environment variables:
   ```
   # Basic Configuration
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Aadhaar Verification Settings
   NEXT_PUBLIC_AADHAAR_VERIFICATION_ENABLED=true
   NEXT_PUBLIC_MAX_FILE_SIZE=10485760
   NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
   
   # Security Settings (Optional)
   AADHAAR_DATA_ENCRYPTION_KEY=your-encryption-key-here
   AADHAAR_SESSION_TIMEOUT=3600000
   
   # API Configuration (If using external services)
   # NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
   # API_SECRET_KEY=your-secret-key
   
   # Database (If storing Aadhaar data)
   # DATABASE_URL=your-database-connection-string
   # REDIS_URL=your-redis-connection-string
   ```

#### B. Vercel Production Environment
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these production environment variables:

   **Required Variables:**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_AADHAAR_VERIFICATION_ENABLED=true
   ```

   **Security Variables (Recommended):**
   ```
   AADHAAR_DATA_ENCRYPTION_KEY=your-production-encryption-key
   AADHAAR_SESSION_TIMEOUT=1800000
   NEXT_PUBLIC_MAX_FILE_SIZE=10485760
   NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
   ```

   **Optional Variables (If needed):**
   ```
   # For external API integrations
   API_SECRET_KEY=your-production-secret-key
   NEXT_PUBLIC_API_BASE_URL=https://your-production-api.com
   
   # For database storage
   DATABASE_URL=your-production-database-url
   REDIS_URL=your-production-redis-url
   
   # For analytics/monitoring
   NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
   SENTRY_DSN=your-sentry-dsn
   ```

5. Set environment scope:
   - **Production**: Set for production deployments
   - **Preview**: Set for preview deployments
   - **Development**: Set for local development

#### C. Environment Variables for Different Use Cases

**Basic Aadhaar Verification (Minimal Setup):**
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_AADHAAR_VERIFICATION_ENABLED=true
```

**Enhanced Security Setup:**
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_AADHAAR_VERIFICATION_ENABLED=true
AADHAAR_DATA_ENCRYPTION_KEY=your-strong-encryption-key-32-chars
AADHAAR_SESSION_TIMEOUT=1800000
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png
```

**Production with Database Storage:**
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_AADHAAR_VERIFICATION_ENABLED=true
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://user:password@host:port
AADHAAR_DATA_ENCRYPTION_KEY=your-encryption-key
```

**Enterprise Setup with External APIs:**
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_AADHAAR_VERIFICATION_ENABLED=true
API_SECRET_KEY=your-api-secret
NEXT_PUBLIC_API_BASE_URL=https://your-api.com
AADHAAR_DATA_ENCRYPTION_KEY=your-encryption-key
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Step 10: Create Main Page Component
Create a new page to use the Aadhaar verification:

#### A. Create `src/app/aadhaar-verify/page.tsx`
This will be your main Aadhaar verification page.

### Step 11: Update Package.json Scripts
Ensure your `package.json` has these scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Step 12: Test Locally
1. Run `npm run dev`
2. Navigate to `http://localhost:3000/aadhaar-verify`
3. Test the Aadhaar verification functionality

### Step 13: Deploy to Vercel

#### A. Connect to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Deploy: `vercel`

#### B. Or use Vercel Dashboard
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy

### Step 14: Configure Vercel Settings

#### A. Build Settings
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

#### B. Environment Variables Management
1. **Access Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add each variable with appropriate scope (Production/Preview/Development)

2. **Variable Types**:
   - **Public Variables**: Use `NEXT_PUBLIC_` prefix (visible to client-side)
   - **Private Variables**: No prefix (server-side only)
   - **Sensitive Data**: Use Vercel's secure environment variable storage

3. **Environment Variable Security**:
   - Never commit `.env.local` to version control
   - Use strong, unique encryption keys
   - Rotate keys regularly
   - Use different keys for different environments

#### C. Domain Settings
- Configure custom domain if needed
- Set up SSL certificates
- Configure CORS if needed for API endpoints

#### D. Security Headers (Optional)
Add security headers in `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

## 📁 Complete File Structure for New Project

```
your-aadhaar-project/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── process-aadhaar/
│   │   │   │   └── route.ts
│   │   │   └── read-aadhaar-qr/
│   │   │       └── route.ts
│   │   ├── aadhaar-verify/
│   │   │   └── page.tsx (create this)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AadhaarQRProcessor.tsx
│   │   └── AadhaarDataInput.tsx
│   ├── types/
│   │   └── selfProtocol.ts
│   └── utils/
│       ├── aadhaarQRExtractor.ts
│       ├── realAadhaarQRExtractor.ts
│       ├── realQRScanner.ts
│       └── simpleAadhaarQRExtractor.ts
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
└── .env.local (create this)
```

## 🔧 Key Features You'll Get

✅ **QR Code Scanning**: File upload and camera scanning
✅ **Multiple QR Formats**: Old XML, new secure, encrypted QR codes
✅ **Fallback Options**: Manual data input when QR fails
✅ **Validation**: Aadhaar number checksum validation
✅ **Error Handling**: Comprehensive error messages
✅ **Vercel Ready**: Optimized for Vercel deployment

## ⚠️ Important Notes

1. **Environment Variables**: 
   - **Basic Setup**: Works with minimal env vars (NODE_ENV, NEXT_PUBLIC_APP_URL)
   - **Production**: Add security and configuration variables as needed
   - **Vercel**: Set env vars in Vercel dashboard for production deployment

2. **Vercel Compatibility**: All dependencies are compatible with Vercel
3. **File Size Limits**: Vercel has file upload limits (10MB default), but Aadhaar images are typically small
4. **Security**: 
   - Use encryption keys for sensitive Aadhaar data
   - Set appropriate session timeouts
   - Configure file type restrictions
   - Handle Aadhaar data securely and comply with privacy regulations

5. **Environment Variable Best Practices**:
   - Use `NEXT_PUBLIC_` prefix for client-side variables
   - Keep sensitive keys server-side only
   - Use different values for development/production
   - Rotate encryption keys regularly

6. **Testing**: Test thoroughly before production deployment
7. **Monitoring**: Consider adding analytics and error tracking in production

## 🚀 Deployment Checklist

- [ ] All files copied to correct locations
- [ ] Dependencies installed
- [ ] Local testing completed
- [ ] Vercel project connected
- [ ] Environment variables set (if any)
- [ ] Domain configured (if custom)
- [ ] SSL certificate active
- [ ] Production testing completed

## 📞 Support

If you encounter any issues:
1. Check Vercel deployment logs
2. Verify all files are in correct locations
3. Ensure all dependencies are installed
4. Test locally first before deploying

This implementation will give you a complete, production-ready Aadhaar verification system on Vercel!
