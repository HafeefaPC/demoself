import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('🔍 DEBUG: Full request body received:', JSON.stringify(body, null, 2));

    const { attestationId, proof, publicSignals, userContextData, sessionId } = body;

    // Detailed analysis of the proof structure
    const analysis = {
      timestamp: new Date().toISOString(),
      sessionId: sessionId,
      attestationId: attestationId,
      proofAnalysis: {
        exists: !!proof,
        type: typeof proof,
        isObject: typeof proof === 'object',
        keys: proof ? Object.keys(proof) : [],
        values: proof ? Object.keys(proof).reduce((acc, key) => {
          acc[key] = {
            type: typeof proof[key],
            value: proof[key],
            isObject: typeof proof[key] === 'object',
            keys: typeof proof[key] === 'object' ? Object.keys(proof[key]) : []
          };
          return acc;
        }, {} as any) : {}
      },
      credentialSubjectAnalysis: null as any,
      recommendations: [] as string[]
    };

    // Try to find credential subject
    let credentialSubject = null;
    const possiblePaths = [
      'credentialSubject',
      'data.credentialSubject',
      'result.credentialSubject',
      'discloseOutput',
      'credential.credentialSubject',
      'attributes',
      'verifiedData',
      'aadhaarData',
      'qrData',
      'documentData',
      'identityData',
      'userData',
      'personalData'
    ];

    for (const path of possiblePaths) {
      const keys = path.split('.');
      let current = proof;
      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          current = null;
          break;
        }
      }
      if (current && typeof current === 'object') {
        credentialSubject = current;
        analysis.credentialSubjectAnalysis = {
          foundAt: path,
          keys: Object.keys(current),
          values: current,
          hasRealData: !!(current.firstName || current.name || current.dateOfBirth || current.gender)
        };
        break;
      }
    }

    // Generate recommendations
    if (!proof) {
      analysis.recommendations.push('No proof received - check mobile app connection');
    } else if (!credentialSubject) {
      analysis.recommendations.push('Proof received but no credential subject found');
      analysis.recommendations.push('Check if Aadhaar QR code was properly scanned');
    } else if (!analysis.credentialSubjectAnalysis?.hasRealData) {
      analysis.recommendations.push('Credential subject found but contains no real Aadhaar data');
      analysis.recommendations.push('Ensure you scanned a valid Aadhaar QR code');
    } else {
      analysis.recommendations.push('Valid Aadhaar data found in proof');
    }

    return NextResponse.json({
      status: 'debug',
      message: 'Proof structure analysis completed',
      analysis: analysis,
      fullProof: proof // Include full proof for inspection
    });

  } catch (error) {
    console.error('Debug proof error:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze proof',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Proof Debug API',
    status: 'active',
    endpoint: 'POST /api/debug-proof',
    note: 'This endpoint analyzes proof structures for debugging'
  });
}
