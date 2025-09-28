#!/usr/bin/env python3
"""
Aadhaar QR Code Decoder using pyaadhaar library
Based on https://github.com/tanmoysrt/pyaadhaar
"""

import sys
import json
from pyaadhaar.decode import AadhaarSecureQr, AadhaarOldQr
from pyaadhaar.utils import isSecureQr, AadhaarQrAuto

def decode_qr(qr_data):
    """
    Decode Aadhaar QR code data using pyaadhaar library
    """
    try:
        # Use AadhaarQrAuto to automatically detect and decode
        obj = AadhaarQrAuto(qr_data)
        decoded_data = obj.decodeddata()
        
        # Convert to JSON-serializable format
        result = {
            "status": "success",
            "data": decoded_data,
            "qr_type": "secure" if isSecureQr(qr_data) else "old"
        }
        
        return result
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "qr_data_length": len(qr_data),
            "qr_data_preview": qr_data[:100] + "..." if len(qr_data) > 100 else qr_data
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({
            "status": "error",
            "error": "Usage: python aadhaar_decoder.py <qr_data>"
        }))
        sys.exit(1)
    
    qr_data = sys.argv[1]
    result = decode_qr(qr_data)
    print(json.dumps(result))

