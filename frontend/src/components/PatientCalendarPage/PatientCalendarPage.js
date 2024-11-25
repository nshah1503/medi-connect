import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card.js";
import { Button } from "../Button/Button.js";
import HumeAISection from '../HumeAI/HumeAISection.js';
//import InsuranceFeatures from "../Insurance/InsuranceFeatures.js";

const PatientCalendarPage = () => {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState([
    { id: 1, date: "2024-10-21", time: "10:00 AM", doctor: "Dr. John Doe" },
  ]);
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, name: "Prescription 1", date: "2024-10-18" },
    { id: 2, name: "Prescription 2", date: "2024-10-19" },
  ]);
  const [upcomingTests, setUpcomingTests] = useState([
    { id: 1, name: "Blood Test", date: "2024-10-25" },
    { id: 2, name: "X-Ray", date: "2024-10-27" },
  ]);

  const launchVideoCall = () => {
    try {
      window.open("https://doc-talk.daily.co/doc-talk", "_blank");
    } catch (error) {}
  };

  const handleBookAppointment = () => {
    navigate("/patient/doctors");
  };

  return (
    <Layout userType="patient">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-red-700">
          Patient Dashboard
        </h1>

        <Button
          onClick={handleBookAppointment}
          className="bg-red-700 text-white p-4 rounded-lg mb-8 text-xl font-bold"
        >
          Book Appointment
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {upcomingAppointments.map((appointment) => (
                  <li
                    key={appointment.id}
                    className="bg-gray-100 p-3 rounded-md"
                  >
                    <Link
                      onClick={launchVideoCall}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {appointment.date} - {appointment.time} with{" "}
                      {appointment.doctor}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Your Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {prescriptions.map((prescription) => (
                  <li
                    key={prescription.id}
                    className="bg-gray-100 p-3 rounded-md"
                  >
                    <Link
                      to="/patient/review-pdf"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {prescription.name} - {prescription.date}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Upcoming Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {upcomingTests.map((test) => (
                  <li key={test.id} className="bg-gray-100 p-3 rounded-md">
                    {test.name} - {test.date}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8">
          <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Insurance Features</CardTitle>
          </CardHeader>
          <CardContent>
            {/* <InsuranceFeatures /> */}
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  );
};

export default PatientCalendarPage;
