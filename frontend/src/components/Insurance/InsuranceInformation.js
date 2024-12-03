import React, { useState, useEffect } from "react";
import Layout from "../Layout/Layout";

const InsuranceInformation = () => {
  const [insuranceInfo, setInsuranceInfo] = useState(null);
  const [error, setError] = useState(null);

  const patientId = localStorage.getItem("patientId");

  useEffect(() => {
    const fetchInsuranceInfo = async () => {
      try {
        const response = await fetch(`/api/insurance-information/${patientId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch insurance information.");
        }
        const data = await response.json();
        console.log("Fetched Insurance Info:", data.beneficiaries);
        setInsuranceInfo(data);
      } catch (err) {
        console.error("Error fetching insurance information:", err);
        setError(err.message);
      }
    };

    if (patientId) {
      fetchInsuranceInfo();
    } else {
      setError("Patient ID not found in local storage.");
    }
  }, [patientId]);

  if (error) {
    return (
      <Layout userType="patient">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-red-700">
            Insurance Information
          </h1>
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!insuranceInfo) {
    return (
      <Layout userType="patient">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-red-700">
            Insurance Information
          </h1>
          <p className="text-gray-600">Loading insurance details...</p>
        </div>
      </Layout>
    );
  }

  const { insuranceProvider, policyNumber, coverageAmount, validUntil, beneficiaries } = insuranceInfo;
  console.log("Beneficiaries", beneficiaries);

  return (
    <Layout userType="patient">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-red-700">
          Insurance Information
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4">
            <strong>Insurance Provider:</strong> {insuranceProvider || "Not specified"}
          </p>
          <p className="mb-4">
            <strong>Policy Number:</strong> {policyNumber || "Not available"}
          </p>
          <p className="mb-4">
            <strong>Coverage Amount:</strong> {coverageAmount ? `$${coverageAmount}` : "Not specified"}
          </p>
          <p className="mb-4">
            <strong>Valid Until:</strong> {validUntil || "Not specified"}
          </p>
          <p className="mb-4">
            <strong>Beneficiaries:</strong> {beneficiaries || "Not specified"}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default InsuranceInformation;
