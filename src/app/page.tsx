'use client';

import React, { useState, useEffect } from 'react';
import { SelfAppBuilder, SelfQRcodeWrapper } from '@selfxyz/qrcode';
import { ethers } from 'ethers';

export default function Home() {
  const [selfApp, setSelfApp] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Initialize Self App (based on playground)
  const initializeSelfApp = async () => {
    try {
      setError(null);
      setIsInitialized(false);

      // Generate user ID
      const wallet = ethers.Wallet.createRandom();
      const userId = wallet.address;

      // Create app logo
      const logoSvg = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="8" fill="#000000"/>
          <path d="M12 12H28V28H12V12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      const logoBase64 = 'data:image/svg+xml;base64,' + btoa(logoSvg);

      // Configuration (based on playground)
      const config = {
        version: 2,
        appName: 'Aadhaar KYC Verification',
        scope: 'aadhaar-verification',
        endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'https://demoself-jet.vercel.app/api/verify',
        logoBase64: logoBase64,
        userId: userId,
        endpointType: 'staging_https' as const,
        userIdType: 'hex' as const,
        userDefinedData: 'Aadhaar KYC Verification',
        disclosures: {
          minimumAge: 18,
          nationality: true,
          gender: true,
          name: true,
          date_of_birth: true,
        },
      };

      const app = new SelfAppBuilder(config).build();
      setSelfApp(app);
      setIsInitialized(true);

    } catch (err) {
      console.error('❌ Self Protocol initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize Self SDK');
    }
  };

  // Handle verification success
  const handleVerificationSuccess = async (proof: any) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attestationId: 3, // Aadhaar document type
          proof: proof,
          publicSignals: proof.publicSignals || [],
          userContextData: proof.userContextData || '0x0',
          sessionId: crypto.randomUUID()
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setVerificationResult({
          status: 'success',
          details: result.credentialSubject || {}
        });
      } else {
        throw new Error(result.reason || 'Verification failed');
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      setVerificationResult({
        status: 'failed',
        error: err instanceof Error ? err.message : 'Failed to verify proof'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle verification error
  const handleVerificationError = (error: any) => {
    console.error('❌ Self Protocol verification error:', error);
    setVerificationResult({
      status: 'failed',
      error: error.message || 'Verification failed'
    });
  };

  // Initialize on component mount
  useEffect(() => {
    initializeSelfApp();
  }, []);

  const handleRetry = () => {
    setVerificationResult(null);
    setIsProcessing(false);
    setError(null);
    initializeSelfApp();
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Self Protocol</h1>
            <p className="text-gray-600">Aadhaar KYC Verification</p>
          </div>

          <div className="border border-black p-6">
            {error && (
              <div className="text-center p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Setup Required</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={handleRetry}
                  className="bg-black text-white py-2 px-4 font-semibold hover:bg-gray-800"
                >
                  Retry
                </button>
              </div>
            )}

            {!isInitialized && !error && (
              <div className="text-center p-6">
                <h3 className="text-lg font-semibold mb-2">Initializing...</h3>
                <p className="text-gray-600">Setting up Self Protocol for Aadhaar verification</p>
              </div>
            )}

            {isProcessing && (
              <div className="text-center p-6">
                <h3 className="text-lg font-semibold mb-2">Processing Verification...</h3>
                <p className="text-gray-600 mb-4">Verifying Aadhaar document with Self Protocol</p>
                <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
              </div>
            )}

            {isInitialized && !isProcessing && !verificationResult && (
              <div className="text-center p-6">
                <h3 className="text-lg font-semibold mb-4">Aadhaar Verification</h3>
                
                <p className="text-sm mb-6">
                  Scan QR code with Self mobile app to verify your Aadhaar
                </p>

                {/* Self QR Code Component */}
                {selfApp && (
                  <div className="mb-6">
                    <SelfQRcodeWrapper
                      selfApp={selfApp}
                      onSuccess={() => {
                        console.log('QR Code Success');
                        handleVerificationSuccess({});
                      }}
                      onError={() => {
                        console.log('QR Code Error');
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
            )}

            {verificationResult && (
              <div className="text-center">
                {verificationResult.status === 'success' ? (
                  <div>
                    <h2 className="text-xl font-bold text-green-600 mb-4">✓ Verification Successful</h2>
                    
                    {verificationResult.details && Object.keys(verificationResult.details).length > 0 ? (
                      <div className="border border-black p-4 mb-6 text-left">
                        <h3 className="font-semibold mb-3">Verified Aadhaar Details:</h3>
                        <div className="space-y-2 text-sm">
                          {verificationResult.details.firstName && (
                            <div className="flex justify-between">
                              <span>Name:</span>
                              <span className="font-medium">
                                {verificationResult.details.firstName} {verificationResult.details.lastName}
                              </span>
                            </div>
                          )}
                          {verificationResult.details.nationality && (
                            <div className="flex justify-between">
                              <span>Nationality:</span>
                              <span className="font-medium">{verificationResult.details.nationality}</span>
                            </div>
                          )}
                          {verificationResult.details.dateOfBirth && (
                            <div className="flex justify-between">
                              <span>DOB:</span>
                              <span className="font-medium">{verificationResult.details.dateOfBirth}</span>
                            </div>
                          )}
                          {verificationResult.details.gender && (
                            <div className="flex justify-between">
                              <span>Gender:</span>
                              <span className="font-medium">
                                {verificationResult.details.gender === 'M' ? 'Male' : 'Female'}
                              </span>
                            </div>
                          )}
                          {verificationResult.details.minimumAge && (
                            <div className="flex justify-between">
                              <span>Age:</span>
                              <span className="font-medium text-green-600">✓ 18+ Verified</span>
                            </div>
                          )}
                          {verificationResult.details.aadhaarVerified && (
                            <div className="flex justify-between">
                              <span>Aadhaar:</span>
                              <span className="font-medium text-green-600">✓ Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="border border-yellow-300 bg-yellow-50 p-4 mb-6 text-left">
                        <h3 className="font-semibold mb-2 text-yellow-800">⚠️ No Aadhaar Data Available</h3>
                        <p className="text-sm text-yellow-700">
                          Verification was successful but no Aadhaar details were extracted. 
                          This may happen if the Aadhaar QR code doesn't contain readable data.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-red-600 mb-4">✗ Verification Failed</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      {verificationResult.error || 'Aadhaar verification failed'}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleRetry}
                  className="w-full bg-black text-white py-3 px-6 font-semibold hover:bg-gray-800"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Powered by Self Protocol</p>
            <p>Zero-knowledge proof verification</p>
          </div>
        </div>
      </div>
    </div>
  );
}