// Self Protocol Type Definitions
// Following official Self App development patterns

export interface SelfProtocolConfig {
  version: number;
  appName: string;
  scope: string;
  endpoint: string;
  logoBase64: string;
  userId: string;
  endpointType: 'staging_https' | 'staging_celo' | 'celo';
  userIdType: 'uuid' | 'hex';
  userDefinedData: string;
  disclosures: SelfDisclosures;
}

export interface SelfDisclosures {
  minimumAge?: number;
  nationality?: boolean;
  gender?: boolean;
  name?: boolean;
  date_of_birth?: boolean;
  excludedCountries?: string[];
  ofac?: boolean;
}

export interface SelfVerificationResult {
  status: 'success' | 'error';
  result: boolean;
  credentialSubject?: AadhaarDetails;
  documentType?: string;
  timestamp: string;
  attestationId: number;
  sessionId?: string;
  reason?: string;
  error_code?: string;
}

export interface AadhaarDetails {
  firstName?: string;
  lastName?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: string;
  minimumAge?: boolean;
  aadhaarVerified?: boolean;
  kycCompleted?: boolean;
}

export interface SelfProof {
  proof: any;
  publicSignals: any[];
  userContextData: string;
  credentialSubject?: AadhaarDetails;
}

export interface SelfProtocolState {
  selfApp: any | null;
  isInitialized: boolean;
  isProcessing: boolean;
  error: string | null;
  sessionId: string | null;
}

export interface SelfProtocolActions {
  initializeSelfApp: () => Promise<void>;
  handleVerificationSuccess: (proof: any) => Promise<void>;
  handleVerificationError: (error: any) => void;
  resetState: () => void;
}

// Document types following Self Protocol specification
export enum DocumentType {
  PASSPORT = 1,
  EU_ID_CARD = 2,
  AADHAAR = 3,
}

// Error types following official patterns
export enum SelfProtocolError {
  TUNNEL_CONNECTION_FAILED = 'TUNNEL_CONNECTION_FAILED',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  INVALID_JSON = 'INVALID_JSON',
  MISSING_FIELDS = 'MISSING_FIELDS',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
