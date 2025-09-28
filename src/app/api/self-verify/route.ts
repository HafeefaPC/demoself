import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Self Protocol verification request:', body);

    // Always return success for testing - this simulates successful Self Protocol verification
    return NextResponse.json({
      status: 'success',
      result: true,
      credentialSubject: {
        firstName: 'John',
        lastName: 'Doe',
        nationality: 'IN',
        dateOfBirth: '1990-05-15',
        gender: 'M',
        minimumAge: true,
        aadhaarVerified: true,
        kycCompleted: true
      },
      documentType: 'Aadhaar',
      timestamp: new Date().toISOString(),
      attestationId: 3,
      proofSource: 'self_protocol_simulation'
    });
  } catch (error) {
    console.error('Self verification error:', error);
    return NextResponse.json({
      status: 'error',
      result: false,
      reason: 'Self verification failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Self Protocol Verification API',
    status: 'active',
    endpoint: 'POST /api/self-verify',
    note: 'This endpoint simulates Self Protocol verification'
  });
}
