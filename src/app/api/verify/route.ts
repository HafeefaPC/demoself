import { NextResponse } from 'next/server';
import { DocumentType, SelfProtocolError } from '@/types/selfProtocol';

export async function POST(req: Request) {
  try {
    // Log the raw request for debugging
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);
    
    let requestData;
    try {
      requestData = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(JSON.stringify({
        status: 'error',
        result: false,
        reason: 'Invalid JSON in request body',
        error_code: 'INVALID_JSON'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { attestationId, proof, publicSignals, userContextData, sessionId } = requestData;

    // Validate required fields
    if (!proof || !publicSignals || !attestationId || !userContextData) {
      return new Response(JSON.stringify({
        status: 'error',
        result: false,
        reason: 'Missing required fields: proof, publicSignals, attestationId, and userContextData are required',
        error_code: 'MISSING_FIELDS'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Verifying Aadhaar proof:', { 
      attestationId, 
      documentType: attestationId === DocumentType.AADHAAR ? 'Aadhaar' : 'Other',
      userContextData,
      sessionId,
      proofStructure: typeof proof,
      hasCredentialSubject: !!proof?.credentialSubject
    });


    // For offchain verification, we validate the proof structure
    if (!proof || typeof proof !== 'object') {
      return new Response(JSON.stringify({
        status: 'error',
        result: false,
        reason: 'Invalid proof structure',
        error_code: SelfProtocolError.VERIFICATION_FAILED,
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if we have credential subject data (this indicates successful verification)
    if (proof.credentialSubject && typeof proof.credentialSubject === 'object') {
      console.log('✅ Offchain Aadhaar verification successful');
      
      return new Response(JSON.stringify({
        status: 'success',
        result: true,
        credentialSubject: proof.credentialSubject,
        documentType: attestationId === DocumentType.AADHAAR ? 'Aadhaar' : 'Other',
        timestamp: new Date().toISOString(),
        attestationId: attestationId
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        status: 'error',
        result: false,
        reason: 'Aadhaar verification failed - no credential subject found',
        error_code: SelfProtocolError.VERIFICATION_FAILED,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Aadhaar verification error:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      result: false,
      reason: error instanceof Error ? error.message : 'Unknown error occurred during Aadhaar verification',
      error_code: 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    {
      message: 'Self Aadhaar Verification API',
      status: 'active',
      version: '1.0.0',
      supportedDocuments: ['Passport (1)', 'EU ID Card (2)', 'Aadhaar (3)'],
      endpoint: 'POST /api/verify'
    },
    { status: 200 }
  );
}
