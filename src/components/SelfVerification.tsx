'use client';

import { useEffect } from 'react';
import { SelfQRcodeWrapper } from '@selfxyz/qrcode';
import { useSelfProtocol } from '@/hooks/useSelfProtocol';

interface SelfVerificationProps {
  onSuccess: (proof: any) => void;
  onError: (error: any) => void;
  extractedAadhaarData?: any;
  sessionId?: string | null;
}

export default function SelfVerification({ onSuccess, onError, extractedAadhaarData, sessionId: propSessionId }: SelfVerificationProps) {
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
  } = useSelfProtocol(onSuccess, onError, extractedAadhaarData, propSessionId);

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

        {(error.includes('Tunnel Unavailable') || error.includes('503') || error.includes('Tunnel connection failed') || error.includes('no valid credential subject found')) && (
          <div className="bg-red-100 border border-red-300 p-4 mb-4 text-left">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ Self Mobile App Connection Issue</h4>
            <p className="text-sm text-red-700 mb-2">
              <strong>The Self mobile app cannot connect to your endpoint.</strong> This prevents proof generation.
            </p>
            <p className="text-sm text-red-700 mb-2">
              <strong>Common causes:</strong>
            </p>
            <ul className="text-xs text-red-600 mt-2 list-disc list-inside">
              <li>Vercel deployment protection is enabled</li>
              <li>Endpoint is not accessible from mobile networks</li>
              <li>Network firewall blocking the connection</li>
              <li>Self Protocol configuration mismatch</li>
            </ul>
            <div className="text-xs text-red-600 mt-2">
              <strong>Solutions:</strong><br/>
              1. <strong>Use ngrok:</strong> <code>ngrok http 3000</code> then update endpoint<br/>
              2. <strong>Disable Vercel protection</strong> in dashboard<br/>
              3. <strong>Use local network IP:</strong> <code>http://192.168.1.8:3000/api/verify</code><br/>
              4. <strong>Check network connectivity</strong> between mobile and server
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
          <h3 className="text-lg font-semibold mb-4">Aadhaar QR Code Verification</h3>
          
          <p className="text-sm mb-6">
            Scan QR code with Self mobile app, then scan your Aadhaar QR code
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
              <h4 className="font-semibold mb-2">Aadhaar QR Verification Process:</h4>
              <ol className="text-sm space-y-1">
                <li>1. Download Self mobile app (iOS/Android)</li>
                <li>2. Scan QR code above with Self app</li>
                <li>3. <strong>Scan your PHYSICAL Aadhaar QR code</strong> (from e-Aadhaar PDF or printed sheet)</li>
                <li>4. Select attributes to share (name, DOB, etc.)</li>
                <li>5. Complete zero-knowledge verification</li>
              </ol>
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>Important:</strong> The uploaded document is NOT processed. 
                  You must scan your PHYSICAL Aadhaar QR code with the mobile app to get real data.
                </p>
              </div>
            </div>

      {/* Info */}
      <div className="text-xs text-gray-500">
        <p>Powered by Self Protocol</p>
        <p>Zero-knowledge proof verification</p>
      </div>
    </div>
  );
}