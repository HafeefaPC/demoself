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


    // For real offchain verification, we validate the proof structure
    if (!proof || typeof proof !== 'object') {
      console.log('❌ Invalid proof structure received:', { proof, type: typeof proof });
      
      return new Response(JSON.stringify({
        status: 'error',
        result: false,
        reason: 'Invalid proof structure - proof is null or not an object. Please ensure the Self mobile app can connect to your endpoint.',
        error_code: SelfProtocolError.VERIFICATION_FAILED,
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract credential subject from various possible proof structures
    let credentialSubject = null;
    
    // Check different possible structures for credential subject
    if (proof.credentialSubject) {
      credentialSubject = proof.credentialSubject;
    } else if (proof.data && proof.data.credentialSubject) {
      credentialSubject = proof.data.credentialSubject;
    } else if (proof.result && proof.result.credentialSubject) {
      credentialSubject = proof.result.credentialSubject;
    } else if (proof.discloseOutput) {
      credentialSubject = proof.discloseOutput;
    } else if (proof.credential && proof.credential.credentialSubject) {
      credentialSubject = proof.credential.credentialSubject;
    }

    console.log('🔍 Extracted credential subject:', { 
      credentialSubject, 
      proofKeys: Object.keys(proof),
      hasCredentialSubject: !!credentialSubject 
    });

    // Check if we have valid credential subject data
    if (credentialSubject && typeof credentialSubject === 'object' && Object.keys(credentialSubject).length > 0) {
      console.log('✅ Real Aadhaar verification successful with actual user data');
      
      return new Response(JSON.stringify({
        status: 'success',
        result: true,
        credentialSubject: credentialSubject,
        documentType: attestationId === DocumentType.AADHAAR ? 'Aadhaar' : 'Other',
        timestamp: new Date().toISOString(),
        attestationId: attestationId,
        proofSource: 'real_self_protocol'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      console.log('❌ No valid credential subject found in proof:', { 
        proof, 
        credentialSubject,
        proofStructure: typeof proof,
        proofKeys: Object.keys(proof || {})
      });
      
      return new Response(JSON.stringify({
        status: 'error',
        result: false,
        reason: 'Aadhaar verification failed - no valid credential subject found. The Self mobile app may not have generated a proper proof.',
        error_code: SelfProtocolError.VERIFICATION_FAILED,
        timestamp: new Date().toISOString(),
        debug: {
          proofKeys: Object.keys(proof || {}),
          hasCredentialSubject: !!credentialSubject
        }
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
