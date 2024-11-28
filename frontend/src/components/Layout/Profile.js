// src/components/Profile.js
import React, { useEffect, useState } from "react";
import { get, ref, child, update } from "firebase/database";
import { auth, db } from "../../firebase";
import Layout from "../Layout/Layout";
import {
  FaMale,
  FaFemale,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaGlobe,
  FaCalendar,
  FaHeartbeat,
} from "react-icons/fa";

const INSURANCE_PROVIDERS = [
  "Blue Cross Blue Shield",
  "United Healthcare",
  "Kaiser Permanente",
  "Aetna",
  "Cigna",
  "Humana",
  "Centene",
  "Molina Healthcare",
  "Anthem",
  "WellCare",
  "Other",
];

const Profile = () => {
  const [patientData, setPatientData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
    "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
    "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
    "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  ];

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError("You must be logged in to view this page.");
          return;
        }

        const userId = currentUser.uid;
        const dbRef = ref(db);

        // Fetch patient data
        const patientSnapshot = await get(child(dbRef, `users/patients/${userId}`));
        if (patientSnapshot.exists()) {
          const data = patientSnapshot.val();
          setPatientData(data);
          setFormData({
            ...data,
            emergencyContact: data.emergencyContact || "",
            insurance: data.insurance || "",
            preferredLanguage: data.preferredLanguage || "",
            medicalHistory: data.medicalHistory || "",
          });
        } else {
          throw new Error("No patient data found.");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("You must be logged in to update your profile.");
        return;
      }

      const userId = currentUser.uid;

      // Prepare updated data
      const updatedData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        insurance: formData.insurance,
        emergencyContact: formData.emergencyContact,
        preferredLanguage: formData.preferredLanguage,
        medicalHistory: formData.medicalHistory,
        address: {
          street: formData.address.street,
          state: formData.address.state,
          zip: formData.address.zip,
        },
      };

      // Update the database
      await update(ref(db, `users/patients/${userId}`), updatedData);

      setIsEditing(false);
      alert("Profile updated successfully!");
      setPatientData(updatedData);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl font-semibold text-red-500">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center mb-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <img
                src={`https://picsum.photos/seed/${auth.currentUser.uid}/150`}
                alt={`${patientData.firstName} ${patientData.lastName}`}
                className="h-32 w-32 rounded-full object-cover shadow-md"
              />
            </div>

            {/* User Information */}
            <div className="text-center md:text-left w-full">
              {isEditing ? (
                <>
                  <div className="flex items-center mb-2">
                    <FaUser className="h-5 w-5 text-gray-500 mr-2" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="border border-gray-300 p-2 rounded-md w-full"
                      required
                    />
                  </div>
                  <div className="flex items-center mb-2">
                    <FaUser className="h-5 w-5 text-gray-500 mr-2" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="border border-gray-300 p-2 rounded-md w-full"
                      required
                    />
                  </div>
                </>
              ) : (
                <h2 className="text-2xl font-semibold text-gray-800">
                  {patientData.firstName} {patientData.lastName}
                </h2>
              )}

              {isEditing ? (
                <>
                  <div className="flex items-center mb-2">
                    <FaPhone className="h-5 w-5 text-gray-500 mr-2" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="border border-gray-300 p-2 rounded-md w-full"
                      required
                    />
                  </div>
                  <div className="flex items-center mb-2">
                    <FaEnvelope className="h-5 w-5 text-gray-500 mr-2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border border-gray-300 p-2 rounded-md w-full"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center mb-2">
                    <FaPhone className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">{patientData.phone}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <FaEnvelope className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">{patientData.email}</span>
                  </div>
                </>
              )}

              {isEditing ? (
                <>
                  <div className="flex items-center mb-2">
                    <FaGlobe className="h-5 w-5 text-gray-500 mr-2" />
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="border border-gray-300 p-2 rounded-md w-full mb-2"
                      placeholder="Street Name"
                      required
                    />
                  </div>
                  <div className="flex items-center mb-2">
                    <FaGlobe className="h-5 w-5 text-gray-500 mr-2" />
                    <select
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      className="border border-gray-300 p-2 rounded-md w-full"
                      required
                    >
                      <option value="">Select State</option>
                      {US_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <FaGlobe className="h-5 w-5 text-gray-500 mr-2" />
                    <input
                      type="text"
                      name="address.zip"
                      value={formData.address.zip}
                      onChange={handleInputChange}
                      className="border border-gray-300 p-2 rounded-md w-full"
                      placeholder="Zip Code"
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center mb-2">
                  <FaGlobe className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">
                    {patientData.address.street}, {patientData.address.state},{" "}
                    {patientData.address.zip}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h3>
            {isEditing ? (
              <div className="space-y-4">
                {/* Insurance Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="insurance">
                    Insurance Provider
                  </label>
                  <select
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleInputChange}
                    className="border border-gray-300 p-2 rounded-md w-full"
                    required
                  >
                    <option value="">Select Insurance Provider</option>
                    {INSURANCE_PROVIDERS.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="emergencyContact">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="border border-gray-300 p-2 rounded-md w-full"
                    required
                  />
                </div>

                {/* Preferred Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="preferredLanguage">
                    Preferred Language
                  </label>
                  <input
                    type="text"
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleInputChange}
                    className="border border-gray-300 p-2 rounded-md w-full"
                    required
                  />
                </div>

                {/* Medical History */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="medicalHistory">
                    Medical History
                  </label>
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    className="border border-gray-300 p-2 rounded-md w-full"
                    rows="4"
                    placeholder="Describe your medical history"
                    required
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Insurance Provider */}
                <div>
                  <p className="text-sm font-medium text-gray-500">Insurance Provider</p>
                  <p className="text-gray-700">{patientData.insurance || "N/A"}</p>
                </div>

                {/* Emergency Contact */}
                <div>
                  <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                  <p className="text-gray-700">{patientData.emergencyContact || "N/A"}</p>
                </div>

                {/* Preferred Language */}
                <div>
                  <p className="text-sm font-medium text-gray-500">Preferred Language</p>
                  <p className="text-gray-700">{patientData.preferredLanguage || "N/A"}</p>
                </div>

                {/* Medical History */}
                <div>
                  <p className="text-sm font-medium text-gray-500">Medical History</p>
                  <p className="text-gray-700">{patientData.medicalHistory || "N/A"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Edit/Save Buttons */}
          <div className="mt-8 flex justify-end">
            {isEditing ? (
              <button
                onClick={handleSaveChanges}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
