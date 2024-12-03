// src/components/DoctorsPage/DoctorsPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../Layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card.js";
import { Button } from "../Button/Button.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../Dialog/Dialog.js";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"; // Import plugin
import HumeAISection from "../HumeAI/HumeAISection.js";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion components

// Extend dayjs with the plugin
dayjs.extend(isSameOrBefore);

const DoctorsPage = () => {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availability, setAvailability] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(dayjs().startOf("week").add(1, "day")); // Start with Monday

  // Retrieve patientId from localStorage
  const patientId = localStorage.getItem("patientId");

  // Redirect if no patientId is found
  useEffect(() => {
    if (!patientId) {
      alert("No patient ID found. Please log in again.");
      navigate("/patient/login"); // Redirect to login if patientId is missing
    }
  }, [patientId, navigate]);

  // Fetch specialties on component load
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await axios.get("http://localhost:4000/specialties");
        setSpecialties(response.data);
      } catch (error) {
        console.error("Error fetching specialties:", error);
      }
    };

    fetchSpecialties();
  }, []);

  // Fetch doctors when a specialty is selected
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        if (selectedCategory) {
          const response = await axios.get(
            `http://localhost:4000/doctors-by-specialty?specialty=${selectedCategory}`
          );
          setDoctors(response.data);
          setSelectedDoctor(null); // Reset selected doctor when switching specialties
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, [selectedCategory]);

  // Fetch availability for the selected doctor
  const fetchAvailability = async (doctorId) => {
    try {
      const response = await axios.get(`http://localhost:4000/availability/${doctorId}`);
      setAvailability(response.data);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  // Handle doctor selection
  const handleDoctorSelection = (doctor) => {
    setSelectedDoctor(doctor);
    fetchAvailability(doctor.doctorId);
  };

  // Handle time slot selection
  const handleSlotSelection = (day, time) => {
    if (!selectedDoctor) {
      alert("Please select a doctor first");
      return;
    }
    setSelectedSlot({ day, time });
    setShowConfirmation(true);
  };

  // Confirm booking
  const handleConfirmBooking = async () => {
    try {
      const bookingData = {
        patientId,
        doctorId: selectedDoctor.doctorId,
        doctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
        specialty: selectedDoctor.specialty,
        consultationFee: selectedDoctor.consultationFee,
        date: selectedSlot.day,
        time: selectedSlot.time,
      };

      // Save booking in the backend
      await axios.post("http://localhost:4000/book", bookingData);

      await axios.post("http://localhost:4000/create-appointment", {
        patientId,
        doctorId: selectedDoctor.doctorId,
        date: selectedSlot.day,
        time: selectedSlot.time,
        status: "confirmed",
      });

      // Update availability locally
      setAvailability((prevAvailability) => ({
        ...prevAvailability,
        [selectedSlot.day]: {
          ...prevAvailability[selectedSlot.day],
          [selectedSlot.time]: false,
        },
      }));

      setShowConfirmation(false);
      setSelectedSlot(null);

      // Redirect to payment page
      navigate("/payment", { state: bookingData });
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("Failed to book the appointment. Please try again.");
    }
  };

  // Calculate current week's dates (Monday to Friday)
  const calculateWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = currentWeekStart.add(i, "day");
      dates.push({
        day: date.format("ddd"),
        formattedDate: date.format("YYYY-MM-DD"),
        displayDate: date.format("MMM D"),
      });
    }
    return dates;
  };

  // Handle navigation between weeks
  const handleNextWeek = () => {
    setCurrentWeekStart(currentWeekStart.add(7, "day"));
  };

  const handlePreviousWeek = () => {
    const newWeekStart = currentWeekStart.subtract(7, "day");
    if (newWeekStart.isSameOrBefore(dayjs().startOf("week").add(1, "day"))) {
      return; // Prevent navigating to past weeks
    }
    setCurrentWeekStart(newWeekStart);
  };

  // Weekly dates for the current week
  const dates = calculateWeekDates();

  return (
    <Layout userType="patient">
      <motion.div
        className="container mx-auto py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-3xl font-bold mb-8 text-red-700 text-center">Book an Appointment</h1>

        {/* Specialty Selection */}
        <motion.div
          className="mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Select Specialty</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                className="flex gap-4 mb-6 overflow-x-auto"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {specialties.map((specialty, index) => (
                  <motion.div key={`specialty-${index}`} variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 },
                  }}>
                    <Button
                      onClick={() => setSelectedCategory(specialty)}
                      className={`${
                        selectedCategory === specialty ? "bg-red-700" : "bg-gray-500"
                      } text-white rounded-full px-4 py-2 hover:bg-red-800 transition-colors`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {specialty}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>

              {/* Doctors List */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {doctors.map((doctor) => (
                  <motion.div
                    key={doctor.doctorId}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer ${
                        selectedDoctor?.doctorId === doctor.doctorId
                          ? "border-2 border-red-700 shadow-lg"
                          : "shadow-md"
                      } transition-shadow duration-300`}
                      onClick={() => handleDoctorSelection(doctor)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2">
                          {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-gray-600">{doctor.specialty}</p>
                        <p className="text-gray-600">Experience: {doctor.experience} years</p>
                        <p className="text-gray-600">Fees: ${doctor.consultationFee}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Availability */}
        {selectedDoctor && (
          <motion.div
            className="mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Weekly Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  {/* Left Arrow for Previous Week */}
                  <motion.button
                    onClick={handlePreviousWeek}
                    disabled={currentWeekStart.isSameOrBefore(dayjs().startOf("week").add(1, "day"))}
                    className={`text-2xl px-4 ${
                      currentWeekStart.isSameOrBefore(dayjs().startOf("week").add(1, "day"))
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-700 hover:text-red-800"
                    } focus:outline-none`}
                    whileHover={!currentWeekStart.isSameOrBefore(dayjs().startOf("week").add(1, "day")) && { scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ←
                  </motion.button>

                  <motion.div
                    className="grid grid-cols-5 gap-4 w-full"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.1,
                        },
                      },
                    }}
                  >
                    {dates.map((date, index) => (
                      <motion.div key={index} className="text-center">
                        <div className="font-semibold">{date.day}</div>
                        <div className="text-sm text-gray-600">{date.displayDate}</div>
                        <div className="mt-2 space-y-1">
                          {availability[date.formattedDate] &&
                          Object.keys(availability[date.formattedDate]).length > 0 ? (
                            Object.keys(availability[date.formattedDate]).map((timeSlot) => (
                              <motion.button
                                key={timeSlot}
                                onClick={() => handleSlotSelection(date.formattedDate, timeSlot)}
                                disabled={
                                  !availability[date.formattedDate][timeSlot] ||
                                  dayjs(date.formattedDate).isBefore(dayjs(), "day")
                                }
                                className={`w-full text-sm rounded-md py-1 ${
                                  availability[date.formattedDate][timeSlot]
                                    ? "bg-green-700 text-white hover:bg-green-800"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                                whileHover={
                                  availability[date.formattedDate][timeSlot] && {
                                    scale: 1.05,
                                  }
                                }
                                whileTap={
                                  availability[date.formattedDate][timeSlot] && {
                                    scale: 0.95,
                                  }
                                }
                              >
                                {timeSlot}
                              </motion.button>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">No Slots</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Right Arrow for Next Week */}
                  <motion.button
                    onClick={handleNextWeek}
                    className="text-2xl px-4 text-red-700 hover:text-red-800 focus:outline-none"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    →
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* HumeAI Section */}
        <HumeAISection />

        {/* Confirmation Dialog */}
        <AnimatePresence>
        {showConfirmation && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl w-11/12 max-w-lg p-6 md:p-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-gray-800 mb-4">Confirm Appointment</DialogTitle>
                  <DialogDescription>
                    {selectedDoctor && selectedSlot && (
                      <div className="space-y-3">
                        <p className="text-lg">
                          <strong>Doctor:</strong> {selectedDoctor.firstName} {selectedDoctor.lastName}
                        </p>
                        <p className="text-lg">
                          <strong>Specialty:</strong> {selectedDoctor.specialty}
                        </p>
                        <p className="text-lg">
                          <strong>Consultation Fees:</strong> ${selectedDoctor.consultationFee}
                        </p>
                        <p className="text-lg">
                          <strong>Date:</strong> {dayjs(selectedSlot.day).format("MMMM D, YYYY")}
                        </p>
                        <p className="text-lg">
                          <strong>Time:</strong> {selectedSlot.time}
                        </p>
                      </div>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6 flex justify-end space-x-4">
                  <motion.button
                    onClick={() => setShowConfirmation(false)}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleConfirmBooking}
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    Confirm Booking & Pay
                  </motion.button>
                </DialogFooter>
              </DialogContent>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </Layout>
  );
};

export default DoctorsPage;