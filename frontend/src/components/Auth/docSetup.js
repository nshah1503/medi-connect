// src/components/DocSetup.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase"; // Import Firebase database
import { ref, set, get } from "firebase/database";
import Layout from "../Layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card";
import { Button } from "../Button/Button";
import dayjs from "dayjs";

const DocSetup = () => {
  const [availability, setAvailability] = useState({});
  const [consultationFee, setConsultationFee] = useState("");
  const [experience, setExperience] = useState("");
  const [doctorData, setDoctorData] = useState(null);
  const [error, setError] = useState(null);

  const doctorId = localStorage.getItem("doctorId");
  const navigate = useNavigate();

  // Fetch existing doctor data on load
  useEffect(() => {
    if (!doctorId) {
      alert("Doctor ID not found. Please log in.");
      navigate("/doctor/auth");
      return;
    }

    const fetchDoctorData = async () => {
      try {
        const doctorRef = ref(db, `users/doctors/${doctorId}`);
        const snapshot = await get(doctorRef);
        if (snapshot.exists()) {
          setDoctorData(snapshot.val());
        } else {
          setError("Doctor data not found.");
        }
      } catch (err) {
        console.error("Error fetching doctor data:", err);
        setError("Failed to fetch doctor data.");
      }
    };

    fetchDoctorData();
  }, [doctorId, navigate]);

  // Handle slot selection
  const toggleSlot = (date, slot) => {
    setAvailability((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [slot]: !prev[date]?.[slot],
      },
    }));
  };

  // Save the setup details
  const saveSetup = async () => {
    if (!consultationFee || !experience || Object.keys(availability).length === 0) {
      setError("Please fill all fields and select availability.");
      return;
    }

    try {
      const updatedDoctorData = {
        ...doctorData,
        consultationFee: parseFloat(consultationFee),
        experience: parseInt(experience, 10),
        availability,
      };

      const doctorRef = ref(db, `users/doctors/${doctorId}`);
      await set(doctorRef, updatedDoctorData);

      console.log("Doctor setup saved successfully.");
      navigate("/doctor/dashboard");
    } catch (err) {
      console.error("Error saving setup:", err);
      setError("Failed to save setup. Please try again.");
    }
  };

  const slots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  // Generate dates for the current week (Monday to Friday)
  const generateWeekDates = () => {
    const startOfWeek = dayjs().startOf("week").add(1, "day"); // Start with Monday
    const weekDates = [];
    for (let i = 0; i < 5; i++) {
      weekDates.push(startOfWeek.add(i, "day").format("YYYY-MM-DD"));
    }
    return weekDates;
  };

  const weekDates = generateWeekDates();

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold text-red-700">
              Setup Availability, Fees, and Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Consultation Fee Input */}
              <div>
                <label className="block text-lg font-medium mb-2">
                  Consultation Fee
                </label>
                <input
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  placeholder="Enter your consultation fee"
                  className="border p-2 w-full"
                />
              </div>

              {/* Experience Input */}
              <div>
                <label className="block text-lg font-medium mb-2">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Enter your experience in years"
                  className="border p-2 w-full"
                />
              </div>

              {/* Weekly Availability */}
              <div>
                <h2 className="text-xl font-bold mb-4">Weekly Availability</h2>
                <div className="grid grid-cols-5 gap-4">
                  {weekDates.map((date) => (
                    <div key={date} className="text-center">
                      <div className="font-semibold">{dayjs(date).format("ddd")}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {dayjs(date).format("MMM D")}
                      </div>
                      <div className="space-y-2">
                        {slots.map((slot) => (
                          <Button
                            key={slot}
                            className={`w-full text-sm ${
                              availability[date]?.[slot]
                                ? "bg-green-700 text-white hover:bg-green-800"
                                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                            }`}
                            onClick={() => toggleSlot(date, slot)}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-600">{error}</p>}

              {/* Save Button */}
              <Button
                onClick={saveSetup}
                className="bg-red-700 text-white w-full p-4 text-lg font-bold"
              >
                Save and Proceed to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DocSetup;