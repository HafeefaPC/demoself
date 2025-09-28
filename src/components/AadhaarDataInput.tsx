'use client';

import { useState } from 'react';

interface AadhaarDataInputProps {
  onDataSubmit: (data: any) => void;
}

export default function AadhaarDataInput({ onDataSubmit }: AadhaarDataInputProps) {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'M',
    aadhaarNumber: '',
    address: '',
    state: '',
    district: '',
    pincode: '',
    country: 'India'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate age
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const yob = dob.getFullYear();
    
    const aadhaarData = {
      ...formData,
      age: age,
      yob: yob,
      fullAddress: formData.address,
      subdistrict: formData.district,
      village: formData.district,
      postOffice: formData.district + ' GPO',
      landmark: 'Near Main Road',
      house: '123',
      street: 'Main Street'
    };
    
    onDataSubmit(aadhaarData);
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-6">
      <h3 className="font-semibold text-blue-800 mb-3">📝 Enter Your Real Aadhaar Data</h3>
      <p className="text-sm text-blue-700 mb-4">
        Since QR extraction is complex, you can enter your real Aadhaar data here for testing:
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
          <input
            type="text"
            value={formData.aadhaarNumber}
            onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter 12-digit Aadhaar number"
            maxLength={12}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter your full address"
            rows={2}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="State"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => setFormData({...formData, district: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="District"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
          <input
            type="text"
            value={formData.pincode}
            onChange={(e) => setFormData({...formData, pincode: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Pincode"
            maxLength={6}
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Use This Real Data for Verification
        </button>
      </form>
    </div>
  );
}

