'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SelfVerification from '@/components/SelfVerification';

interface AadhaarDetails {
  firstName?: string;
  lastName?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: string;
  minimumAge?: boolean;
  aadhaarVerified?: boolean;
  kycCompleted?: boolean;
}

export default function VerifyPage() {
  const [verificationResult, setVerificationResult] = useState<{
    status: 'success' | 'failed' | 'pending';
    details?: AadhaarDetails;
    error?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const handleVerificationSuccess = (result: any) => {
    setIsVerifying(true);
    
    // Process the actual verification result from Self Protocol
    const aadhaarDetails: AadhaarDetails = result.credentialSubject || {};

    console.log('🎉 Self Protocol KYC Verification Complete!', result);

    setVerificationResult({
      status: 'success',
      details: aadhaarDetails
    });
    setIsVerifying(false);
  };

  const handleVerificationError = (error: any) => {
    setVerificationResult({
      status: 'failed',
      error: error.message || 'Aadhaar verification failed'
    });
    setIsVerifying(false);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleRetry = () => {
    setVerificationResult(null);
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Aadhaar KYC Verification</h1>
            <p className="text-sm text-gray-600">Self Protocol Integration</p>
          </div>

          {/* Main Content */}
          <div className="border border-black p-6">
            {!verificationResult && !isVerifying && (
              <SelfVerification
                onSuccess={handleVerificationSuccess}
                onError={handleVerificationError}
              />
            )}

            {isVerifying && (
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Processing Verification...</h2>
                <p className="text-sm text-gray-600">Verifying Aadhaar document with Self Protocol</p>
                <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mt-4"></div>
              </div>
            )}

            {verificationResult && (
              <div className="text-center">
                {verificationResult.status === 'success' ? (
                  <div>
                    <h2 className="text-xl font-bold text-green-600 mb-4">✓ Verification Successful</h2>
                    
                    {verificationResult.details && (
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
                          {verificationResult.details.kycCompleted && (
                            <div className="flex justify-between">
                              <span>KYC Status:</span>
                              <span className="font-medium text-green-600">✓ Completed</span>
                            </div>
                          )}
                        </div>
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

                <div className="space-y-3">
                  <button
                    onClick={handleBackToHome}
                    className="w-full bg-black text-white py-3 px-6 font-semibold hover:bg-gray-800"
                  >
                    Back to Home
                  </button>
                  <button
                    onClick={handleRetry}
                    className="w-full bg-gray-600 text-white py-3 px-6 font-semibold hover:bg-gray-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
