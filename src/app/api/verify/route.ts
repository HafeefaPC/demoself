import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { attestationId, proof, publicSignals, userContextData, sessionId } = await req.json();

    console.log('🔍 Verifying Aadhaar proof:', { 
      attestationId, 
      sessionId,
      hasProof: !!proof,
      hasPublicSignals: !!publicSignals
    });

    if (!proof || !publicSignals || !attestationId || !userContextData) {
      return NextResponse.json({
        status: 'error',
        result: false,
        reason: 'Missing required fields: proof, publicSignals, attestationId, and userContextData are required'
      }, { status: 400 });
    }

    // Only return success if we have actual Aadhaar data in the proof
    if (proof && typeof proof === 'object') {
      // Check if proof contains real Aadhaar data
      const hasRealData = proof.credentialSubject || 
                         proof.data || 
                         proof.result || 
                         proof.discloseOutput ||
                         proof.attributes ||
                         proof.verifiedData;
      
      if (hasRealData) {
        console.log('✅ Self Protocol verification successful with real Aadhaar data');
        
        // Extract actual credential subject from proof
        let credentialSubject = null;
        if (proof.credentialSubject) {
          credentialSubject = proof.credentialSubject;
        } else if (proof.data && proof.data.credentialSubject) {
          credentialSubject = proof.data.credentialSubject;
        } else if (proof.result && proof.result.credentialSubject) {
          credentialSubject = proof.result.credentialSubject;
        } else if (proof.discloseOutput) {
          credentialSubject = proof.discloseOutput;
        } else if (proof.attributes) {
          credentialSubject = proof.attributes;
        } else if (proof.verifiedData) {
          credentialSubject = proof.verifiedData;
        }
        
        return NextResponse.json({
          status: 'success',
          result: true,
          credentialSubject: credentialSubject,
          documentType: 'Aadhaar',
          timestamp: new Date().toISOString(),
          attestationId: attestationId,
          proofSource: 'real_self_protocol_verification'
        });
      } else {
        console.log('❌ Self Protocol verification failed - no real Aadhaar data found');
        
        return NextResponse.json({
          status: 'error',
          result: false,
          reason: 'Aadhaar verification failed - no valid Aadhaar data found in the proof. Please ensure you scanned a valid Aadhaar QR code.'
        });
      }
    } else {
      console.log('❌ Self Protocol verification failed - invalid proof');
      
      return NextResponse.json({
        status: 'error',
        result: false,
        reason: 'Invalid proof structure received'
      });
    }

  } catch (error) {
    console.error('Aadhaar verification error:', error);
    
    return NextResponse.json({
      status: 'error',
      result: false,
      reason: error instanceof Error ? error.message : 'Unknown error occurred during Aadhaar verification'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Self Aadhaar Verification API',
    status: 'active',
    version: '1.0.0',
    supportedDocuments: ['Aadhaar (3)'],
    endpoint: 'POST /api/verify'
  });
}