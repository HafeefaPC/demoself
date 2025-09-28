import { useState, useEffect, useCallback } from 'react';
import { SelfAppBuilder } from '@selfxyz/qrcode';
import { ethers } from 'ethers';
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
  onError: (error: any) => void,
  extractedAadhaarData?: any,
  sessionId?: string | null
): SelfProtocolState & SelfProtocolActions => {
  const [selfApp, setSelfApp] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);

  const resetState = useCallback(() => {
    setSelfApp(null);
    setIsInitialized(false);
    setIsProcessing(false);
    setError(null);
    setCurrentSessionId(null);
  }, []);

  const initializeSelfApp = useCallback(async () => {
    try {
      setError(null);
      setIsInitialized(false);
      
      // Get endpoint from environment - use real verification endpoint
      const endpoint = process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'https://demoself-jet.vercel.app/api/verify';
      
      // Validate endpoint before proceeding
      const endpointValidation = validateEndpoint(endpoint);
      if (!endpointValidation.isValid) {
        throw new Error(endpointValidation.error);
      }
      
              // Use provided session ID or generate new one
              const newSessionId = currentSessionId || generateSessionId();
              setCurrentSessionId(newSessionId);
      
      // Add timestamp to prevent caching issues
      const timestamp = Date.now();
      
      // Create app logo
      const logoBase64 = createAppLogo();

      // Generate user ID - use ethers wallet for proper address generation
      const wallet = ethers.Wallet.createRandom();
      const userId = wallet.address;
      
      // Prepare configuration for Aadhaar offchain verification
      const config = {
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Aadhaar KYC Verification',
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'aadhaar-verification',
        endpoint: endpoint,
        logoBase64: logoBase64,
        userId: userId,
        endpointType: 'staging_https' as const, // Use staging_https for offchain verification
        userIdType: 'hex' as const,
                userDefinedData: extractedAadhaarData ? JSON.stringify({
                  name: extractedAadhaarData.name,
                  dob: extractedAadhaarData.dateOfBirth,
                  gender: extractedAadhaarData.gender,
                  aadhaarNumber: extractedAadhaarData.aadhaarNumber,
                  address: extractedAadhaarData.address,
                  state: extractedAadhaarData.state,
                  pincode: extractedAadhaarData.pincode,
                  sessionId: newSessionId
                }) : `Aadhaar KYC Verification - ${timestamp}`,
        disclosures: {
          // Aadhaar-specific disclosures
          minimumAge: 18,
          nationality: true,
          gender: true,
          name: true,
          date_of_birth: true,
          // Aadhaar-specific attributes
          aadhaar_verified: true,
          kyc_completed: true,
        },
        // Document type for Aadhaar (3 = Aadhaar)
        documentType: 3,
        // Offchain verification (no blockchain required)
        chainId: undefined, // Remove chainId for pure offchain
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
          }, [onError, currentSessionId, extractedAadhaarData]);

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
                  proof: proof, // Pass the entire proof object as received from Self Protocol
                  publicSignals: proof.publicSignals || [],
                  userContextData: proof.userContextData || '0x0',
                  sessionId: currentSessionId,
                  extractedAadhaarData: extractedAadhaarData // Include extracted data for verification
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
  }, [currentSessionId, onSuccess, onError, extractedAadhaarData]);

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
            sessionId: currentSessionId,
    // Actions
    initializeSelfApp,
    handleVerificationSuccess,
    handleVerificationError,
    resetState,
  };
};
