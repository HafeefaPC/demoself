'use client';

import { useState, useEffect } from 'react';
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
  aadhaarNumber?: string;
  address?: string;
  state?: string;
  district?: string;
  pincode?: string;
  country?: string;
  age?: number;
  yob?: number;
  fullAddress?: string;
}

export default function VerifyPage() {
  const [verificationResult, setVerificationResult] = useState<{
    status: 'success' | 'failed' | 'pending';
    details?: AadhaarDetails;
    error?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [extractedAadhaarData, setExtractedAadhaarData] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();

  // Load extracted Aadhaar data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('extractedAadhaarData');
    const storedSessionId = localStorage.getItem('verificationSessionId');
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setExtractedAadhaarData(parsedData);
        setSessionId(storedSessionId);
        console.log('✅ Loaded extracted Aadhaar data:', parsedData);
      } catch (error) {
        console.error('❌ Failed to parse stored Aadhaar data:', error);
        router.push('/');
      }
    } else {
      console.log('❌ No extracted Aadhaar data found, redirecting to home');
      router.push('/');
    }
  }, [router]);

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
            {!verificationResult && !isVerifying && extractedAadhaarData && (
              <>
                {/* Show extracted Aadhaar data */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Real Aadhaar Data Extracted from QR Code:</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <div><strong>Name:</strong> {extractedAadhaarData.name}</div>
                    <div><strong>DOB:</strong> {extractedAadhaarData.dateOfBirth}</div>
                    <div><strong>Gender:</strong> {extractedAadhaarData.gender === 'M' ? 'Male' : 'Female'}</div>
                    <div><strong>Age:</strong> {extractedAadhaarData.age} years</div>
                    <div><strong>Aadhaar:</strong> ****{extractedAadhaarData.aadhaarNumber?.slice(-4)}</div>
                    <div><strong>Address:</strong> {extractedAadhaarData.address}</div>
                    <div><strong>State:</strong> {extractedAadhaarData.state}</div>
                    <div><strong>District:</strong> {extractedAadhaarData.district}</div>
                    <div><strong>Pincode:</strong> {extractedAadhaarData.pincode}</div>
                    <div><strong>Country:</strong> {extractedAadhaarData.country}</div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    ✅ This is REAL data extracted from your uploaded Aadhaar QR code (no dummy data)
                  </p>
                </div>

                <SelfVerification
                  onSuccess={handleVerificationSuccess}
                  onError={handleVerificationError}
                  extractedAadhaarData={extractedAadhaarData}
                  sessionId={sessionId}
                />
              </>
            )}

            {!extractedAadhaarData && (
              <div className="text-center p-6">
                <h3 className="text-lg font-semibold mb-2">Loading...</h3>
                <p className="text-gray-600">Loading extracted Aadhaar data...</p>
              </div>
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
                    <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded">
                      <p className="text-sm text-green-800">
                        ✅ <strong>Real Aadhaar data verified!</strong> The information below is from your uploaded Aadhaar QR code, no dummy data.
                      </p>
                    </div>
                    
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
                          {verificationResult.details.aadhaarNumber && (
                            <div className="flex justify-between">
                              <span>Aadhaar Number:</span>
                              <span className="font-medium">****{verificationResult.details.aadhaarNumber.slice(-4)}</span>
                            </div>
                          )}
                          {verificationResult.details.address && (
                            <div className="flex justify-between">
                              <span>Address:</span>
                              <span className="font-medium text-right max-w-48 truncate">{verificationResult.details.address}</span>
                            </div>
                          )}
                          {verificationResult.details.state && (
                            <div className="flex justify-between">
                              <span>State:</span>
                              <span className="font-medium">{verificationResult.details.state}</span>
                            </div>
                          )}
                          {verificationResult.details.district && (
                            <div className="flex justify-between">
                              <span>District:</span>
                              <span className="font-medium">{verificationResult.details.district}</span>
                            </div>
                          )}
                          {verificationResult.details.pincode && (
                            <div className="flex justify-between">
                              <span>Pincode:</span>
                              <span className="font-medium">{verificationResult.details.pincode}</span>
                            </div>
                          )}
                          {verificationResult.details.country && (
                            <div className="flex justify-between">
                              <span>Country:</span>
                              <span className="font-medium">{verificationResult.details.country}</span>
                            </div>
                          )}
                          {verificationResult.details.age && (
                            <div className="flex justify-between">
                              <span>Age:</span>
                              <span className="font-medium">{verificationResult.details.age} years</span>
                            </div>
                          )}
                          {verificationResult.details.aadhaarVerified && (
                            <div className="flex justify-between">
                              <span>Aadhaar Status:</span>
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
