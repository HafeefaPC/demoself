import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const aadhaarFile = formData.get('aadhaar') as File;

    if (!aadhaarFile) {
      return NextResponse.json({ error: 'No Aadhaar file uploaded' }, { status: 400 });
    }

    // For demo purposes, simulate Aadhaar QR code reading
    // In a real implementation, you would:
    // 1. Use OCR to extract QR code from the image
    // 2. Decode the QR code data
    // 3. Parse the Aadhaar XML data
    // 4. Extract personal details

    console.log('Processing Aadhaar file:', {
      name: aadhaarFile.name,
      size: aadhaarFile.size,
      type: aadhaarFile.type
    });

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock Aadhaar data extracted from QR code
    const aadhaarData = {
      uid: '123456789012',
      name: 'John Doe',
      gender: 'M',
      yearOfBirth: '1990',
      careOf: 'Father Name',
      house: '123',
      street: 'Main Street',
      landmark: 'Near School',
      locality: 'Village Name',
      vtc: 'City Name',
      postOffice: 'Post Office',
      district: 'District Name',
      state: 'State Name',
      pincode: '123456',
      photo: 'base64_encoded_photo_data'
    };

    return NextResponse.json({
      success: true,
      message: 'Aadhaar QR code read successfully',
      data: aadhaarData,
      extractedFrom: 'QR Code',
      verificationMethod: 'Document Upload + QR Reading'
    });

  } catch (error) {
    console.error('Error reading Aadhaar QR:', error);
    return NextResponse.json({ 
      error: 'Failed to read Aadhaar QR code',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Aadhaar QR Code Reader API',
    status: 'active',
    endpoint: 'POST /api/read-aadhaar-qr',
    note: 'This endpoint reads Aadhaar QR codes from uploaded documents'
  });
}
