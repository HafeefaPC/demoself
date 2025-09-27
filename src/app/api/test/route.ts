import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    console.log('Test endpoint - Raw request body:', rawBody);
    
    return NextResponse.json({
      status: 'success',
      message: 'Test endpoint working',
      receivedData: rawBody,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Test endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test endpoint is working',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}
