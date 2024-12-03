import React, { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import { Button } from "../Button/Button";

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [formData, setFormData] = useState({
    claimReason: '',
    claimAmount: '',
    hospitalName: '',
  });
  const [error, setError] = useState(null);

  // Fetch claims from the backend
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch('/getclaims');
        const data = await response.json();
        setClaims(data.claims || []);
      } catch (err) {
        console.error('Error fetching claims:', err);
        setError('Failed to fetch claims.');
      }
    };

    fetchClaims();
  }, []);

  // Handle form submission for submitting a new claim
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.claimReason || !formData.claimAmount || !formData.hospitalName) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await fetch('/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newClaim = await response.json();
        setClaims([...claims, newClaim]);
        setFormData({ claimReason: '', claimAmount: '', hospitalName: '' });
        setError(null);
      } else {
        throw new Error('Failed to submit claim.');
      }
    } catch (err) {
      console.error('Error submitting claim:', err);
      setError('Failed to submit claim.');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Layout userType="patient">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-red-700">Claims</h1>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Submit a New Claim</h2>
          {error && <p className="text-red-600">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
            <div>
              <label className="block text-sm font-medium mb-2">Claim Reason</label>
              <input
                type="text"
                name="claimReason"
                value={formData.claimReason}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                placeholder="Enter the claim reason"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Claim Amount</label>
              <input
                type="number"
                name="claimAmount"
                value={formData.claimAmount}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                placeholder="Enter the claim amount"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hospital Name</label>
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                placeholder="Enter the hospital name"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-red-700 text-white p-2 rounded-md hover:bg-red-800"
            >
              Submit Claim
            </Button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Your Claims</h2>
          {claims.length > 0 ? (
            <ul className="space-y-4">
              {claims.map((claim) => (
                <li key={claim.id} className="bg-gray-100 p-4 rounded shadow">
                  <p>
                    <strong>Reason:</strong> {claim.reason}
                  </p>
                  <p>
                    <strong>Amount:</strong> ${claim.amount}
                  </p>
                  <p>
                    <strong>Hospital:</strong> {claim.hospital}
                  </p>
                  <p>
                    <strong>Status:</strong> {claim.status}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No claims found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Claims;
