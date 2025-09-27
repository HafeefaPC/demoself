import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Test verification request:', body);

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
      note: 'Test verification endpoint'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      result: false,
      reason: 'Test verification failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Self Protocol Test Verification API',
    status: 'active',
    endpoint: 'POST /api/test-verify'
  });
}
