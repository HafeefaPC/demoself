'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      // Process the uploaded Aadhaar document
      const formData = new FormData();
      formData.append('aadhaar', selectedFile);
      
      // Upload to our API endpoint
      const response = await fetch('/api/upload-aadhaar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Store the document ID for verification
      localStorage.setItem('aadhaarDocumentId', result.documentId);
      
      // Navigate to verification page
      router.push('/verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
              <h2 className="text-xl font-semibold mb-4">Upload Your Aadhaar</h2>
              <p className="text-sm mb-6">
                Upload your Aadhaar document for KYC verification using Self Protocol
              </p>

              {/* File Upload */}
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
              </div>

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
                {isUploading ? 'Processing...' : 'Start Verification'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>KYC verification using Self Protocol</p>
            <p>Zero-knowledge proofs for privacy protection</p>
          </div>
        </div>
      </div>
    </div>
  );
}
