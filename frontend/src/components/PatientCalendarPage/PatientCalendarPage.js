import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card.js";
import { Button } from "../Button/Button.js";
import InsuranceFeatures from "../Insurance/InsuranceFeatures.js";
import axios from "axios";
import { storage } from "../../firebase";
import { ref, listAll, getMetadata } from "firebase/storage";

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
          `http://localhost:4000/appointments/${patientId}`
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
    return <p>Loading your data...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <Layout userType="patient">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-red-700">Patient Dashboard</h1>

        <Button
          onClick={handleBookAppointment}
          className="bg-red-700 text-white p-4 rounded-lg mb-8 text-xl font-bold"
        >
          Book Appointment
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <ul className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <li key={appointment.appointmentId} className="bg-gray-100 p-4 rounded-md">
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
                      <Button
                        onClick={launchVideoCall}
                        className="text-blue-600 hover:text-blue-800 mt-2"
                      >
                        Join Video Call
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming appointments.</p>
              )}
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Your Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {files.length > 0 ? (
                <ul className="space-y-2">
                  {files.map((file) => (
                    <li
                      key={file.fullPath}
                      className="bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Link
                        to={`/patient/review-pdf/${encodeURIComponent(file.fullPath)}`}
                        className="text-blue-600 hover:text-blue-800 block"
                      >
                        <span className="font-semibold">{file.name}</span> -{" "}
                        {new Date(file.date).toLocaleDateString()}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No prescriptions available.</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Upcoming Tests</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTests ? (
                <p>{upcomingTests}</p>
              ) : (
                <p>No upcoming tests scheduled.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Insurance Features</CardTitle>
            </CardHeader>
            <CardContent>
              <InsuranceFeatures />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PatientCalendarPage;



// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Layout from "../Layout/Layout";
// import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card.js";
// import { Button } from "../Button/Button.js";
// import InsuranceFeatures from "../Insurance/InsuranceFeatures.js";
// import axios from "axios";
// import { storage } from "../../firebase";
// import { ref, listAll, getMetadata } from "firebase/storage";

// const PatientCalendarPage = () => {
//   const navigate = useNavigate();
//   const [upcomingAppointments, setUpcomingAppointments] = useState([]);
//   const [files, setFiles] = useState([]);
//   const [upcomingTests, setUpcomingTests] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const userId = localStorage.getItem("patientId"); // Replace with dynamic user ID if needed

//   useEffect(() => {
//     const fetchPatientData = async () => {
//       try {
//         // Fetch booking data from the backend
//         const bookingResponse = await axios.get(`http://localhost:4000/fetch-bookings/${userId}`);
//         const { bookings } = bookingResponse.data;

//         setUpcomingAppointments(bookings);

//         // Fetch additional patient information
//         const response = await axios.get(`http://localhost:4000/patients/${userId}`);
//         const { upcomingTests } = response.data;
//         setUpcomingTests(upcomingTests);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError(err.message);
//       }
//     };

//     const fetchFiles = async () => {
//       try {
//         const storageRef = ref(storage, "pdfs");
//         const fileList = await listAll(storageRef);

//         const filesWithMetadata = await Promise.all(
//           fileList.items.map(async (item) => {
//             const metadata = await getMetadata(item);
//             return {
//               name: item.name,
//               fullPath: item.fullPath,
//               type: metadata.contentType,
//               date: metadata.timeCreated,
//             };
//           })
//         );

//         // Filter out .placeholder and non-PDF files
//         const pdfFiles = filesWithMetadata.filter(
//           (file) =>
//             file.type === "application/pdf" && file.name !== ".placeholder"
//         );

//         setFiles(pdfFiles);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching files:", error);
//         setError(`Error fetching files: ${error.message}`);
//         setLoading(false);
//       }
//     };

//     fetchPatientData();
//     fetchFiles();
//   }, [userId]);

//   const launchVideoCall = () => {
//     try {
//       window.open("https://doc-talk.daily.co/doc-talk", "_blank");
//     } catch (error) {
//       console.error("Error launching video call:", error);
//     }
//   };

//   const handleBookAppointment = () => {
//     navigate("/patient/booking");
//   };

//   if (loading) {
//     return <p>Loading your data...</p>;
//   }

//   if (error) {
//     return <p className="text-red-500">Error: {error}</p>;
//   }

//   return (
//     <Layout userType="patient">
//       <div className="container mx-auto py-8">
//         <h1 className="text-3xl font-bold mb-8 text-red-700">Patient Dashboard</h1>

//         <Button
//           onClick={handleBookAppointment}
//           className="bg-red-700 text-white p-4 rounded-lg mb-8 text-xl font-bold"
//         >
//           Book Appointment
//         </Button>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {/* Upcoming Appointments */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-xl font-bold">Upcoming Appointments</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {upcomingAppointments.length > 0 ? (
//                 <ul className="space-y-4">
//                   {upcomingAppointments.map((appointment) => (
//                     <li key={appointment.id} className="bg-gray-100 p-4 rounded-md">
//                       <p>
//                         <strong>Doctor:</strong> {appointment.doctorName}
//                       </p>
//                       <p>
//                         <strong>Specialty:</strong> {appointment.speciality}
//                       </p>
//                       <p>
//                         <strong>Date:</strong> {appointment.date}
//                       </p>
//                       <p>
//                         <strong>Time:</strong> {appointment.time}
//                       </p>
//                       <Button
//                         onClick={launchVideoCall}
//                         className="text-blue-600 hover:text-blue-800 mt-2"
//                       >
//                         Join Video Call
//                       </Button>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p>No upcoming appointments.</p>
//               )}
//             </CardContent>
//           </Card>

//           {/* Prescriptions */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-xl font-bold">Your Prescriptions</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {files.length > 0 ? (
//                 <ul className="space-y-2">
//                   {files.map((file) => (
//                     <li
//                       key={file.fullPath}
//                       className="bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition-colors"
//                     >
//                       <Link
//                         to={`/patient/review-pdf/${encodeURIComponent(file.fullPath)}`}
//                         className="text-blue-600 hover:text-blue-800 block"
//                       >
//                         <span className="font-semibold">{file.name}</span> -{" "}
//                         {new Date(file.date).toLocaleDateString()}
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p>No prescriptions available.</p>
//               )}
//             </CardContent>
//           </Card>

//           {/* Upcoming Tests */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-xl font-bold">Upcoming Tests</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {upcomingTests ? (
//                 <p>{upcomingTests}</p>
//               ) : (
//                 <p>No upcoming tests scheduled.</p>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         <div className="mt-8">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-xl font-bold">Insurance Features</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <InsuranceFeatures />
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default PatientCalendarPage;