import React, { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';

const NetworkHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [error, setError] = useState(null);

  const patientId = localStorage.getItem('patientId');

  useEffect(() => {
    const fetchNetworkHospitals = async () => {
      if (!patientId) {
        setError('Patient ID not found. Please log in again.');
        return;
      }

      try {
        const response = await fetch(`/api/network-hospitals/${patientId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch network hospitals.');
        }

        const data = await response.json();
        if (data.networkHospitals?.length) {
          setHospitals(data.networkHospitals);
          setInsuranceProvider(data.insuranceProvider);
        } else {
          setHospitals([]);
          setInsuranceProvider(data.insuranceProvider || 'Unknown');
        }
      } catch (err) {
        console.error('Error fetching network hospitals:', err);
        setError(err.message || 'Something went wrong while fetching data.');
      }
    };

    fetchNetworkHospitals();
  }, [patientId]);

  return (
    <Layout userType="patient">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-red-700">Network Hospitals</h1>

        {insuranceProvider && (
          <p className="mb-4 text-gray-600">
            Affiliated with: <strong>{insuranceProvider}</strong>
          </p>
        )}

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {hospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hospital, index) => (
              <div
                key={index} // Using index as key as IDs might not exist in all hospitals
                className="p-4 border rounded shadow bg-white hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold text-gray-800">{hospital.name}</h3>
                <p className="text-gray-600">Location: {hospital.location}</p>
                <p className="text-gray-600">Contact: {hospital.contact}</p>
                <p className="text-gray-600">
                  Specialties: {hospital.specialties?.join(', ') || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          !error && (
            <p className="text-gray-600">
              No network hospitals available for your insurance provider.
            </p>
          )
        )}
      </div>
    </Layout>
  );
};

export default NetworkHospitals;
