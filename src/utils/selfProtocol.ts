// Self Protocol Utility Functions
// Following official Self App development patterns

import { DocumentType, SelfProtocolError } from '@/types/selfProtocol';

/**
 * Validates that endpoint is publicly accessible (not localhost)
 */
export const validateEndpoint = (endpoint: string): { isValid: boolean; error?: string } => {
  if (!endpoint) {
    return { isValid: false, error: 'Endpoint is required' };
  }

  try {
    const url = new URL(endpoint);
    
    // Allow local network IPs for development (192.168.x.x)
    if (url.hostname === 'localhost' || 
        url.hostname === '127.0.0.1' || 
        url.hostname === '0.0.0.0') {
      return { 
        isValid: false, 
        error: 'Endpoint must be publicly accessible. localhost is not allowed.' 
      };
    }

    // For local network IPs (192.168.x.x), allow HTTP for development
    if (url.hostname.startsWith('192.168.')) {
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return { 
          isValid: false, 
          error: 'Local network endpoint must use HTTP or HTTPS protocol.' 
        };
      }
      return { isValid: true };
    }

    // For other private IPs and public endpoints, require HTTPS
    if (url.hostname.startsWith('10.') || url.hostname.startsWith('172.')) {
      return { 
        isValid: false, 
        error: 'Endpoint must be publicly accessible or use 192.168.x.x for local development.' 
      };
    }

    // Check if it's HTTPS for public endpoints
    if (url.protocol !== 'https:') {
      return { 
        isValid: false, 
        error: 'Public endpoint must use HTTPS protocol.' 
      };
    }

    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid endpoint URL format.' 
    };
  }
};

/**
 * Validates Self Protocol configuration
 */
export const validateSelfConfig = (config: any): { isValid: boolean; error?: string } => {
  const requiredFields = [
    'version',
    'appName', 
    'scope',
    'endpoint',
    'userId',
    'endpointType',
    'userIdType'
  ];
  
  // Check required fields
  const missingFields = requiredFields.filter(field => config[field] === undefined);
  if (missingFields.length > 0) {
    return { 
      isValid: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    };
  }

  // Validate endpoint
  const endpointValidation = validateEndpoint(config.endpoint);
  if (!endpointValidation.isValid) {
    return endpointValidation;
  }

  return { isValid: true };
};

/**
 * Generates a secure session ID for tracking verification sessions
 */
export const generateSessionId = (): string => {
  return crypto.randomUUID();
};

/**
 * Generates a secure user ID for Self Protocol
 * Returns a hex address for userIdType: 'hex' or UUID for userIdType: 'uuid'
 */
export const generateUserId = (userIdType: 'hex' | 'uuid' = 'hex'): string => {
  if (userIdType === 'hex') {
    // Generate a random hex address (40 characters starting with 0x)
    const randomBytes = new Uint8Array(20);
    crypto.getRandomValues(randomBytes);
    const hex = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return '0x' + hex;
  } else {
    return crypto.randomUUID();
  }
};

/**
 * Creates a base64 encoded logo for Self Protocol
 */
export const createAppLogo = (): string => {
  const logoSvg = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#000000"/>
      <path d="M12 12H28V28H12V12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  
  return 'data:image/svg+xml;base64,' + btoa(logoSvg);
};

/**
 * Validates proof data structure
 */
export const validateProofData = (proof: any): boolean => {
  if (!proof) return false;
  
  // Check if it's mock data (has credentialSubject but no real proof)
  if (proof.credentialSubject && !proof.proof && !proof.publicSignals) {
    return false;
  }
  
  return true;
};

/**
 * Formats error messages following official patterns
 */
export const formatSelfError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'Unknown error occurred';
};

/**
 * Checks if error is related to tunnel/connection issues
 */
export const isTunnelError = (error: any): boolean => {
  const errorMessage = formatSelfError(error);
  return errorMessage.includes('Tunnel Unavailable') || 
         errorMessage.includes('503') ||
         errorMessage.includes('connection refused') ||
         errorMessage.includes('localhost endpoints are not allowed');
};

/**
 * Gets document type name from attestation ID
 */
export const getDocumentTypeName = (attestationId: number): string => {
  switch (attestationId) {
    case DocumentType.PASSPORT:
      return 'Passport';
    case DocumentType.EU_ID_CARD:
      return 'EU ID Card';
    case DocumentType.AADHAAR:
      return 'Aadhaar';
    default:
      return 'Unknown Document';
  }
};

/**
 * Logs verification events following official patterns
 */
export const logVerificationEvent = (event: string, data: any, sessionId?: string) => {
  const logData = {
    event,
    sessionId,
    timestamp: new Date().toISOString(),
    ...data
  };
  
  console.log(`[Self Protocol] ${event}:`, logData);
};

/**
 * Sanitizes sensitive data for logging
 */
export const sanitizeForLogging = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  const sensitiveFields = ['proof', 'publicSignals', 'userContextData'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

/**
 * Provides ngrok setup instructions for local development
 */
export const getNgrokSetupInstructions = (): string[] => {
  return [
    '1. Install ngrok: npm install -g ngrok',
    '2. Run ngrok: ngrok http 3000',
    '3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)',
    '4. Update .env.local: NEXT_PUBLIC_SELF_ENDPOINT=https://abc123.ngrok.io/api/verify',
    '5. Restart the development server: npm run dev'
  ];
};

/**
 * Checks if current endpoint is a development tunnel
 */
export const isDevelopmentTunnel = (endpoint: string): boolean => {
  if (!endpoint) return false;
  
  try {
    const url = new URL(endpoint);
    return url.hostname.includes('ngrok.io') || 
           url.hostname.includes('localtunnel.me') ||
           url.hostname.includes('loca.lt');
  } catch {
    return false;
  }
};
