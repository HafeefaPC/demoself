import { BrowserMultiFormatReader } from '@zxing/library';

export interface QRScanResult {
  text: string;
  format: string;
}

export class RealQRScanner {
  private reader: BrowserMultiFormatReader;

  constructor() {
    this.reader = new BrowserMultiFormatReader();
  }

  /**
   * Scan QR code from an image file
   */
  async scanFromFile(file: File): Promise<QRScanResult | null> {
    try {
      console.log('🔍 Starting real QR code scan from file:', file.name);
      
      // Convert file to image element
      const imageElement = await this.fileToImageElement(file);
      
      // Scan QR code using ZXing
      const result = await this.reader.decodeFromImageElement(imageElement);
      
      if (result) {
        console.log('✅ QR code found:', result.getText());
        return {
          text: result.getText(),
          format: result.getBarcodeFormat().toString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ QR code scan failed:', error);
      return null;
    }
  }

  /**
   * Convert file to image element
   */
  private async fileToImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.reader.reset();
  }
}

