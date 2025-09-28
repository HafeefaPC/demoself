import { NextResponse } from 'next/server';
import { DocumentType } from '@/types/selfProtocol';
import { RealAadhaarQRExtractor } from '@/utils/realAadhaarQRExtractor';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('aadhaar') as File;
    
    if (!file) {
      return NextResponse.json({
        status: 'error',
        reason: 'No file uploaded'
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        status: 'error',
        reason: 'Invalid file type. Please upload JPG, PNG, or PDF'
      }, { status: 400 });
    }

    // Convert file to base64 for processing
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type;

    console.log('🔍 Processing Aadhaar document:', {
      fileName: file.name,
      fileSize: file.size,
      mimeType: mimeType
    });

    // Extract real Aadhaar data from QR code using pyaadhaar approach
    let extractedAadhaarData;
    try {
      extractedAadhaarData = await RealAadhaarQRExtractor.extractFromFile(file);
      console.log('✅ REAL Aadhaar data extracted from QR code:', {
        name: extractedAadhaarData.name,
        aadhaarNumber: extractedAadhaarData.aadhaarNumber,
        address: extractedAadhaarData.address,
        referenceId: extractedAadhaarData.referenceId,
        emailMobileStatus: extractedAadhaarData.emailMobileStatus
      });
    } catch (extractionError) {
      console.error('❌ QR extraction failed:', extractionError);
      
      // Provide helpful error message with alternatives
      const errorMessage = extractionError instanceof Error ? extractionError.message : 'Unknown error';
      
      if (errorMessage.includes('Failed to decode Aadhaar QR code using the specialized library')) {
        throw new Error(
          '✅ Aadhaar QR code detected! Your QR code contains real Aadhaar data but cannot be decoded with the current library. ' +
          'Please use the "Enter Your Real Aadhaar Data" option to input your information manually.'
        );
      } else if (errorMessage.includes('Compressed Aadhaar QR code')) {
        throw new Error(
          'Compressed Aadhaar QR code detected. This QR code contains compressed data that requires specialized decoding. ' +
          'Please use the "Enter Your Real Aadhaar Data" option to input your information manually.'
        );
      } else if (errorMessage.includes('Failed to decode QR code using pyaadhaar')) {
        throw new Error(
          'Aadhaar QR code detected but decoding library is not properly configured. ' +
          'Please use the "Enter Your Real Aadhaar Data" option to input your information manually.'
        );
      } else if (errorMessage.includes('Encrypted Aadhaar QR code')) {
        throw new Error(
          'Encrypted Aadhaar QR code detected. This QR code contains encrypted data that requires special decryption keys. ' +
          'Please use the "Enter Your Real Aadhaar Data" option instead to input your information manually, ' +
          'or try a different Aadhaar document with an unencrypted QR code.'
        );
      } else {
        throw new Error(
          `Failed to extract Aadhaar data from QR code: ${errorMessage}. ` +
          'Please try using the "Enter Your Real Aadhaar Data" option instead, ' +
          'or ensure your Aadhaar document has a clear, readable QR code.'
        );
      }
    }

    // Generate a session ID for tracking
    const sessionId = crypto.randomUUID();
    
    // Store the extracted data (in a real app, you'd store this in a database)
    // For now, we'll return it in the response
    console.log('✅ Aadhaar data extracted successfully:', {
      sessionId,
      name: extractedAadhaarData.name,
      aadhaarNumber: extractedAadhaarData.aadhaarNumber,
      address: extractedAadhaarData.address
    });

    return NextResponse.json({
      status: 'success',
      sessionId: sessionId,
      aadhaarData: extractedAadhaarData,
      documentType: 'Aadhaar',
      timestamp: new Date().toISOString(),
      note: 'Aadhaar data extracted from uploaded document'
    });

  } catch (error) {
    console.error('❌ Aadhaar processing error:', error);
    
    return NextResponse.json({
      status: 'error',
      reason: error instanceof Error ? error.message : 'Failed to process Aadhaar document'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Aadhaar Document Processing API',
    status: 'active',
    endpoint: 'POST /api/process-aadhaar',
    supportedFormats: ['JPG', 'PNG', 'PDF']
  });
}
