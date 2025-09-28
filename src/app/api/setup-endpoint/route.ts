import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Self Protocol Endpoint Setup',
    instructions: [
      '1. For local development, use ngrok:',
      '   - Install: npm install -g ngrok',
      '   - Run: ngrok http 3000',
      '   - Copy the HTTPS URL (e.g., https://abc123.ngrok.io)',
      '   - Update endpoint to: https://abc123.ngrok.io/api/verify',
      '',
      '2. For production, ensure your Vercel deployment:',
      '   - Has deployment protection disabled',
      '   - Is accessible from mobile networks',
      '   - Uses HTTPS protocol',
      '',
      '3. Alternative: Use your local network IP:',
      '   - Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)',
      '   - Use: http://YOUR_IP:3000/api/verify',
      '   - Ensure mobile and computer are on same network'
    ],
    currentEndpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'https://demoself-jet.vercel.app/api/verify',
    testEndpoints: [
      'https://demoself-jet.vercel.app/api/verify',
      'https://demoself-jet.vercel.app/api/test-verify'
    ]
  });
}

export async function POST(req: Request) {
  try {
    const { endpoint } = await req.json();
    
    // Validate the endpoint
    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
    
    // Test the endpoint
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      return NextResponse.json({
        success: true,
        endpoint,
        status: response.status,
        message: 'Endpoint is accessible'
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Endpoint is not accessible'
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
