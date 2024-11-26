import React, { useState } from 'react';
import Layout from '../Layout/Layout';
import { Button } from "../Button/Button";
import { Card, CardHeader, CardTitle, CardContent } from '../Card/Card';

const EmpanelHospital = () => {
  const [formData, setFormData] = useState({
    hospitalName: '',
    hospitalRohiniId: '',
    hospitalAddress: '',
    pinCode: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:4000/empanelhospital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit data. Please try again.');
      }

      const result = await response.json();
      setSuccessMessage(result.message || 'Hospital data submitted successfully!');
      setFormData({
        hospitalName: '',
        hospitalRohiniId: '',
        hospitalAddress: '',
        pinCode: '',
        contactPersonName: '',
        contactPersonEmail: '',
        contactPersonPhone: '',
      });
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <Layout userType="admin">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-red-700">Empanel Your Hospital</h1>
        <Card className="mb-8 max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Hospital Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hospital Name</label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hospital Rohini ID (Optional)</label>
                  <input
                    type="text"
                    name="hospitalRohiniId"
                    value={formData.hospitalRohiniId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Hospital Address</label>
                  <textarea
                    name="hospitalAddress"
                    value={formData.hospitalAddress}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pin Code</label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Person Name</label>
                  <input
                    type="text"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Person Email</label>
                  <input
                    type="email"
                    name="contactPersonEmail"
                    value={formData.contactPersonEmail}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Person Phone No.</label>
                  <input
                    type="text"
                    name="contactPersonPhone"
                    value={formData.contactPersonPhone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              {successMessage && <p className="text-green-600">{successMessage}</p>}
              {errorMessage && <p className="text-red-600">{errorMessage}</p>}
              <Button type="submit" className="w-full bg-red-700 text-white">
                Submit Query
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EmpanelHospital;