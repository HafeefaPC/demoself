import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const aadhaarFile = formData.get('aadhaar') as File;

    if (!aadhaarFile) {
      return NextResponse.json(
        { error: 'No Aadhaar file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(aadhaarFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, or PDF' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (aadhaarFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Process the Aadhaar document
    // 2. Extract text using OCR
    // 3. Validate Aadhaar number format
    // 4. Store the document securely
    // 5. Generate a verification token

    // For now, we'll simulate successful processing
    const mockProcessingResult = {
      success: true,
      message: 'Aadhaar document processed successfully',
      documentId: `aadhaar_${Date.now()}`,
      extractedData: {
        fileName: aadhaarFile.name,
        fileSize: aadhaarFile.size,
        fileType: aadhaarFile.type,
        processedAt: new Date().toISOString()
      },
      nextStep: 'verification'
    };

    return NextResponse.json(mockProcessingResult);

  } catch (error) {
    console.error('Aadhaar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process Aadhaar document' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Aadhaar Upload API',
      status: 'active',
      supportedFormats: ['JPG', 'PNG', 'PDF'],
      maxFileSize: '10MB'
    },
    { status: 200 }
  );
}
