import React, { useState } from 'react';
import Layout from '../Layout/Layout';

const PremiumCalculator = () => {
  const [age, setAge] = useState('');
  const [coverageAmount, setCoverageAmount] = useState('');
  const [insuranceType, setInsuranceType] = useState('Health');
  const [premium, setPremium] = useState(null);
  const [error, setError] = useState('');

  const calculatePremium = async () => {
    setError('');
    setPremium(null);

    if (!age || !coverageAmount) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('/api/calculate-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age, coverageAmount, insuranceType }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate premium. Please try again.');
      }

      const data = await response.json();
      setPremium(data.premium);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <Layout userType="patient">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-red-700">Premium Calculator</h1>

        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Age</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Coverage Amount ($)</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              value={coverageAmount}
              onChange={(e) => setCoverageAmount(e.target.value)}
              placeholder="Enter coverage amount"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Insurance Type</label>
            <select
              className="w-full p-2 border rounded-md"
              value={insuranceType}
              onChange={(e) => setInsuranceType(e.target.value)}
            >
              <option value="Health">Health</option>
              <option value="Life">Life</option>
              <option value="Vehicle">Vehicle</option>
            </select>
          </div>

          <button
            onClick={calculatePremium}
            className="w-full bg-red-700 text-white p-2 rounded-md hover:bg-red-800 transition"
          >
            Calculate Premium
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
              <p>{error}</p>
            </div>
          )}

          {premium !== null && (
            <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-md">
              <h3 className="text-lg font-bold">Calculated Premium</h3>
              <p>Your monthly premium is: <strong>${premium}</strong></p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PremiumCalculator;
