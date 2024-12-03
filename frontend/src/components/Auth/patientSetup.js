import React, { useState, useEffect } from "react";
import { ref, update, get } from "firebase/database";
import { db } from "../../firebase"; // Import Firebase database
import Layout from "../Layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card";
import { Button } from "../Button/Button";
import { useNavigate } from "react-router-dom";

const PatientSetup = () => {
  const [insuranceData, setInsuranceData] = useState({
    policyNumber: "",
    coverageAmount: "",
    validUntil: "",
    beneficiaries: "",
  });
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const patientId = localStorage.getItem("patientId");

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        if (!patientId) {
          setError("No patient ID found. Please log in.");
          navigate("/patient/auth");
          return;
        }

        const patientRef = ref(db, `users/patients/${patientId}`);
        const snapshot = await get(patientRef);
        if (snapshot.exists()) {
          setPatientData(snapshot.val());
        } else {
          setError("Patient data not found.");
        }
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError("Failed to fetch patient data. Please try again.");
      }
    };

    fetchPatientData();
  }, [patientId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInsuranceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!insuranceData.policyNumber || !insuranceData.coverageAmount || !insuranceData.validUntil) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const updatedPatientData = {
        ...patientData,
        insuranceDetails: {
          ...insuranceData,
        },
      };

      const patientRef = ref(db, `users/patients/${patientId}`);
      await update(patientRef, updatedPatientData);

      console.log("Patient data updated successfully.");
      navigate("/patient/dashboard"); // Redirect to Patient Dashboard
    } catch (err) {
      console.error("Error saving insurance data:", err);
      setError("Failed to save insurance data. Please try again.");
    }
  };

  return (
    <Layout userType="patient">
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold text-red-700">
              Patient Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Policy Number</label>
                <input
                  type="text"
                  name="policyNumber"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your policy number"
                  value={insuranceData.policyNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Coverage Amount</label>
                <input
                  type="number"
                  name="coverageAmount"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter coverage amount"
                  value={insuranceData.coverageAmount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Valid Until</label>
                <input
                  type="date"
                  name="validUntil"
                  className="w-full p-2 border rounded-md"
                  value={insuranceData.validUntil}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Beneficiaries</label>
                <textarea
                  name="beneficiaries"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter beneficiaries (comma-separated)"
                  value={insuranceData.beneficiaries}
                  onChange={handleChange}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-red-700 text-white p-2 rounded-md hover:bg-red-800"
              >
                Save and Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PatientSetup;
