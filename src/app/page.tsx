'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AadhaarDataInput from '@/components/AadhaarDataInput';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDataInput, setShowDataInput] = useState(false);
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid Aadhaar document (JPG, PNG, or PDF)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an Aadhaar document first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Process the uploaded Aadhaar document and extract QR code data
      const formData = new FormData();
      formData.append('aadhaar', selectedFile);
      
      const response = await fetch('/api/process-aadhaar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status !== 'success') {
        throw new Error(result.reason || 'Failed to process Aadhaar document');
      }

      // Store the extracted Aadhaar data for Self Protocol verification
      localStorage.setItem('extractedAadhaarData', JSON.stringify(result.aadhaarData));
      localStorage.setItem('verificationSessionId', result.sessionId);
      
      console.log('✅ Aadhaar data extracted and stored:', result.aadhaarData);
      
      // Navigate to verification page
      router.push('/verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process Aadhaar document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRealDataSubmit = (aadhaarData: any) => {
    // Store the real Aadhaar data
    localStorage.setItem('extractedAadhaarData', JSON.stringify(aadhaarData));
    localStorage.setItem('verificationSessionId', crypto.randomUUID());
    
    console.log('✅ Real Aadhaar data submitted:', aadhaarData);
    
    // Navigate to verification page
    router.push('/verify');
  };


  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Self Protocol</h1>
            <p className="text-gray-600">Aadhaar KYC Verification</p>
          </div>

          {/* Main Card */}
          <div className="border border-black p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Self Protocol Aadhaar QR Verification</h2>
              <p className="text-sm mb-6">
                Verify Aadhaar identity using QR codes with Self Protocol's zero-knowledge proofs.
              </p>
              
              <div className="bg-blue-100 border border-blue-300 p-3 mb-4 text-left">
                <h3 className="font-semibold text-blue-800 mb-2">📱 Real Aadhaar QR Code Extraction:</h3>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. <strong>Upload your Aadhaar document</strong> with QR code</li>
                  <li>2. <strong>Real QR code extraction</strong> using pyaadhaar approach</li>
                  <li>3. <strong>Self Protocol verification</strong> with extracted data</li>
                  <li>4. <strong>Your real Aadhaar data displayed</strong> (no dummy data)</li>
                </ol>
              </div>

              {/* Option to enter real data */}
              {!showDataInput && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowDataInput(true)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 mb-2"
                  >
                    📝 Enter Your Real Aadhaar Data (Alternative)
                  </button>
                  <p className="text-xs text-gray-600 text-center">
                    Or upload your Aadhaar document with QR code below
                  </p>
                </div>
              )}

              {showDataInput && (
                <AadhaarDataInput onDataSubmit={handleRealDataSubmit} />
              )}

              {/* File Upload */}
              {!showDataInput && (
                <div className="mb-6">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-gray-100 file:text-black
                      hover:file:bg-gray-200
                      cursor-pointer border border-gray-300 p-2"
                  />

                  {/* Selected File Display */}
                  {selectedFile && (
                    <div className="mb-6 p-3 bg-gray-100 border border-gray-300">
                      <div className="flex items-center justify-center">
                        <span className="text-sm font-medium">
                          ✓ {selectedFile.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="mb-6 p-3 bg-red-100 border border-red-300">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Upload Button */}
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="w-full bg-black text-white py-3 px-6 font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Processing...' : 'Start Aadhaar QR Verification'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>📱 Upload your Aadhaar document with QR code</p>
            <p>🔍 Real QR code extraction using pyaadhaar approach</p>
            <p>🔐 Zero-knowledge proofs preserve privacy while verifying identity</p>
            <p className="mt-2 text-green-600 font-semibold">✅ Real Aadhaar data extracted from QR code (no dummy data)</p>
          </div>
        </div>
      </div>
    </div>
  );
}