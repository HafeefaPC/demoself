import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Mock Self verification request:', body);

    // Simulate a real Self Protocol response
    const mockProof = {
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
      proof: {
        pi_a: ['1234567890abcdef', 'abcdef1234567890'],
        pi_b: [['1234567890abcdef', 'abcdef1234567890'], ['abcdef1234567890', '1234567890abcdef']],
        pi_c: ['1234567890abcdef', 'abcdef1234567890']
      },
      publicSignals: ['1', '2', '3', '4', '5'],
      userContextData: '0x1234567890abcdef'
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      status: 'success',
      result: true,
      credentialSubject: mockProof.credentialSubject,
      documentType: 'Aadhaar',
      timestamp: new Date().toISOString(),
      attestationId: 3,
      proofSource: 'mock_self_protocol',
      note: 'This is a mock response for testing. In production, this would be real Self Protocol verification.'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      result: false,
      reason: 'Mock verification failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Mock Self Protocol Verification API',
    status: 'active',
    endpoint: 'POST /api/mock-self-verify',
    note: 'This endpoint simulates Self Protocol verification for testing purposes'
  });
}
