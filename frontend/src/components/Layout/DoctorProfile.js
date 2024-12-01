import React, { useEffect, useState } from "react";
import { get, ref, child, update } from "firebase/database";
import { auth, db } from "../../firebase";
import Layout from "../Layout/Layout";
import {
  FaEnvelope,
  FaPhone,
  FaUser,
  FaBriefcase,
  FaHospital,
  FaClock,
  FaDollarSign,
} from "react-icons/fa";

const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "General Medicine",
  "Oncology",
  "Psychiatry",
  "Ophthalmology",
  "Gynecology",
];

const DoctorProfile = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError("You must be logged in to view this page.");
          return;
        }

        const userId = currentUser.uid;
        const dbRef = ref(db);

        // Fetch doctor data
        const doctorSnapshot = await get(child(dbRef, `users/doctors/${userId}`));
        if (doctorSnapshot.exists()) {
          const data = doctorSnapshot.val();
          setDoctorData(data);
          setFormData({
            ...data,
            specialty: data.specialty || "",
            designation: data.designation || "",
            experience: data.experience || "",
            consultationFee: data.consultationFee || "",
            clinicAddress: data.clinicAddress || "",
            hospital: data.hospital || "",
            phone: data.phone || "",
            email: data.email || "",
          });
        } else {
          throw new Error("No doctor data found.");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
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
        specialty: formData.specialty,
        designation: formData.designation,
        experience: formData.experience,
        consultationFee: formData.consultationFee,
        clinicAddress: formData.clinicAddress,
        hospital: formData.hospital,
        phone: formData.phone,
        email: formData.email,
      };

      // Update the database
      await update(ref(db, `users/doctors/${userId}`), updatedData);

      setIsEditing(false);
      alert("Profile updated successfully!");
      setDoctorData(updatedData);
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
                alt={`${doctorData.firstName} ${doctorData.lastName}`}
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
                  {doctorData.firstName} {doctorData.lastName}
                </h2>
              )}
            </div>
          </div>

          {/* Professional Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Specialty</p>
              {isEditing ? (
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded-md w-full"
                  required
                >
                  <option value="">Select Specialty</option>
                  {SPECIALTIES.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-700">{doctorData.specialty}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Hospital Affiliated</p>
              {isEditing ? (
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded-md w-full"
                  required
                />
              ) : (
                <p className="text-gray-700">{doctorData.hospital}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Consultation Fees</p>
              {isEditing ? (
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded-md w-full"
                  required
                />
              ) : (
                <p className="text-gray-700">${doctorData.consultationFee}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Experience</p>
              {isEditing ? (
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded-md w-full"
                  required
                />
              ) : (
                <p className="text-gray-700">{doctorData.experience} years</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone Number</p>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded-md w-full"
                  required
                />
              ) : (
                <p className="text-gray-700">{doctorData.phone}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email Address</p>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded-md w-full"
                  required
                />
              ) : (
                <p className="text-gray-700">{doctorData.email}</p>
              )}
            </div>
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

export default DoctorProfile;