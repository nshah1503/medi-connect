import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import LandingPage from "./components/LandingPage/LandingPage";
import DoctorAuth from "./components/Auth/docAuth";
import PatientAuth from "./components/Auth/patientAuth";
import CalendarPage from "./components/CalendarPage/CalendarPage";
import PatientCalendarPage from "./components/PatientCalendarPage/PatientCalendarPage";
import VideoChat from "./components/VideoChat/VideoChat";
import VideoChatNew from "./components/VideoChatNew/VideoChat";
import ReviewPDF from "./components/ReviewPDF/ReviewPDF";
import DoctorsPage from "./components/DoctorsPage/DoctorsPage";
import VideoCallPage from "./components/VideoCall/VideoCall";
import PaymentPage from "./components/Payment/Payment";
import ECard from "./components/Insurance/ECard";
import Claims from "./components/Insurance/Claims";
import EmpanelHospital from "./components/Insurance/EmpanelHospital";
import Profile from "./components/Layout/Profile";
import RequireAuth from "./components/Auth/requireAuth"; // Import the RequireAuth HOC
import RedirectIfAuth from "./components/Auth/redirectIfAuth"; // Import the RedirectIfAuth HOC
import "./index.css";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Redirect logged-in users from auth routes */}
        <Route
          path="/doctor/auth"
          element={
            <RedirectIfAuth>
              <DoctorAuth />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/patient/auth"
          element={
            <RedirectIfAuth>
              <PatientAuth />
            </RedirectIfAuth>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/doctor/calendar"
          element={
            <RequireAuth>
              <CalendarPage />
            </RequireAuth>
          }
        />
        <Route
          path="/patient/booking"
          element={
            <RequireAuth>
              <DoctorsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/patient/dashboard"
          element={
            <RequireAuth>
              <PatientCalendarPage />
            </RequireAuth>
          }
        />
        <Route
          path="/doctor/video-chat"
          element={
            <RequireAuth>
              <VideoChatNew />
            </RequireAuth>
          }
        />
        <Route
          path="/patient/video-chat"
          element={
            <RequireAuth>
              <VideoChatNew />
            </RequireAuth>
          }
        />
        <Route
          path="/doctor/video-call"
          element={
            <RequireAuth>
              <VideoCallPage />
            </RequireAuth>
          }
        />
        <Route
          path="/patient/video-call"
          element={
            <RequireAuth>
              <VideoCallPage />
            </RequireAuth>
          }
        />
        <Route
          path="/doctor/review-pdf/:filePath"
          element={
            <RequireAuth>
              <ReviewPDF />
            </RequireAuth>
          }
        />
        <Route
          path="/patient/review-pdf/:filePath"
          element={
            <RequireAuth>
              <ReviewPDF />
            </RequireAuth>
          }
        />
        <Route
          path="/payment"
          element={
            <RequireAuth>
              <PaymentPage />
            </RequireAuth>
          }
        />
        <Route
          path="/ecard"
          element={
            <RequireAuth>
              <ECard />
            </RequireAuth>
          }
        />
        <Route
          path="/claims"
          element={
            <RequireAuth>
              <Claims />
            </RequireAuth>
          }
        />
        <Route
          path="/empanelhospital"
          element={
            <RequireAuth>
              <EmpanelHospital />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
