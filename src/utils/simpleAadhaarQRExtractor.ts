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
}

export class SimpleAadhaarQRExtractor {
  /**
   * Extract Aadhaar data from QR code
   * For now, this will return an error asking user to provide QR code data manually
   * In a production app, you would integrate with a proper QR scanning service
   */
  static async extractFromFile(file: File): Promise<AadhaarQRData> {
    try {
      console.log('🔍 Processing Aadhaar document:', file.name);
      
      // For demonstration purposes, we'll ask the user to manually enter their data
      // In a real implementation, you would:
      // 1. Use a cloud-based QR scanning service (like Google Vision API, AWS Textract, etc.)
      // 2. Or use a client-side QR scanner that works in the browser
      // 3. Or integrate with a specialized Aadhaar QR scanning service
      
      throw new Error(
        'QR code extraction from uploaded files requires additional setup. ' +
        'Please use the manual data entry option or integrate with a cloud-based QR scanning service. ' +
        'For testing, you can manually enter your Aadhaar data.'
      );
    } catch (error) {
      console.error('❌ Aadhaar QR extraction failed:', error);
      throw new Error(`Failed to extract Aadhaar data from QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create Aadhaar data from manually entered information
   */
  static createFromManualData(data: {
    name: string;
    dateOfBirth: string;
    gender: string;
    aadhaarNumber: string;
    address: string;
    state: string;
    district: string;
    pincode: string;
    country?: string;
  }): AadhaarQRData {
    // Calculate age
    const dob = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const yob = dob.getFullYear();
    
    // Build full address
    const addressParts = [data.address, data.district, data.state, data.pincode, data.country || 'India']
      .filter(part => part && part.trim())
      .map(part => part.trim());
    const fullAddress = addressParts.join(', ');
    
    return {
      name: data.name.trim(),
      dateOfBirth: data.dateOfBirth.trim(),
      gender: data.gender.trim(),
      aadhaarNumber: data.aadhaarNumber.trim(),
      address: data.address.trim(),
      state: data.state.trim(),
      pincode: data.pincode.trim(),
      district: data.district.trim(),
      subdistrict: '',
      village: '',
      postOffice: '',
      landmark: '',
      house: '',
      street: '',
      country: data.country || 'India',
      age: age,
      yob: yob,
      fullAddress: fullAddress
    };
  }
}

