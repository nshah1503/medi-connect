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
        consultationFees: selectedDoctor.consultationFees,
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
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-red-700">Book an Appointment</h1>

        {/* Specialty Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Select Specialty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6 overflow-x-auto">
              {specialties.map((specialty, index) => (
                <Button
                  key={`specialty-${index}`}
                  onClick={() => setSelectedCategory(specialty)}
                  className={`${
                    selectedCategory === specialty ? "bg-red-700" : "bg-gray-500"
                  } text-white`}
                >
                  {specialty}
                </Button>
              ))}
            </div>

            {/* Doctors List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.doctorId}
                  className={`cursor-pointer ${
                    selectedDoctor?.doctorId === doctor.doctorId
                      ? "border-2 border-red-700"
                      : ""
                  }`}
                  onClick={() => handleDoctorSelection(doctor)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">
                      {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-gray-600">{doctor.specialty}</p>
                    <p className="text-gray-600">Experience: {doctor.experience} years</p>
                    <p className="text-gray-600">Fees: ${doctor.consultationFees}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Availability */}
        {selectedDoctor && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Weekly Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                {/* Left Arrow for Previous Week */}
                <button
                  onClick={handlePreviousWeek}
                  disabled={currentWeekStart.isSameOrBefore(dayjs().startOf("week").add(1, "day"))}
                  className={`text-2xl px-4 ${
                    currentWeekStart.isSameOrBefore(dayjs().startOf("week").add(1, "day"))
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-red-700 hover:text-red-800"
                  }`}
                >
                  ←
                </button>

                <div className="grid grid-cols-5 gap-4 w-full">
                  {dates.map((date, index) => (
                    <div key={index} className="text-center">
                      <div className="font-semibold">{date.day}</div>
                      <div className="text-sm text-gray-600">{date.displayDate}</div>
                      <div className="mt-2 space-y-1">
                        {availability[date.formattedDate] &&
                        Object.keys(availability[date.formattedDate]).length > 0 ? (
                          Object.keys(availability[date.formattedDate]).map((timeSlot) => (
                            <Button
                              key={timeSlot}
                              onClick={() => handleSlotSelection(date.formattedDate, timeSlot)}
                              disabled={
                                !availability[date.formattedDate][timeSlot] ||
                                dayjs(date.formattedDate).isBefore(dayjs(), "day")
                              }
                              className={`w-full text-sm ${
                                availability[date.formattedDate][timeSlot]
                                  ? "bg-green-700 text-white hover:bg-green-800"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              {timeSlot}
                            </Button>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No Slots</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Arrow for Next Week */}
                <button
                  onClick={handleNextWeek}
                  className="text-2xl px-4 text-red-700 hover:text-red-800"
                >
                  →
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        <HumeAISection />

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Appointment</DialogTitle>
              <DialogDescription>
                {selectedDoctor && selectedSlot && (
                  <div className="py-4">
                    <p className="mb-2">
                      <strong>Doctor:</strong> {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </p>
                    <p className="mb-2">
                      <strong>Specialty:</strong> {selectedDoctor.specialty}
                    </p>
                    <p className="mb-2">
                      <strong>Consultation Fees:</strong> ${selectedDoctor.consultationFees}
                    </p>
                    <p className="mb-2">
                      <strong>Date:</strong> {selectedSlot.day}, 2024
                    </p>
                    <p className="mb-2">
                      <strong>Time:</strong> {selectedSlot.time}
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmBooking}>Confirm Booking & Pay</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default DoctorsPage;





// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Layout from "../Layout/Layout";
// import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card.js";
// import { Button } from "../Button/Button.js";
// import HumeAISection from "../HumeAI/HumeAISection.js";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from "../Dialog/Dialog.js";

// const DoctorsPage = () => {
//   const navigate = useNavigate();
//   const [specialties, setSpecialties] = useState([]);
//   const [doctors, setDoctors] = useState([]);
//   const [availability, setAvailability] = useState({});
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [selectedDoctor, setSelectedDoctor] = useState(null);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

//   const patientId = localStorage.getItem("patientId");

//   // Redirect if no patientId is found
//   useEffect(() => {
//     if (!patientId) {
//       alert("No patient ID found. Please log in again.");
//       navigate("/patient/login");
//     }
//   }, [patientId, navigate]);

//   // Fetch specialties on component load
//   useEffect(() => {
//     const fetchSpecialties = async () => {
//       try {
//         const response = await axios.get("http://localhost:4000/specialties");
//         setSpecialties(response.data);
//       } catch (error) {
//         console.error("Error fetching specialties:", error);
//       }
//     };

//     fetchSpecialties();
//   }, []);

//   // Fetch doctors when a specialty is selected
//   useEffect(() => {
//     const fetchDoctors = async () => {
//       try {
//         if (selectedCategory) {
//           const response = await axios.get(
//             `http://localhost:4000/doctors-by-specialty?specialty=${selectedCategory}`
//           );
//           setDoctors(response.data);
//           setSelectedDoctor(null); // Clear previously selected doctor
//         }
//       } catch (error) {
//         console.error("Error fetching doctors:", error);
//       }
//     };

//     if (selectedCategory) {
//       fetchDoctors();
//     }
//   }, [selectedCategory]);

//   // Fetch availability for the selected doctor
//   const fetchAvailability = async (doctorId) => {
//     try {
//       const response = await axios.get(`http://localhost:4000/availability/${doctorId}`);
//       setAvailability(response.data);
//     } catch (error) {
//       console.error("Error fetching availability:", error);
//     }
//   };

//   // Handle doctor selection
//   const handleDoctorSelection = (doctor) => {
//     setSelectedDoctor(doctor);
//     if (doctor.doctorId) {
//       fetchAvailability(doctor.doctorId);
//     } else {
//       console.error("Doctor ID is undefined.");
//     }
//   };

//   // Calculate dates for the current week (Monday to Friday)
//   const getWeekDates = () => {
//     const startOfWeek = new Date(currentWeekStart);
//     const weekDates = [];

//     // Adjust to Monday
//     startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

//     for (let i = 0; i < 5; i++) {
//       const date = new Date(startOfWeek);
//       date.setDate(startOfWeek.getDate() + i);
//       weekDates.push(date);
//     }

//     return weekDates;
//   };

//   // Move to next week
//   const handleNextWeek = () => {
//     const nextWeek = new Date(currentWeekStart);
//     nextWeek.setDate(nextWeek.getDate() + 7);
//     setCurrentWeekStart(nextWeek);
//   };

//   // Handle time slot selection
//   const handleSlotSelection = (day, time) => {
//     if (!selectedDoctor) {
//       alert("Please select a doctor first");
//       return;
//     }
//     setSelectedSlot({ day, time });
//     setShowConfirmation(true);
//   };

//   // Confirm booking
//   const handleConfirmBooking = async () => {
//     try {
//       const bookingData = {
//         patientId,
//         doctorId: selectedDoctor.doctorId,
//         doctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
//         specialty: selectedDoctor.specialty,
//         consultationFees: selectedDoctor.consultationFees,
//         date: selectedSlot.day,
//         time: selectedSlot.time,
//       };

//       // Save booking in the backend
//       await axios.post("http://localhost:4000/book", bookingData);

//       // Update availability locally
//       setAvailability((prevAvailability) => ({
//         ...prevAvailability,
//         [selectedSlot.day]: {
//           ...prevAvailability[selectedSlot.day],
//           [selectedSlot.time]: false,
//         },
//       }));

//       setShowConfirmation(false);
//       setSelectedSlot(null);

//       // Redirect to payment page
//       navigate("/payment", { state: bookingData });
//     } catch (error) {
//       console.error("Error confirming booking:", error);
//       alert("Failed to book the appointment. Please try again.");
//     }
//   };

//   const weekDates = getWeekDates();
//   const today = new Date();

//   return (
//     <Layout userType="patient">
//       <div className="container mx-auto py-8">
//         <h1 className="text-3xl font-bold mb-8 text-red-700">Book an Appointment</h1>

//         <Card className="mb-8">
//           <CardHeader>
//             <CardTitle className="text-xl font-bold">Select Specialty</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="flex gap-4 mb-6 overflow-x-auto">
//               {specialties.map((specialty, index) => (
//                 <Button
//                   key={`specialty-${index}`}
//                   onClick={() => setSelectedCategory(specialty)}
//                   className={`${
//                     selectedCategory === specialty ? "bg-red-700" : "bg-gray-500"
//                   } text-white`}
//                 >
//                   {specialty}
//                 </Button>
//               ))}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//               {doctors.map((doctor) => (
//                 <Card
//                   key={`doctor-${doctor.doctorId}`}
//                   className={`cursor-pointer ${
//                     selectedDoctor?.doctorId === doctor.doctorId
//                       ? "border-2 border-red-700"
//                       : ""
//                   }`}
//                   onClick={() => handleDoctorSelection(doctor)}
//                 >
//                   <CardContent className="p-4">
//                     <h3 className="font-bold text-lg mb-2">
//                       {doctor.firstName} {doctor.lastName}
//                     </h3>
//                     <p className="text-gray-600">{doctor.specialty}</p>
//                     <p className="text-gray-600">Experience: {doctor.experience} years</p>
//                     <p className="text-gray-600">Fees: ${doctor.consultationFees}</p>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {selectedDoctor && (
//           <Card className="mb-8">
//             <CardHeader>
//               <CardTitle className="text-xl font-bold">Weekly Availability</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="flex items-center gap-4 mb-4">
//                 {weekDates.map((date) => {
//                   const isPast = date < today.setHours(0, 0, 0, 0); // Check if date is in the past
//                   const formattedDate = date.toISOString().split("T")[0]; // Format date for comparison

//                   return (
//                     <div key={formattedDate} className="text-center">
//                       <div className="font-bold">{date.toDateString().slice(0, 3)}</div>
//                       <div>{date.toDateString().slice(4, 10)}</div>
//                       <div className="grid gap-2 mt-2">
//                         {availability[formattedDate]
//                           ? Object.keys(availability[formattedDate]).map((time) => (
//                               <Button
//                                 key={`${formattedDate}-${time}`}
//                                 disabled={!availability[formattedDate][time] || isPast}
//                                 onClick={() => handleSlotSelection(formattedDate, time)}
//                                 className={`${
//                                   !availability[formattedDate][time] || isPast
//                                     ? "bg-gray-400 cursor-not-allowed"
//                                     : "bg-green-700 hover:bg-green-800"
//                                 } text-white`}
//                               >
//                                 {time}
//                               </Button>
//                             ))
//                           : "No Slots"}
//                       </div>
//                     </div>
//                   );
//                 })}
//                 <Button
//                   onClick={handleNextWeek}
//                   className="bg-red-700 text-white p-2 rounded-md"
//                 >
//                   Next Week →
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         <HumeAISection />

//         <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Confirm Appointment</DialogTitle>
//               <DialogDescription>
//                 {selectedDoctor && selectedSlot && (
//                   <div className="py-4">
//                     <p className="mb-2">
//                       <strong>Doctor:</strong> {selectedDoctor.firstName} {selectedDoctor.lastName}
//                     </p>
//                     <p className="mb-2">
//                       <strong>Specialty:</strong> {selectedDoctor.specialty}
//                     </p>
//                     <p className="mb-2">
//                       <strong>Consultation Fees:</strong> ${selectedDoctor.consultationFees}
//                     </p>
//                     <p className="mb-2">
//                       <strong>Date:</strong> {selectedSlot.day}, 2024
//                     </p>
//                     <p className="mb-2">
//                       <strong>Time:</strong> {selectedSlot.time}
//                     </p>
//                   </div>
//                 )}
//               </DialogDescription>
//             </DialogHeader>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setShowConfirmation(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleConfirmBooking}>Confirm Booking & Pay</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </Layout>
//   );
// };

// export default DoctorsPage;