import { Jimp } from 'jimp';
import jsQR from 'jsqr';
import { QR } from '@xone-labs/aadharjs';

export interface AadhaarQRData {
  name: string;
  dateOfBirth: string;
  gender: string;
  aadhaarNumber: string;
  address: string;
  state: string;
  pincode: string;
  district: string;
  subdistrict: string;
  village: string;
  postOffice: string;
  landmark: string;
  house: string;
  street: string;
  country: string;
  age: number;
  yob: number;
  fullAddress: string;
  // Additional fields from pyaadhaar
  careof?: string;
  location?: string;
  referenceId?: string;
  emailMobileStatus?: string;
  adhaarLast4Digit?: string;
  adhaarLastDigit?: string;
  email?: string;
  mobile?: string;
}

export class RealAadhaarQRExtractor {
  /**
   * Extract real Aadhaar data from QR code in uploaded image
   * Based on pyaadhaar library approach
   */
  static async extractFromFile(file: File): Promise<AadhaarQRData> {
    try {
      console.log('🔍 Starting REAL Aadhaar QR extraction from file:', file.name);
      
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Extract QR code data from the uploaded file
      const qrData = await this.scanQRCodeFromBuffer(buffer, file.type);
      
      if (!qrData) {
        throw new Error('No QR code found in the uploaded image. Please ensure your Aadhaar document contains a visible QR code.');
      }
      
      console.log('📱 QR code data extracted, length:', qrData.length);
      console.log('📱 QR code content preview:', qrData.substring(0, 100) + '...');
      
      // Parse Aadhaar data from QR code (both old and new secure QR codes)
      const aadhaarData = await this.parseAadhaarQRData(qrData);
      
      console.log('✅ REAL Aadhaar data extracted successfully:', {
        name: aadhaarData.name,
        aadhaarNumber: aadhaarData.aadhaarNumber,
        address: aadhaarData.address
      });
      
      return aadhaarData;
    } catch (error) {
      console.error('❌ Aadhaar QR extraction failed:', error);
      throw new Error(`Failed to extract Aadhaar data from QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Scan QR code from buffer using jsQR
   */
  private static async scanQRCodeFromBuffer(buffer: Buffer, mimeType: string): Promise<string | null> {
    try {
      // Handle different file types
      if (mimeType === 'application/pdf') {
        throw new Error('PDF files are not supported for QR extraction. Please upload a JPG or PNG image of your Aadhaar QR code.');
      }
      
      if (!mimeType.startsWith('image/')) {
        throw new Error('Only image files (JPG, PNG) are supported for QR extraction.');
      }
      
      // Load image with Jimp
      const image = await Jimp.read(buffer);
      
      // Convert to grayscale and resize if needed for better QR detection
      image.greyscale();
      
      // Resize if image is too large (QR codes work better at reasonable sizes)
      if (image.width > 1000 || image.height > 1000) {
        image.resize({ w: 1000, h: 1000 });
      }
      
      // Get image data for jsQR
      const width = image.width;
      const height = image.height;
      const imageData = {
        data: new Uint8ClampedArray(image.bitmap.data),
        width: width,
        height: height
      };
      
      // Scan for QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        console.log('✅ QR code detected:', code.data.substring(0, 50) + '...');
        return code.data;
      } else {
        console.log('❌ No QR code found in image');
        return null;
      }
    } catch (error) {
      console.error('❌ QR scanning failed:', error);
      return null;
    }
  }

  /**
   * Parse Aadhaar data from QR code (supports both old and new secure QR codes)
   * Based on pyaadhaar library approach
   */
  private static async parseAadhaarQRData(qrData: string): Promise<AadhaarQRData> {
    try {
      console.log('🔍 Parsing Aadhaar QR data...');
      console.log('📱 QR Data Type:', typeof qrData);
      console.log('📱 QR Data Length:', qrData.length);
      console.log('📱 QR Data Preview:', qrData.substring(0, 200) + '...');
      
      // Check QR code type
      const isSecureQR = this.isSecureQR(qrData);
      const isEncryptedQR = this.isEncryptedQR(qrData);
      
      console.log('📱 QR Code Type:', isSecureQR ? 'Secure QR Code' : isEncryptedQR ? 'Encrypted QR Code' : 'Old QR Code');
      
      if (isSecureQR) {
        return this.parseSecureQRCode(qrData);
      } else if (isEncryptedQR) {
        return await this.parseEncryptedQRCode(qrData);
      } else {
        return this.parseOldQRCode(qrData);
      }
    } catch (error) {
      console.error('❌ Failed to parse Aadhaar QR data:', error);
      console.log('📱 Full QR Data for debugging:', qrData);
      throw new Error(`Failed to parse Aadhaar data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if QR code is secure (new) or old format
   */
  private static isSecureQR(qrData: string): boolean {
    // Secure QR codes typically contain specific patterns
    // Based on pyaadhaar library logic
    return qrData.includes('<?xml') || qrData.includes('<PrintLetterBarcodeData') || qrData.includes('referenceid');
  }

  /**
   * Check if QR code is encrypted/encoded (numeric format)
   */
  private static isEncryptedQR(qrData: string): boolean {
    // Check if QR data is mostly numeric (encrypted format)
    const numericCount = (qrData.match(/\d/g) || []).length;
    const totalLength = qrData.length;
    return numericCount / totalLength > 0.8; // 80% numeric
  }

  /**
   * Parse new secure Aadhaar QR code
   * Based on pyaadhaar AadhaarSecureQr class
   */
  private static parseSecureQRCode(qrData: string): AadhaarQRData {
    try {
      console.log('🔍 Parsing Secure Aadhaar QR Code...');
      
      // Extract data using regex patterns for secure QR code
      const nameMatch = qrData.match(/<name>([^<]+)<\/name>/i);
      const dobMatch = qrData.match(/<dob>([^<]+)<\/dob>/i);
      const genderMatch = qrData.match(/<gender>([^<]+)<\/gender>/i);
      const referenceIdMatch = qrData.match(/<referenceid>([^<]+)<\/referenceid>/i);
      const careofMatch = qrData.match(/<careof>([^<]+)<\/careof>/i);
      const districtMatch = qrData.match(/<district>([^<]+)<\/district>/i);
      const landmarkMatch = qrData.match(/<landmark>([^<]+)<\/landmark>/i);
      const houseMatch = qrData.match(/<house>([^<]+)<\/house>/i);
      const locationMatch = qrData.match(/<location>([^<]+)<\/location>/i);
      const pincodeMatch = qrData.match(/<pincode>([^<]+)<\/pincode>/i);
      const postofficeMatch = qrData.match(/<postoffice>([^<]+)<\/postoffice>/i);
      const stateMatch = qrData.match(/<state>([^<]+)<\/state>/i);
      const streetMatch = qrData.match(/<street>([^<]+)<\/street>/i);
      const subdistrictMatch = qrData.match(/<subdistrict>([^<]+)<\/subdistrict>/i);
      const vtcMatch = qrData.match(/<vtc>([^<]+)<\/vtc>/i);
      const adhaarLast4DigitMatch = qrData.match(/<adhaar_last_4_digit>([^<]+)<\/adhaar_last_4_digit>/i);
      const adhaarLastDigitMatch = qrData.match(/<adhaar_last_digit>([^<]+)<\/adhaar_last_digit>/i);
      const emailMatch = qrData.match(/<email>([^<]+)<\/email>/i);
      const mobileMatch = qrData.match(/<mobile>([^<]+)<\/mobile>/i);
      const emailMobileStatusMatch = qrData.match(/<email_mobile_status>([^<]+)<\/email_mobile_status>/i);
      
      // Extract values
      const name = nameMatch?.[1]?.trim() || '';
      const dateOfBirth = dobMatch?.[1]?.trim() || '';
      const gender = genderMatch?.[1]?.trim() || '';
      const referenceId = referenceIdMatch?.[1]?.trim() || '';
      const careof = careofMatch?.[1]?.trim() || '';
      const district = districtMatch?.[1]?.trim() || '';
      const landmark = landmarkMatch?.[1]?.trim() || '';
      const house = houseMatch?.[1]?.trim() || '';
      const location = locationMatch?.[1]?.trim() || '';
      const pincode = pincodeMatch?.[1]?.trim() || '';
      const postOffice = postofficeMatch?.[1]?.trim() || '';
      const state = stateMatch?.[1]?.trim() || '';
      const street = streetMatch?.[1]?.trim() || '';
      const subdistrict = subdistrictMatch?.[1]?.trim() || '';
      const village = vtcMatch?.[1]?.trim() || '';
      const adhaarLast4Digit = adhaarLast4DigitMatch?.[1]?.trim() || '';
      const adhaarLastDigit = adhaarLastDigitMatch?.[1]?.trim() || '';
      const email = emailMatch?.[1]?.trim() || '';
      const mobile = mobileMatch?.[1]?.trim() || '';
      const emailMobileStatus = emailMobileStatusMatch?.[1]?.trim() || '';
      
      // Build full address
      const addressParts = [house, street, landmark, village, subdistrict, district, state, pincode, 'India']
        .filter(part => part && part.trim())
        .map(part => part.trim());
      const address = addressParts.join(', ');
      
      // Calculate age
      const dob = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const yob = dob.getFullYear();
      
      // Validate required fields
      if (!name || !dateOfBirth) {
        throw new Error(`Invalid Aadhaar data: Missing required fields. Found: name=${!!name}, dob=${!!dateOfBirth}`);
      }
      
      const result: AadhaarQRData = {
        name: name,
        dateOfBirth: dateOfBirth,
        gender: gender,
        aadhaarNumber: adhaarLast4Digit ? `****${adhaarLast4Digit}` : '',
        address: address,
        state: state,
        pincode: pincode,
        district: district,
        subdistrict: subdistrict,
        village: village,
        postOffice: postOffice,
        landmark: landmark,
        house: house,
        street: street,
        country: 'India',
        age: age,
        yob: yob,
        fullAddress: address,
        // Additional secure QR fields
        careof: careof,
        location: location,
        referenceId: referenceId,
        emailMobileStatus: emailMobileStatus,
        adhaarLast4Digit: adhaarLast4Digit,
        adhaarLastDigit: adhaarLastDigit,
        email: email,
        mobile: mobile
      };
      
      console.log('✅ Parsed Secure Aadhaar data:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to parse secure QR code:', error);
      throw error;
    }
  }

  /**
   * Parse compressed/encoded Aadhaar QR code using @xone-labs/aadharjs
   */
  private static async parseEncryptedQRCode(qrData: string): Promise<AadhaarQRData> {
    try {
      console.log('🔍 Parsing Compressed Aadhaar QR Code using @xone-labs/aadharjs...');
      console.log('📱 Compressed QR Data:', qrData.substring(0, 100) + '...');
      
      // Check if this looks like a valid Aadhaar QR code
      if (qrData.length < 100) {
        throw new Error('Invalid Aadhaar QR code: Too short');
      }
      
      // Use the proper Aadhaar QR decoder library
      try {
        const decodedAadhaar = QR.decode(qrData);
        console.log('✅ Successfully decoded Aadhaar QR code:', decodedAadhaar);
        
        // Map the decoded data to our interface
        const aadhaarData: AadhaarQRData = {
          name: decodedAadhaar.name || '',
          dateOfBirth: decodedAadhaar.dob || '',
          gender: decodedAadhaar.gender || '',
          aadhaarNumber: decodedAadhaar.uid || '',
          address: this.buildAddress(decodedAadhaar),
          state: decodedAadhaar.state || '',
          pincode: decodedAadhaar.pc || '',
          district: decodedAadhaar.dist || '',
          subdistrict: decodedAadhaar.subdist || '',
          village: decodedAadhaar.vtc || '',
          postOffice: decodedAadhaar.po || '',
          landmark: decodedAadhaar.lm || '',
          house: decodedAadhaar.house || '',
          street: decodedAadhaar.street || '',
          country: 'India',
          age: this.calculateAge(decodedAadhaar.dob),
          yob: parseInt(decodedAadhaar.yob) || new Date(decodedAadhaar.dob).getFullYear() || 0,
          fullAddress: this.buildAddress(decodedAadhaar),
          // Additional fields
          careof: decodedAadhaar.gname || '',
          location: decodedAadhaar.loc || '',
          referenceId: decodedAadhaar.referenceid || '',
          emailMobileStatus: decodedAadhaar.email_mobile_status || '',
          adhaarLast4Digit: decodedAadhaar.adhaar_last_4_digit || '',
          adhaarLastDigit: decodedAadhaar.adhaar_last_digit || '',
          email: decodedAadhaar.email || '',
          mobile: decodedAadhaar.mobile || ''
        };
        
        console.log('✅ Successfully mapped decoded Aadhaar data:', aadhaarData);
        return aadhaarData;
        
      } catch (decodeError) {
        console.error('❌ @xone-labs/aadharjs decoding failed:', decodeError);
        throw new Error(
          'Failed to decode Aadhaar QR code using the specialized library. ' +
          'Please use the "Enter Your Real Aadhaar Data" option to input your information manually.'
        );
      }
      
    } catch (error) {
      console.error('❌ Failed to parse compressed QR code:', error);
      throw error; // Re-throw the error to maintain the message
    }
  }


  /**
   * Build address from decoded data
   */
  private static buildAddress(data: any): string {
    const parts = [
      data.house,
      data.street,
      data.lm || data.landmark,
      data.vtc || data.location,
      data.subdist || data.subdistrict,
      data.dist || data.district,
      data.state,
      data.pc || data.pincode,
      'India'
    ].filter(part => part && part.trim());
    
    return parts.join(', ');
  }

  /**
   * Calculate age from date of birth or year of birth
   */
  private static calculateAge(dobOrYob: string | number): number {
    if (!dobOrYob) return 0;
    
    if (typeof dobOrYob === 'number') {
      return new Date().getFullYear() - dobOrYob;
    }
    
    const dob = new Date(dobOrYob);
    const today = new Date();
    return today.getFullYear() - dob.getFullYear();
  }

  /**
   * Parse old Aadhaar QR code
   * Based on pyaadhaar AadhaarOldQr class
   */
  private static parseOldQRCode(qrData: string): AadhaarQRData {
    try {
      console.log('🔍 Parsing Old Aadhaar QR Code...');
      console.log('📱 QR Data for parsing:', qrData.substring(0, 500) + '...');
      
      // Try different parsing approaches for old QR codes
      let uidMatch, nameMatch, genderMatch, yobMatch, gnameMatch, streetMatch, lmMatch, locMatch, vtcMatch, poMatch, distMatch, subdistMatch, stateMatch, pcMatch, dobMatch;
      
      // First try XML format
      uidMatch = qrData.match(/<uid>([^<]+)<\/uid>/i);
      nameMatch = qrData.match(/<name>([^<]+)<\/name>/i);
      genderMatch = qrData.match(/<gender>([^<]+)<\/gender>/i);
      yobMatch = qrData.match(/<yob>([^<]+)<\/yob>/i);
      gnameMatch = qrData.match(/<gname>([^<]+)<\/gname>/i);
      streetMatch = qrData.match(/<street>([^<]+)<\/street>/i);
      lmMatch = qrData.match(/<lm>([^<]+)<\/lm>/i);
      locMatch = qrData.match(/<loc>([^<]+)<\/loc>/i);
      vtcMatch = qrData.match(/<vtc>([^<]+)<\/vtc>/i);
      poMatch = qrData.match(/<po>([^<]+)<\/po>/i);
      distMatch = qrData.match(/<dist>([^<]+)<\/dist>/i);
      subdistMatch = qrData.match(/<subdist>([^<]+)<\/subdist>/i);
      stateMatch = qrData.match(/<state>([^<]+)<\/state>/i);
      pcMatch = qrData.match(/<pc>([^<]+)<\/pc>/i);
      dobMatch = qrData.match(/<dob>([^<]+)<\/dob>/i);
      
      // If no XML format found, try other formats
      if (!uidMatch && !nameMatch) {
        console.log('📱 No XML format found, trying other formats...');
        
        // Try comma-separated format
        const parts = qrData.split(',');
        if (parts.length > 5) {
          console.log('📱 Trying comma-separated format...');
          // This is a simplified approach - real parsing would need more sophisticated logic
        }
        
        // Try space-separated format
        const spaceParts = qrData.split(' ');
        if (spaceParts.length > 5) {
          console.log('📱 Trying space-separated format...');
          // This is a simplified approach - real parsing would need more sophisticated logic
        }
      }
      
      // Extract values
      const aadhaarNumber = uidMatch?.[1]?.trim() || '';
      const name = nameMatch?.[1]?.trim() || '';
      const gender = genderMatch?.[1]?.trim() || '';
      const yob = parseInt(yobMatch?.[1]?.trim() || '0');
      const gname = gnameMatch?.[1]?.trim() || '';
      const street = streetMatch?.[1]?.trim() || '';
      const landmark = lmMatch?.[1]?.trim() || '';
      const location = locMatch?.[1]?.trim() || '';
      const village = vtcMatch?.[1]?.trim() || '';
      const postOffice = poMatch?.[1]?.trim() || '';
      const district = distMatch?.[1]?.trim() || '';
      const subdistrict = subdistMatch?.[1]?.trim() || '';
      const state = stateMatch?.[1]?.trim() || '';
      const pincode = pcMatch?.[1]?.trim() || '';
      const dateOfBirth = dobMatch?.[1]?.trim() || '';
      
      // Build full address
      const addressParts = [street, landmark, village, subdistrict, district, state, pincode, 'India']
        .filter(part => part && part.trim())
        .map(part => part.trim());
      const address = addressParts.join(', ');
      
      // Calculate age
      const today = new Date();
      const age = yob ? today.getFullYear() - yob : 0;
      
      // Validate required fields
      if (!name || !aadhaarNumber) {
        throw new Error(`Invalid Aadhaar data: Missing required fields. Found: name=${!!name}, uid=${!!aadhaarNumber}`);
      }
      
      const result: AadhaarQRData = {
        name: name,
        dateOfBirth: dateOfBirth,
        gender: gender,
        aadhaarNumber: aadhaarNumber,
        address: address,
        state: state,
        pincode: pincode,
        district: district,
        subdistrict: subdistrict,
        village: village,
        postOffice: postOffice,
        landmark: landmark,
        house: '',
        street: street,
        country: 'India',
        age: age,
        yob: yob,
        fullAddress: address,
        // Additional old QR fields
        careof: gname,
        location: location
      };
      
      console.log('✅ Parsed Old Aadhaar data:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to parse old QR code:', error);
      throw error;
    }
  }
}
