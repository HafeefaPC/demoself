'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testEndpoint = async () => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attestationId: 3,
          proof: {
            credentialSubject: {
              firstName: 'Debug',
              lastName: 'Test',
              nationality: 'IN',
              dateOfBirth: '1990-01-01',
              gender: 'M',
              minimumAge: true,
              aadhaarVerified: true,
              kycCompleted: true
            }
          },
          publicSignals: [],
          userContextData: '0x0',
          sessionId: 'debug-session'
        }),
      });

      const result = await response.json();
      setDebugInfo(result);
    } catch (error) {
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Self Protocol Debug Page</h1>
        
        <div className="space-y-6">
          <div className="border border-black p-6">
            <h2 className="text-xl font-semibold mb-4">Endpoint Testing</h2>
            <button
              onClick={testEndpoint}
              className="bg-black text-white py-2 px-4 font-semibold hover:bg-gray-800"
            >
              Test Real Verification Endpoint
            </button>
          </div>

          {debugInfo && (
            <div className="border border-black p-6">
              <h2 className="text-xl font-semibold mb-4">Debug Results</h2>
              <pre className="bg-gray-100 p-4 overflow-auto text-sm">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          <div className="border border-black p-6">
            <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Endpoint:</strong> {process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'https://demoself-jet.vercel.app/api/verify'}</p>
              <p><strong>App Name:</strong> {process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Aadhaar KYC Verification'}</p>
              <p><strong>Scope:</strong> {process.env.NEXT_PUBLIC_SELF_SCOPE || 'aadhaar-verification'}</p>
            </div>
          </div>

          <div className="border border-black p-6">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to the main app: <a href="/" className="text-blue-600 underline">/</a></li>
              <li>Upload an Aadhaar document</li>
              <li>Click "Start Verification"</li>
              <li>Scan the QR code with Self mobile app</li>
              <li>Check the browser console for detailed logs</li>
              <li>Check the network tab to see the API calls</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}