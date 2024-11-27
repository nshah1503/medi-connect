import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaMale,
  FaFemale,
  FaGenderless,
  FaTransgender,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaGlobe,
  FaCalendar,
} from 'react-icons/fa';
import Layout from '../Layout/Layout';
// Removed PropTypes since userId is no longer a prop

const Profile = () => {
  const userId = "12345"; // Hardcoded userId

  // State variables for patient data
  const [patientData, setPatientData] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [errorPatient, setErrorPatient] = useState(null);

  // State variables for bookings
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [errorBookings, setErrorBookings] = useState(null);

  useEffect(() => {
    if (!userId) {
      setErrorPatient('User ID is required.');
      setLoadingPatient(false);
      setLoadingBookings(false);
      return;
    }

    // Fetch Bookings
    const fetchBookings = async () => {
      console.log("Fetching bookings...");
      try {
        const bookingResponse = await axios.get(`http://localhost:4000/fetch-bookings/${userId}`);
        console.log("Bookings response:", bookingResponse.data);
        const { bookings } = bookingResponse.data;
        setBookings(bookings);
        setLoadingBookings(false);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setErrorBookings('Failed to load bookings.');
        setLoadingBookings(false);
      }
    };

    // Fetch Patient Data
    const fetchPatientData = async () => {
      console.log("Fetching patient data...");
      try {
        const response = await axios.get(`http://localhost:4000/fetch-bookings/${userId}`);
        console.log("Patient data response:", response.data.bookings);

        let patient;
        if (Array.isArray(response.data.bookings)) {
          if (response.data.bookings.length === 0) {
            throw new Error("No patient data found.");
          }
          // Assuming the first element contains the patient data
          patient = response.data.bookings[0];
        } else {
          patient = response.data.bookings;
        }

        const { firstName, lastName, email, phone, address, dateOfBirth, gender, profilePictureUrl } = patient;

        setPatientData({
          firstName,
          lastName,
          email,
          phone,
          address,
          dateOfBirth,
          gender,
          profilePictureUrl,
        });
        setLoadingPatient(false);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setErrorPatient('Failed to load profile data.');
        setLoadingPatient(false);
      }
    };

    // Initiate all fetches in parallel
    fetchBookings();
    fetchPatientData();
  }, [userId]);

  // Mapping gender to corresponding icons
  const genderIconMap = {
    Male: <FaMale className="h-5 w-5 text-gray-500 mr-2" />,
    Female: <FaFemale className="h-5 w-5 text-gray-500 mr-2" />,
    Neuter: <FaGenderless className="h-5 w-5 text-gray-500 mr-2" />,
    Transgender: <FaTransgender className="h-5 w-5 text-gray-500 mr-2" />,
  };

  // Combined Loading State
  const isLoading = loadingPatient || loadingBookings;

  // Combined Error State
  const hasError = errorPatient || errorBookings;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        {/* Loading Spinner */}
        <svg
          className="animate-spin h-8 w-8 text-red-700"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        <span className="ml-2 text-gray-700">Loading...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        {errorPatient && <div className="text-red-500 mb-2">{errorPatient}</div>}
        {errorBookings && <div className="text-red-500 mb-2">{errorBookings}</div>}
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Destructure patient data
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    dateOfBirth,
    gender,
    profilePictureUrl,
  } = patientData;

  return (
    <Layout>
    <div className="container mx-auto p-6">
      {/* Profile Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <img
            src={profilePictureUrl || 'https://via.placeholder.com/150'}
            alt={`${firstName} ${lastName}`}
            className="h-24 w-24 rounded-full object-cover"
          />
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="flex items-center">
            <FaUser className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700 font-semibold">
              {firstName} {lastName}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center">
            <FaEnvelope className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700">{email}</span>
          </div>

          {/* Phone */}
          <div className="flex items-center">
            <FaPhone className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700">{phone}</span>
          </div>

          {/* Address */}
          <div className="flex items-center">
            <FaGlobe className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700">{address}</span>
          </div>

          {/* Date of Birth */}
          <div className="flex items-center">
            <FaCalendar className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700">
              {new Date(dateOfBirth).toLocaleDateString()}
            </span>
          </div>

          {/* Gender */}
          <div className="flex items-center">
            {/* Render the appropriate gender icon or a default icon */}
            {genderIconMap[gender] || <FaUser className="h-5 w-5 text-gray-500 mr-2" />}
            <span className="text-gray-700">{gender}</span>
          </div>

          {/* Add more fields as necessary */}
        </div>

        {/* Optional: Edit Profile Button */}
        <div className="mt-6">
          <button className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-700">You have no bookings.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Booking ID</th>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Time</th>
                  <th className="py-2 px-4 border-b">Doctor</th>
                  <th className="py-2 px-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b text-center">{booking.id}</td>
                    <td className="py-2 px-4 border-b text-center">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {booking.time}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {booking.doctorName || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'Confirmed'
                            ? 'bg-green-200 text-green-800'
                            : booking.status === 'Pending'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default Profile;
