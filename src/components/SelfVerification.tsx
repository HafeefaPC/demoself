'use client';

import { useEffect } from 'react';
import { SelfQRcodeWrapper } from '@selfxyz/qrcode';
import { useSelfProtocol } from '@/hooks/useSelfProtocol';

interface SelfVerificationProps {
  onSuccess: (proof: any) => void;
  onError: (error: any) => void;
}

export default function SelfVerification({ onSuccess, onError }: SelfVerificationProps) {
  const {
    selfApp,
    isInitialized,
    isProcessing,
    error,
    sessionId,
    initializeSelfApp,
    handleVerificationSuccess,
    handleVerificationError,
    resetState
  } = useSelfProtocol(onSuccess, onError);

  useEffect(() => {
    initializeSelfApp();
  }, [initializeSelfApp]);

  if (error) {
    return (
      <div className="text-center p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Setup Required</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        
        {(error.includes('localhost') || error.includes('private IP') || error.includes('HTTPS protocol')) && (
          <div className="bg-yellow-100 border border-yellow-300 p-4 mb-4 text-left">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Self Protocol Setup Required</h4>
            <div className="text-sm text-yellow-700 whitespace-pre-line">
              {error}
            </div>
            <div className="mt-3 p-2 bg-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                <strong>Current Endpoint:</strong> {process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'Not set'}<br/>
                <strong>Required:</strong> Publicly accessible HTTPS endpoint (not localhost)
              </p>
            </div>
          </div>
        )}

        {(error.includes('Tunnel Unavailable') || error.includes('503') || error.includes('Tunnel connection failed')) && (
          <div className="bg-red-100 border border-red-300 p-4 mb-4 text-left">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ Tunnel Connection Required</h4>
            <p className="text-sm text-red-700 mb-2">
              <strong>Self Protocol requires a stable HTTPS endpoint.</strong> The current tunnel connection is not working.
            </p>
            <p className="text-sm text-red-700 mb-2">
              To fix this, you need to set up a proper tunnel or deploy to a real HTTPS endpoint.
            </p>
            <div className="text-xs text-red-600 mt-2">
              <strong>Setup Options:</strong><br/>
              1. Use ngrok: <code>ngrok http 3000</code><br/>
              2. Deploy to Vercel/Netlify<br/>
              3. Update .env.local with stable HTTPS URL
            </div>
          </div>
        )}
        
        <button
          onClick={resetState}
          className="bg-black text-white py-2 px-4 font-semibold hover:bg-gray-800"
        >
          Retry After Setup
        </button>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="text-center p-6">
        <h3 className="text-lg font-semibold mb-2">Initializing...</h3>
        <p className="text-gray-600">Setting up Self Protocol for Aadhaar verification</p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="text-center p-6">
        <h3 className="text-lg font-semibold mb-2">Processing Verification...</h3>
        <p className="text-gray-600 mb-4">Verifying Aadhaar document with Self Protocol</p>
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="text-center p-6">
      <h3 className="text-lg font-semibold mb-4">Aadhaar KYC Verification</h3>
      
      <p className="text-sm mb-6">
        Scan QR code with Self mobile app to verify your Aadhaar
      </p>

      {/* Real Self QR Code Component */}
      {selfApp && (
        <div className="mb-6">
          <SelfQRcodeWrapper
            selfApp={selfApp}
            onSuccess={() => {
              console.log('QR Code Success - verification completed');
              // The SelfQRcodeWrapper handles the proof internally
              // We'll get the proof data through the selfApp state
              handleVerificationSuccess({});
            }}
            onError={() => {
              console.log('QR Code Error - verification failed');
              handleVerificationError({ message: 'QR code verification failed' });
            }}
          />
        </div>
      )}

      {/* Instructions */}
      <div className="border border-black p-4 mb-6 text-left">
        <h4 className="font-semibold mb-2">Verification Process:</h4>
        <ol className="text-sm space-y-1">
          <li>1. Download Self mobile app</li>
          <li>2. Scan QR code above</li>
          <li>3. Scan your Aadhaar card NFC chip</li>
          <li>4. Select attributes to share</li>
          <li>5. Complete verification</li>
        </ol>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500">
        <p>Powered by Self Protocol</p>
        <p>Zero-knowledge proof verification</p>
      </div>
    </div>
  );
}