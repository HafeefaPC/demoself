# Aadhaar KYC Verification - Self Protocol Integration

**Real implementation of Self Protocol for Aadhaar KYC verification using zero-knowledge proofs.**

Based on official [Self Protocol Workshop](https://github.com/selfxyz/workshop/) and [Playground](https://github.com/selfxyz/playground) examples.

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Setup

### ⚠️ **Critical Requirement: Public HTTPS Endpoint**

Self Protocol **requires a publicly accessible HTTPS endpoint**. Localhost and private IPs are **not allowed**.

The `.env.local` file is configured with a tunnel endpoint:
```env
NEXT_PUBLIC_SELF_ENDPOINT=https://demoself.loca.lt/api/verify
NEXT_PUBLIC_SELF_APP_NAME=Aadhaar KYC Verification
NEXT_PUBLIC_SELF_SCOPE=aadhaar-verification
```

### 🚀 **Setting Up ngrok (Recommended)**

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start ngrok tunnel:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

4. **Update .env.local:**
   ```env
   NEXT_PUBLIC_SELF_ENDPOINT=https://abc123.ngrok.io/api/verify
   ```

5. **Restart the development server:**
   ```bash
   npm run dev
   ```

### ✅ **Endpoint Validation**

The app automatically validates that your endpoint:
- ✅ Uses HTTPS protocol
- ✅ Is publicly accessible (not localhost)
- ✅ Is not a private IP address
- ✅ Has a valid URL format

### 🚫 **Invalid Endpoints**

These endpoints will be **rejected**:
- ❌ `http://localhost:3000/api/verify` (HTTP + localhost)
- ❌ `https://127.0.0.1:3000/api/verify` (localhost)
- ❌ `https://192.168.1.1:3000/api/verify` (private IP)
- ❌ `http://example.com/api/verify` (HTTP only)

## 📱 KYC Verification Flow

1. **Upload Aadhaar** → User uploads Aadhaar document (JPG, PNG, PDF)
2. **Document Processing** → API processes and validates the document
3. **QR Code Generation** → SelfQRcodeWrapper generates verification QR
4. **Mobile Scanning** → User scans QR with Self mobile app
5. **NFC Verification** → App reads Aadhaar NFC chip
6. **Proof Generation** → Zero-knowledge proof created
7. **Verification Complete** → Results displayed

## 🏗️ Implementation

### Frontend Components
- **Home Page** → Aadhaar document upload with validation
- **Verification Page** → KYC verification flow
- **SelfVerification Component** → Self SDK integration
- **Results Display** → Verification results with verified attributes

### Backend APIs
- **`/api/upload-aadhaar`** → Processes uploaded Aadhaar documents
- **`/api/verify`** → SelfBackendVerifier for proof validation
- **File validation** → Type, size, and format checking
- **Document processing** → OCR and data extraction simulation

### Self SDK Integration (Offchain)
- **SelfAppBuilder** → Aadhaar KYC configuration with `endpointType: 'staging_https'`
- **SelfQRcodeWrapper** → Real QR code generation for mobile app scanning
- **SelfBackendVerifier** → Zero-knowledge proof validation using `verify()` method
- **Document Type 3** → Aadhaar-specific verification
- **UserIdentifierType: 'uuid'** → Correct for offchain verification

## 🧪 Testing

- **Upload Test** → Upload any valid image/PDF file
- **Real testing** → Use Self mobile app for actual verification (requires HTTPS endpoint)
- **QR Code Scanning** → Scan with Self mobile app
- **NFC Verification** → Use Aadhaar card with NFC chip
- **Production Deployment** → Deploy to Vercel/Netlify for stable HTTPS endpoint

## 🚀 Production Setup

For production deployment:

1. **Deploy to HTTPS endpoint** → Vercel, Netlify, or similar
2. **Update environment variables** → Set `NEXT_PUBLIC_SELF_ENDPOINT` to your production URL
3. **Real verification** → Users scan QR code with Self mobile app
4. **NFC scanning** → App reads Aadhaar card NFC chip
5. **Zero-knowledge proofs** → Complete privacy-preserving verification

**Real Self Protocol integration with actual Aadhaar verification!**

## 🎯 Key Features

- ✅ **KYC Verification Flow** - Upload → Process → Verify → Complete
- ✅ **Real Self Protocol** - Actual SDK integration
- ✅ **Aadhaar Support** - Document type 3 for Aadhaar verification
- ✅ **Zero-Knowledge Proofs** - Privacy-first verification
- ✅ **File Upload** - JPG, PNG, PDF support with validation
- ✅ **QR Code Generation** - Real Self QR codes
- ✅ **Verification Results** - Actual verified attributes displayed
- ✅ **No API Keys** - Self Protocol is open source

## 📚 Documentation

- [Self.xyz Documentation](https://docs.self.xyz/)
- [Self GitHub Repository](https://github.com/selfxyz/self)
- [Aadhaar Document Specification](https://docs.self.xyz/document-specification/aadhaar)

## 🎯 Hackathon Requirements Met

- ✅ **Self offchain SDK implemented**
- ✅ **KYC verification flow**
- ✅ **Aadhaar upload and processing**
- ✅ **Zero-knowledge proof generation**
- ✅ **Real verification results**
- ✅ **Ready for demo**

## 🚀 Deployment

Deploy to Vercel, Netlify, or any Next.js hosting platform. Set your backend endpoint in environment variables.
