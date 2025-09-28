'use client';

import React, { useState, useRef } from 'react';
import QrScanner from 'qr-scanner';

interface AadhaarData {
  name: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  aadhaarNumber: string;
  photo?: string;
}

interface AadhaarQRProcessorProps {
  onAadhaarProcessed: (data: AadhaarData) => void;
  onError: (error: string) => void;
}

export default function AadhaarQRProcessor({ onAadhaarProcessed, onError }: AadhaarQRProcessorProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  // Parse Aadhaar XML data - handles both old and new Secure QR formats
  const parseAadhaarXML = (xmlString: string): AadhaarData | null => {
    try {
      console.log('Raw QR data received:', xmlString.substring(0, 200) + '...');
      
      // Check if it's a Secure QR Code (encrypted format)
      if (xmlString.includes('<?xml') === false && xmlString.length > 100) {
        throw new Error('This appears to be a Secure QR Code (encrypted). Please use UIDAI\'s official Secure QR Code Reader or an older Aadhaar card with the legacy QR format.');
      }
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Check for XML parsing errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Invalid XML format in QR code');
      }
      
      // Try multiple possible XML structures
      let name = '', dateOfBirth = '', gender = '', address = '', aadhaarNumber = '', photo = '';
      
      // Method 1: PrintLetterBannerData structure (legacy format)
      const bannerData = xmlDoc.querySelector('PrintLetterBannerData');
      if (bannerData) {
        name = bannerData.getAttribute('name') || '';
        dateOfBirth = bannerData.getAttribute('dob') || '';
        gender = bannerData.getAttribute('gender') || '';
        address = bannerData.getAttribute('loc') || '';
        aadhaarNumber = bannerData.getAttribute('uid') || '';
        const photoElement = bannerData.getAttribute('photo');
        photo = photoElement ? `data:image/jpeg;base64,${photoElement}` : '';
      }
      
      // Method 2: Alternative XML structure
      if (!name) {
        name = xmlDoc.querySelector('name')?.textContent || '';
        dateOfBirth = xmlDoc.querySelector('dob')?.textContent || '';
        gender = xmlDoc.querySelector('gender')?.textContent || '';
        address = xmlDoc.querySelector('loc')?.textContent || '';
        aadhaarNumber = xmlDoc.querySelector('uid')?.textContent || '';
      }
      
      // Method 3: Direct text content parsing
      if (!name) {
        const textContent = xmlDoc.textContent || '';
        const nameMatch = textContent.match(/name[="\s]*([^<>\n]+)/i);
        const dobMatch = textContent.match(/dob[="\s]*([^<>\n]+)/i);
        const genderMatch = textContent.match(/gender[="\s]*([^<>\n]+)/i);
        const uidMatch = textContent.match(/uid[="\s]*([^<>\n]+)/i);
        
        if (nameMatch) name = nameMatch[1].trim();
        if (dobMatch) dateOfBirth = dobMatch[1].trim();
        if (genderMatch) gender = genderMatch[1].trim();
        if (uidMatch) aadhaarNumber = uidMatch[1].trim();
      }

      // Validate required fields
      if (!name || !dateOfBirth || !aadhaarNumber) {
        console.log('Missing fields:', { name: !!name, dateOfBirth: !!dateOfBirth, aadhaarNumber: !!aadhaarNumber });
        console.log('Available XML content:', xmlDoc.textContent ? (xmlDoc.textContent as string).substring(0, 500) : 'No content');
        throw new Error(`Invalid Aadhaar data: Missing required fields. Found: name=${!!name}, dob=${!!dateOfBirth}, uid=${!!aadhaarNumber}`);
      }

      return {
        name: name.trim(),
        dateOfBirth: dateOfBirth.trim(),
        gender: gender.trim(),
        address: address.trim(),
        aadhaarNumber: aadhaarNumber.trim(),
        photo: photo || undefined
      };
    } catch (error) {
      console.error('Error parsing Aadhaar XML:', error);
      return null;
    }
  };

  // Validate Aadhaar number checksum
  const validateAadhaarChecksum = (aadhaarNumber: string): boolean => {
    if (aadhaarNumber.length !== 12) return false;
    
    // Verhoeff algorithm for Aadhaar validation
    const d = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
      [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
      [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
      [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];

    const p = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
      [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
      [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
      [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
      [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
      [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
      [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];

    let c = 0;
    const invertedArray = aadhaarNumber.split('').reverse().map(Number);

    for (let i = 0; i < invertedArray.length; i++) {
      c = d[c][p[((i + 1) % 8)][invertedArray[i]]];
    }

    return c === 0;
  };

  // Process QR code from file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const result = await QrScanner.scanImage(file);
      console.log('QR Scanner result:', result);
      
      const aadhaarData = parseAadhaarXML(result);

      if (!aadhaarData) {
        // Check if it's a Secure QR Code
        if (result.includes('<?xml') === false && result.length > 100) {
          throw new Error('This is a Secure QR Code (encrypted by UIDAI). Please use an older Aadhaar card with legacy QR format, or use the mock data button for testing.');
        }
        throw new Error('Invalid Aadhaar QR code format. Please ensure you\'re scanning a valid Aadhaar QR code.');
      }

      if (!validateAadhaarChecksum(aadhaarData.aadhaarNumber)) {
        throw new Error('Invalid Aadhaar number checksum. Please verify the QR code is from a valid Aadhaar card.');
      }

      onAadhaarProcessed(aadhaarData);
    } catch (error) {
      console.error('Error processing Aadhaar QR:', error);
      onError(error instanceof Error ? error.message : 'Failed to process Aadhaar QR code');
    } finally {
      setIsProcessing(false);
    }
  };

  // Start camera scanning
  const startCameraScan = async () => {
    try {
      setIsScanning(true);
      
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('Camera QR result:', result.data);
          const aadhaarData = parseAadhaarXML(result.data);
          
          if (!aadhaarData) {
            // Check if it's a Secure QR Code
            if (result.data.includes('<?xml') === false && result.data.length > 100) {
              onError('This is a Secure QR Code (encrypted by UIDAI). Please use an older Aadhaar card with legacy QR format, or use the mock data button for testing.');
            } else {
              onError('Invalid Aadhaar QR code format. Please ensure you\'re scanning a valid Aadhaar QR code.');
            }
            return;
          }

          if (!validateAadhaarChecksum(aadhaarData.aadhaarNumber)) {
            onError('Invalid Aadhaar number checksum. Please verify the QR code is from a valid Aadhaar card.');
            return;
          }

          qrScanner.stop();
          setIsScanning(false);
          onAadhaarProcessed(aadhaarData);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScannerRef.current = qrScanner;
      await qrScanner.start();
    } catch (error) {
      console.error('Error starting camera scan:', error);
      onError('Failed to start camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  // Stop camera scanning
  const stopCameraScan = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="border border-black p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Scan Aadhaar QR Code</h3>
        
        {/* File Upload Option */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Upload QR Code Image:</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-100 file:text-black
              hover:file:bg-gray-200
              cursor-pointer border border-gray-300 p-2"
            disabled={isProcessing || isScanning}
          />
          {selectedFile && (
            <p className="text-xs text-gray-600 mt-1">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        {/* Camera Scan Option */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Or Scan with Camera:</label>
          {!isScanning ? (
            <button
              onClick={startCameraScan}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Start Camera Scan
            </button>
          ) : (
            <div>
              <video
                ref={videoRef}
                className="w-full h-48 bg-gray-100 border border-gray-300"
              />
              <button
                onClick={stopCameraScan}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 mt-2"
              >
                Stop Camera
              </button>
            </div>
          )}
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Processing Aadhaar QR code...</p>
          </div>
        )}

        {/* Mock Data Button for Testing */}
        <div className="mt-4">
          <button
            onClick={() => {
              const mockData: AadhaarData = {
                name: 'John Doe',
                dateOfBirth: '01/01/1990',
                gender: 'M',
                address: '123 Main Street, City, State, 123456',
                aadhaarNumber: '123456789012'
              };
              onAadhaarProcessed(mockData);
            }}
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 text-sm"
          >
            Use Mock Data for Testing
          </button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 mt-4">
          <p className="font-semibold mb-1">Instructions:</p>
          <ul className="space-y-1">
            <li>• Upload a clear image of your Aadhaar QR code</li>
            <li>• Or use your camera to scan the QR code directly</li>
            <li>• Ensure good lighting and focus for best results</li>
            <li>• <strong>Note:</strong> New Secure QR Codes are encrypted and require UIDAI's official reader</li>
            <li>• For testing, use the "Mock Data" button above</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
