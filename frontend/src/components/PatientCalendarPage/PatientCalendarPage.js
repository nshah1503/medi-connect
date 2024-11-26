import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card.js";
import { Button } from "../Button/Button.js";
import InsuranceFeatures from "../Insurance/InsuranceFeatures.js";
import axios from "axios";

const PatientCalendarPage = () => {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState("");
  const [prescriptions, setPrescriptions] = useState("");
  const [upcomingTests, setUpcomingTests] = useState("");

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientId = "123456"; // Replace with dynamic patient ID if needed
        const response = await axios.get(`http://localhost:4000/patients/${patientId}`);
        const { prescriptions, upcomingAppointments, upcomingTests } = response.data;

        // Update state with fetched data
        setPrescriptions(prescriptions);
        setUpcomingAppointments(upcomingAppointments);
        setUpcomingTests(upcomingTests);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    fetchPatientData();
  }, []);

  const launchVideoCall = () => {
    try {
      window.open("https://doc-talk.daily.co/doc-talk", "_blank");
    } catch (error) {
      console.error("Error launching video call:", error);
    }
  };

  const handleBookAppointment = () => {
    navigate("/patient/doctors");
  };

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
              {upcomingAppointments ? (
                <p>
                  <Link
                    to={upcomingAppointments}
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View your upcoming appointments
                  </Link>
                </p>
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
              {prescriptions ? (
                <p>
                  <Link
                    to={prescriptions}
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View your prescriptions
                  </Link>
                </p>
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