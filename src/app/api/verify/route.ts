import { NextResponse } from 'next/server';
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from '@selfxyz/core';
import { DocumentType, SelfProtocolError } from '@/types/selfProtocol';

// Initialize Self Backend Verifier for Aadhaar verification (offchain)
const selfBackendVerifier = new SelfBackendVerifier(
  'aadhaar-verification', // scope
  process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'https://your-backend-url.com/api/verify', // endpoint
  true, // mockPassport: true for staging/testing, false for production
  AllIds, // supported document types (includes Aadhaar = 3)
  new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: [], // Add countries to exclude if needed
    ofac: false, // Set to true to check OFAC sanctions list
  }),
  'uuid' // userIdentifierType - correct for offchain verification
);

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

    // Validate that we have real proof data, not mock data
    if (proof?.credentialSubject && !proof.proof && !proof.publicSignals) {
      console.log('Received mock data instead of real proof - this indicates a tunnel/connection issue');
      return new Response(JSON.stringify({
        status: 'error',
        result: false,
        reason: 'Tunnel connection failed - received mock data instead of real proof. Please ensure your endpoint is accessible.',
        error_code: SelfProtocolError.TUNNEL_CONNECTION_FAILED,
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify the proof using Self Backend Verifier (offchain) for real proofs
    // attestationId: 1 = passport, 2 = EU ID card, 3 = Aadhaar
    const verificationResult = await selfBackendVerifier.verify(
      attestationId,
      proof,
      publicSignals,
      userContextData
    );

    console.log('Aadhaar verification result:', verificationResult);

    // Check if verification is valid (original verify method structure)
    if (verificationResult.isValidDetails.isValid) {
      return new Response(JSON.stringify({
        status: 'success',
        result: true,
        credentialSubject: verificationResult.discloseOutput,
        documentType: attestationId === 3 ? 'Aadhaar' : 'Other',
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
        reason: 'Aadhaar verification failed',
        error_code: 'VERIFICATION_FAILED',
        details: verificationResult.isValidDetails,
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
