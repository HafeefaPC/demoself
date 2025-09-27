# Production Setup Guide

## 🔑 Self Protocol Setup (No Signup Required!)

**Important**: Self Protocol is **open-source** and **doesn't require signup or API keys**! It's a decentralized identity verification protocol.

### Step 1: Understanding Self Protocol
- Self is a **privacy-first, open-source identity protocol**
- Uses **zero-knowledge proofs** for secure identity verification
- Works with **passport NFC scanning** (not file uploads)
- **No API keys or signup required** - it's completely open source

### Step 2: Environment Configuration
Create `.env.local` file with your backend endpoint:
```env
# Your backend endpoint (where verification results are sent)
NEXT_PUBLIC_SELF_ENDPOINT=https://your-domain.com/api/verify

# Development Configuration
NODE_ENV=development
```

### Step 3: Backend Endpoint Setup
Your backend endpoint must be **publicly accessible** for the Self mobile app to send verification results.

**For local development**, use tools like:
- [ngrok](https://ngrok.com/) - `ngrok http 3000`
- [localtunnel](https://localtunnel.github.io/www/) - `npx localtunnel --port 3000`

## 📄 Real Document Requirements

### What Users Need:

#### 1. **Passport with NFC Chip**
- **Modern passport** with embedded NFC chip
- **Self mobile app** installed on smartphone
- **NFC-enabled phone** to scan passport

#### 2. **Self Mobile App**
- Download from App Store/Google Play
- Handles passport scanning and proof generation
- Manages privacy and selective disclosure

#### 3. **Verification Process**
- User scans QR code with Self app
- App reads passport NFC chip
- Generates zero-knowledge proof
- User selects which attributes to share
- Proof is sent to your backend for verification

### Document Validation Rules:

```typescript
// Production validation rules
const validationRules = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  minFileSize: 50 * 1024, // 50KB minimum
  imageMinSize: 100 * 1024, // 100KB for images
  pdfMinSize: 50 * 1024, // 50KB for PDFs
};
```

## 🔒 Security Considerations

### 1. **Data Protection**
- Never store Aadhaar documents permanently
- Process and delete immediately after verification
- Use secure file upload with virus scanning
- Implement proper access controls

### 2. **Compliance**
- Follow UIDAI guidelines for Aadhaar usage
- Implement proper consent mechanisms
- Maintain audit logs
- Ensure data privacy compliance

### 3. **Backend Security**
```typescript
// Example backend verification endpoint
app.post('/verify-aadhaar', async (req, res) => {
  try {
    // 1. Validate file
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 2. Process with Self SDK
    const verificationResult = await selfSDK.verifyAadhaar(file);

    // 3. Return result
    res.json({
      status: verificationResult.verified ? 'success' : 'failed',
      details: verificationResult.details,
      timestamp: new Date().toISOString()
    });

    // 4. Delete file immediately
    fs.unlinkSync(file.path);
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});
```

## 🚀 Production Deployment

### 1. **Environment Variables**
Set these in your production environment:
```bash
# Vercel
vercel env add NEXT_PUBLIC_APP_ID
vercel env add NEXT_PUBLIC_APP_SECRET
vercel env add NEXT_PUBLIC_BACKEND_ENDPOINT

# Or in your hosting platform's environment settings
```

### 2. **Domain Configuration**
- Update your Self app settings with production domain
- Configure CORS for your domain
- Set up SSL certificates

### 3. **Monitoring**
- Set up error tracking (Sentry, LogRocket)
- Monitor verification success rates
- Track user engagement metrics

## 🧪 Testing in Production

### 1. **Test Documents**
Use these for testing (DO NOT use real Aadhaar):
- Sample Aadhaar images (blurred/masked)
- Test PDF documents
- Invalid document formats

### 2. **Test Scenarios**
- Valid Aadhaar document
- Invalid/corrupted files
- Wrong file formats
- Oversized files
- Network failures

### 3. **User Acceptance Testing**
- Test with real users (with consent)
- Gather feedback on UI/UX
- Test on different devices
- Verify accessibility compliance

## 📞 Support & Resources

### Self.xyz Support:
- **Documentation**: [https://docs.self.xyz](https://docs.self.xyz)
- **Community**: [Self.xyz Discord](https://discord.gg/self)
- **Support**: support@self.xyz

### UIDAI Guidelines:
- **Aadhaar Usage**: [UIDAI Guidelines](https://uidai.gov.in/)
- **Privacy Policy**: Ensure compliance with data protection laws
- **Consent Management**: Implement proper user consent

## ⚠️ Important Notes

1. **Never store real Aadhaar data** in your database
2. **Always get user consent** before processing documents
3. **Follow local laws** regarding identity verification
4. **Test thoroughly** before going live
5. **Monitor for security issues** regularly

## 🔄 Update Your App

To use real Self SDK integration, update your `SelfVerification.tsx`:

```typescript
// Replace mock implementation with real Self SDK
import { SelfQRcodeWrapper } from '@selfxyz/qrcode';

// Use actual QR code component
<SelfQRcodeWrapper
  selfApp={selfApp}
  onSuccess={handleVerificationSuccess}
  onError={handleVerificationError}
/>
```

This will generate real QR codes that users can scan with the Self mobile app for verification.
