// src/components/PatientCalendarPage/PatientCalendarPage.js

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card.js";
import { Button } from "../Button/Button.js";
import InsuranceFeatures from "../Insurance/InsuranceFeatures.js";
import axios from "axios";
import { storage } from "../../firebase";
import { ref, listAll, getMetadata } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion components

const PatientCalendarPage = () => {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [files, setFiles] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const patientId = localStorage.getItem("patientId"); // Retrieve patient ID from localStorage

  useEffect(() => {
    if (!patientId) {
      alert("No patient ID found. Please log in again.");
      navigate("/patient/login");
      return;
    }

    const fetchPatientData = async () => {
      try {
        // Fetch upcoming appointments with doctor details
        const appointmentsResponse = await axios.get(
          `http://localhost:4000/appointments/patient/${patientId}`
        );
        setUpcomingAppointments(appointmentsResponse.data.appointments);
        console.log("Appointment data in patient dashboard", appointmentsResponse.data.appointments);

        // Fetch additional patient information
        const patientResponse = await axios.get(
          `http://localhost:4000/patients/${patientId}`
        );
        setUpcomingTests(patientResponse.data.upcomingTests);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchFiles = async () => {
      try {
        const storageRef = ref(storage, "pdfs");
        const fileList = await listAll(storageRef);

        const filesWithMetadata = await Promise.all(
          fileList.items.map(async (item) => {
            const metadata = await getMetadata(item);
            return {
              name: item.name,
              fullPath: item.fullPath,
              type: metadata.contentType,
              date: metadata.timeCreated,
            };
          })
        );

        // Filter out non-PDF files and placeholders
        const pdfFiles = filesWithMetadata.filter(
          (file) => file.type === "application/pdf" && file.name !== ".placeholder"
        );

        setFiles(pdfFiles);
      } catch (error) {
        console.error("Error fetching files:", error);
        setError(`Error fetching files: ${error.message}`);
      }
    };

    fetchPatientData();
    fetchFiles();
  }, [patientId, navigate]);

  const launchVideoCall = () => {
    try {
      window.open("https://doc-talk.daily.co/doc-talk", "_blank");
    } catch (error) {
      console.error("Error launching video call:", error);
    }
  };

  const handleBookAppointment = () => {
    navigate("/patient/booking");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <motion.p
            className="text-xl font-semibold text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Loading your data...
          </motion.p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <motion.p
            className="text-xl font-semibold text-red-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Error: {error}
          </motion.p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userType="patient">
      <motion.div
        className="container mx-auto py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-3xl font-bold mb-8 text-red-700 text-center">Patient Dashboard</h1>

        {/* Book Appointment Button */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={handleBookAppointment}
            className="bg-red-700 text-white px-6 py-3 rounded-lg text-xl font-bold shadow-md hover:bg-red-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book Appointment
          </Button>
        </motion.div>

        {/* Grid Layout for Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length > 0 ? (
                    <ul className="space-y-4">
                      {upcomingAppointments.map((appointment, index) => (
                        <motion.li
                          key={appointment.appointmentId}
                          className="bg-gray-100 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                              <p>
                                <strong>Doctor:</strong> {appointment.doctorName}
                              </p>
                              <p>
                                <strong>Specialty:</strong> {appointment.specialty}
                              </p>
                              <p>
                                <strong>Date:</strong> {appointment.date}
                              </p>
                              <p>
                                <strong>Time:</strong> {appointment.time}
                              </p>
                            </div>
                            <motion.button
                              onClick={launchVideoCall}
                              className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition-colors mt-2 md:mt-0"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Join Video Call
                            </motion.button>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <motion.p
                      className="text-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      No upcoming appointments.
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Prescriptions */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Your Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  {files.length > 0 ? (
                    <ul className="space-y-2">
                      {files.map((file, index) => (
                        <motion.li
                          key={file.fullPath}
                          className="bg-gray-100 p-3 rounded-md shadow-sm hover:bg-gray-200 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                        >
                          <Link
                            to={`/patient/review-pdf/${encodeURIComponent(file.fullPath)}`}
                            className="text-blue-600 hover:text-blue-800 block"
                          >
                            <span className="font-semibold">{file.name}</span> -{" "}
                            {new Date(file.date).toLocaleDateString()}
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <motion.p
                      className="text-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      No prescriptions available.
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Upcoming Tests */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Upcoming Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingTests ? (
                    <motion.p
                      className="text-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      {upcomingTests}
                    </motion.p>
                  ) : (
                    <motion.p
                      className="text-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      No upcoming tests scheduled.
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Insurance Features */}
        <AnimatePresence>
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Insurance Features</CardTitle>
              </CardHeader>
              <CardContent>
                <InsuranceFeatures />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
};

export default PatientCalendarPage;