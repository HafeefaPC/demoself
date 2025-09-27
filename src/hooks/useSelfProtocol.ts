import { useState, useEffect, useCallback } from 'react';
import { SelfAppBuilder, SelfQRcodeWrapper } from '@selfxyz/qrcode';
import { generateSessionId, generateUserId, createAppLogo, logVerificationEvent, sanitizeForLogging, validateSelfConfig, validateEndpoint, getNgrokSetupInstructions, isDevelopmentTunnel } from '@/utils/selfProtocol';
import { DocumentType } from '@/types/selfProtocol';

interface SelfProtocolState {
  selfApp: any | null;
  isInitialized: boolean;
  isProcessing: boolean;
  error: string | null;
  sessionId: string | null;
}

interface SelfProtocolActions {
  initializeSelfApp: () => Promise<void>;
  handleVerificationSuccess: (proof: any) => Promise<void>;
  handleVerificationError: (error: any) => void;
  resetState: () => void;
}

export const useSelfProtocol = (
  onSuccess: (result: any) => void,
  onError: (error: any) => void
): SelfProtocolState & SelfProtocolActions => {
  const [selfApp, setSelfApp] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setSelfApp(null);
    setIsInitialized(false);
    setIsProcessing(false);
    setError(null);
    setSessionId(null);
  }, []);

  const initializeSelfApp = useCallback(async () => {
    try {
      setError(null);
      setIsInitialized(false);
      
      // Get endpoint from environment
      const endpoint = process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'https://demoself.loca.lt/api/verify';
      
      // Validate endpoint before proceeding
      const endpointValidation = validateEndpoint(endpoint);
      if (!endpointValidation.isValid) {
        throw new Error(endpointValidation.error);
      }
      
      // Generate session ID for tracking
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      
      // Create app logo
      const logoBase64 = createAppLogo();

      // Generate user ID
      const userId = generateUserId();
      
      // Prepare configuration
      const config = {
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Aadhaar KYC Verification',
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'aadhaar-verification',
        endpoint: endpoint,
        logoBase64: logoBase64,
        userId: userId,
        endpointType: 'staging_https' as const,
        userIdType: 'uuid' as const,
        userDefinedData: 'Aadhaar KYC Verification',
        disclosures: {
          minimumAge: 18,
          nationality: true,
          gender: true,
          name: true,
          date_of_birth: true,
        },
      };
      
      // Validate complete configuration
      const configValidation = validateSelfConfig(config);
      if (!configValidation.isValid) {
        throw new Error(configValidation.error);
      }
      
      // Initialize Self App Builder following official patterns
      const app = new SelfAppBuilder(config).build();

      setSelfApp(app);
      setIsInitialized(true);
      
      logVerificationEvent('INITIALIZATION_SUCCESS', { sessionId: newSessionId });
      
    } catch (err) {
      console.error('❌ Self Protocol initialization failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Self SDK';
      
      // Handle specific error types following official patterns
      if (errorMessage.includes('localhost') || errorMessage.includes('private IP')) {
        const instructions = getNgrokSetupInstructions();
        setError(`Self Protocol requires a publicly accessible HTTPS endpoint.\n\nSetup Instructions:\n${instructions.join('\n')}`);
      } else if (errorMessage.includes('HTTPS protocol')) {
        setError('Self Protocol requires HTTPS protocol. Please ensure your endpoint uses https://');
      } else if (errorMessage.includes('Tunnel Unavailable') || errorMessage.includes('503')) {
        setError('Tunnel connection failed. Please ensure your endpoint is accessible and stable.');
      } else {
        setError(errorMessage);
      }
      
      onError({ message: errorMessage });
    }
  }, [onError]);

  const handleVerificationSuccess = useCallback(async (proof: any) => {
    setIsProcessing(true);
    
    try {
      logVerificationEvent('VERIFICATION_START', { sessionId, proof: sanitizeForLogging(proof) });
      
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attestationId: DocumentType.AADHAAR, // Aadhaar document type
          proof: proof.proof || proof,
          publicSignals: proof.publicSignals || [],
          userContextData: proof.userContextData || '0x0',
          sessionId: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      logVerificationEvent('VERIFICATION_RESPONSE', { sessionId, result: sanitizeForLogging(result) });

      if (result.status === 'success') {
        logVerificationEvent('VERIFICATION_SUCCESS', { sessionId });
        onSuccess(result);
      } else {
        throw new Error(result.reason || 'Verification failed');
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify proof';
      onError({ message: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, onSuccess, onError]);

  const handleVerificationError = useCallback((error: any) => {
    console.error('❌ Self Protocol verification error:', error);
    onError({ message: error.message || 'Verification failed' });
  }, [onError]);

  return {
    // State
    selfApp,
    isInitialized,
    isProcessing,
    error,
    sessionId,
    // Actions
    initializeSelfApp,
    handleVerificationSuccess,
    handleVerificationError,
    resetState,
  };
};
