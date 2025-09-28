# Aadhaar QR + Self Protocol Implementation Guide

## 🎯 Complete Implementation Overview

This implementation combines **Aadhaar QR code processing** with **Self Protocol verification** to create a comprehensive KYC solution that works without NFC.

## 📱 User Flow

1. **User opens Next.js web app on mobile device**
2. **User uploads/scans Aadhaar QR code** (from physical Aadhaar card)
3. **App processes QR data** and extracts demographic information
4. **App redirects to Self application** with processed Aadhaar data
5. **Self app performs identity verification** using NFC (if available) or other methods
6. **User returns to web app** with verification success/failure status

## 🏗️ Technical Architecture

### Frontend Components

#### 1. AadhaarQRProcessor Component
- **File**: `src/components/AadhaarQRProcessor.tsx`
- **Purpose**: Handles Aadhaar QR code scanning and processing
- **Features**:
  - File upload for QR images
  - Camera scanning for real-time QR reading
  - XML parsing to extract Aadhaar data
  - Verhoeff algorithm validation for Aadhaar numbers
  - Mobile-responsive design

#### 2. SelfVerification Component
- **File**: `src/components/SelfVerification.tsx`
- **Purpose**: Integrates with Self Protocol for verification
- **Features**:
  - SelfQRcodeWrapper for QR generation
  - Includes processed Aadhaar data in userDefinedData
  - Handles verification success/error callbacks
  - Mobile-optimized interface

#### 3. Main Page Component
- **File**: `src/app/page.tsx`
- **Purpose**: Orchestrates the complete user flow
- **Features**:
  - Step-by-step progress indicator
  - State management for the verification process
  - Error handling and retry mechanisms
  - Success page with verified details

### Backend Implementation

#### 1. SelfBackendVerifier API
- **File**: `src/app/api/verify/route.ts`
- **Purpose**: Handles Self Protocol proof verification
- **Features**:
  - Proper SelfBackendVerifier integration
  - Configuration matching frontend settings
  - Comprehensive error handling
  - Detailed logging for debugging

#### 2. Self Protocol Hook
- **File**: `src/hooks/useSelfProtocol.ts`
- **Purpose**: Manages Self Protocol state and configuration
- **Features**:
  - Includes Aadhaar data in userDefinedData
  - Proper endpoint validation
  - Session management
  - Error handling

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install @selfxyz/qrcode @selfxyz/core ethers qr-scanner --legacy-peer-deps
```

### 2. Environment Configuration

Create `.env.local` file:

```env
# Self Protocol Configuration
NEXT_PUBLIC_SELF_ENDPOINT=https://your-domain.com/api/verify
NEXT_PUBLIC_SELF_APP_NAME="Aadhaar Verification App"
NEXT_PUBLIC_SELF_SCOPE="aadhaar-verification"

# Development Configuration
NODE_ENV=development
```

### 3. Development Setup

For local development, you need a publicly accessible endpoint:

```bash
# Option 1: Using ngrok
npm install -g ngrok
ngrok http 3000
# Copy the HTTPS URL to NEXT_PUBLIC_SELF_ENDPOINT

# Option 2: Using localtunnel
npx localtunnel --port 3000
# Copy the HTTPS URL to NEXT_PUBLIC_SELF_ENDPOINT
```

### 4. Production Deployment

Deploy to Vercel, Netlify, or any Next.js hosting platform:

```bash
# Deploy to Vercel
npm install -g vercel
vercel --prod

