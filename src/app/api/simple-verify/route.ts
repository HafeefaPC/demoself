import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Simple verification request:', body);

    // Always return success for testing
    return NextResponse.json({
      status: 'success',
      result: true,
      credentialSubject: {
        firstName: 'Test',
        lastName: 'User',
        nationality: 'IN',
        dateOfBirth: '1990-01-01',
        gender: 'M',
        minimumAge: true,
        aadhaarVerified: true,
        kycCompleted: true
      },
      documentType: 'Aadhaar',
      timestamp: new Date().toISOString(),
      attestationId: 3,
      note: 'Simple verification endpoint for testing'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      result: false,
      reason: 'Simple verification failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple Verification API',
    status: 'active',
    endpoint: 'POST /api/simple-verify'
  });
}
