import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { attestationId, proof, publicSignals, userContextData } = await req.json();

    console.log('Mock verification request:', { 
      attestationId, 
      documentType: attestationId === 3 ? 'Aadhaar' : 'Other',
      userContextData 
    });

    // Simulate successful Aadhaar verification
    const mockResult = {
      status: 'success',
      result: true,
      credentialSubject: {
        firstName: 'Rajesh',
        lastName: 'Kumar',
        nationality: 'IN',
        dateOfBirth: '1990-06-15',
        gender: 'M',
        minimumAge: true,
        aadhaarVerified: true,
        kycCompleted: true
      },
      documentType: 'Aadhaar',
      timestamp: new Date().toISOString(),
      attestationId: attestationId
    };

    return new Response(JSON.stringify(mockResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Mock verification error:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      result: false,
      reason: error instanceof Error ? error.message : 'Mock verification failed',
      error_code: 'MOCK_ERROR',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Mock Aadhaar Verification API',
      status: 'active',
      version: '1.0.0',
      note: 'This is a mock endpoint for demo purposes'
    },
    { status: 200 }
  );
}