# Update environment variables in your hosting platform
NEXT_PUBLIC_SELF_ENDPOINT=https://your-production-domain.com/api/verify
```

## 📋 Key Features Implemented

### ✅ Aadhaar QR Code Processing
- **QR Scanner Integration**: Uses `qr-scanner` library for image and camera scanning
- **XML Parsing**: Extracts demographic data from Aadhaar QR XML
- **Validation**: Implements Verhoeff algorithm for Aadhaar number validation
- **Mobile Support**: Camera access and file upload for mobile devices

### ✅ Self Protocol Integration
- **SelfQRcodeWrapper**: Generates verification QR codes
- **SelfBackendVerifier**: Proper backend verification implementation
- **Aadhaar Data Integration**: Includes processed data in userDefinedData
- **Configuration Matching**: Frontend and backend configurations align

### ✅ Mobile-First Design
- **Responsive Layout**: Optimized for mobile devices
- **Progress Indicators**: Clear step-by-step flow visualization
- **Error Handling**: Comprehensive error messages and retry options
- **Loading States**: Visual feedback during processing

### ✅ Security & Privacy
- **Data Validation**: Proper Aadhaar number checksum validation
- **No Data Storage**: Aadhaar data not stored permanently
- **HTTPS Required**: All communications over secure connections
- **Zero-Knowledge Proofs**: Self Protocol ensures privacy

## 🧪 Testing the Implementation

### 1. Mock Aadhaar QR Testing
For development, you can test with mock Aadhaar QR codes:

```typescript
// Example mock Aadhaar XML structure
const mockAadhaarXML = `
<PrintLetterBannerData 
  name="John Doe" 
  dob="01/01/1990" 
  gender="M" 
  loc="123 Main St, City, State" 
  uid="123456789012"
  photo="base64encodedphoto"
/>
`;
```

### 2. Self Protocol Testing
- Use the Self mobile app for real verification
- Test with actual Aadhaar cards (NFC required for Self app)
- Verify endpoint accessibility from mobile devices

### 3. Error Scenarios
- Test with invalid QR codes
- Test with network connectivity issues
- Test with Self app not installed
- Test with invalid Aadhaar numbers

## 🚀 Production Considerations

### 1. Security
- **HTTPS Endpoints**: All communications must be over HTTPS
- **Data Encryption**: Sensitive data should be encrypted in transit
- **UIDAI Compliance**: Follow UIDAI guidelines for Aadhaar handling
- **Session Management**: Implement proper session security

### 2. Performance
- **Image Optimization**: Compress QR images for faster processing
- **Caching**: Cache verification results appropriately
- **CDN**: Use CDN for static assets
- **Monitoring**: Implement error tracking and performance monitoring

### 3. User Experience
- **Loading States**: Clear feedback during processing
- **Error Messages**: User-friendly error descriptions
- **Retry Mechanisms**: Allow users to retry failed operations
- **Accessibility**: Ensure app works for users with disabilities

## 🔍 Troubleshooting

### Common Issues

1. **"Endpoint must be publicly accessible"**
   - Solution: Use ngrok, localtunnel, or deploy to production

2. **"Invalid Aadhaar QR code format"**
   - Solution: Ensure QR code is from a valid Aadhaar card

3. **"Self mobile app not found"**
   - Solution: User needs to install Self mobile app

4. **"Verification failed"**
   - Solution: Check Self Protocol configuration and endpoint accessibility

### Debug Mode
Enable detailed logging by checking browser console and server logs for:
- QR processing results
- Self Protocol configuration
- Verification responses
- Error details

## 📚 Additional Resources

- [Self Protocol Documentation](https://docs.self.xyz/)
- [Self GitHub Repository](https://github.com/selfxyz/self)
- [Aadhaar QR Code Specification](https://uidai.gov.in/)
- [QR Scanner Library](https://github.com/nimiq/qr-scanner)

## 🎯 Next Steps

1. **Test with Real Aadhaar Cards**: Use actual Aadhaar QR codes for testing
2. **Deploy to Production**: Set up production environment with HTTPS
3. **User Testing**: Conduct user acceptance testing on mobile devices
4. **Performance Optimization**: Optimize for speed and reliability
5. **Security Audit**: Conduct security review of the implementation

This implementation provides a complete solution for Aadhaar verification using QR codes combined with Self Protocol, offering a privacy-preserving alternative to NFC-only verification.

