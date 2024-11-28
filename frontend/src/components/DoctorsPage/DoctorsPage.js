import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card.js";
import { Button } from "../Button/Button.js";
// import HumeAISection from '.HumeAISection./DoctorsPage/';
import HumeAISection from '../HumeAI/HumeAISection.js'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../Dialog/Dialog.js";

const DoctorsPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const doctorCategories = [
    { id: "cardiology", name: "Cardiology" },
    { id: "dermatology", name: "Dermatology" },
    { id: "neurology", name: "Neurology" },
    { id: "pediatrics", name: "Pediatrics" },
  ];

  const doctors = [
    {
      id: 1,
      name: "Dr. John Doe",
      category: "cardiology",
      education: "MD - Cardiology, MBBS",
      designation: "Senior Cardiologist",
      experience: "15 years",
    },
    {
      id: 2,
      name: "Dr. Jane Smith",
      category: "dermatology",
      education: "MD - Dermatology, MBBS",
      designation: "Chief Dermatologist",
      experience: "12 years",
    },
    {
      id: 3,
      name: "Dr. Mike Wilson",
      category: "neurology",
      education: "MD - Neurology, MBBS",
      designation: "Neurologist",
      experience: "10 years",
    },
  ];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  const [availableSlots, setAvailableSlots] = useState({});

  useEffect(() => {
    const newAvailableSlots = {};
    weekDays.forEach((day) => {
      const availableSlotsForDay = timeSlots
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1)
        .map(time => ({ time, booked: false }));
      newAvailableSlots[day] = availableSlotsForDay;
    });
    setAvailableSlots(newAvailableSlots);
  }, [selectedDoctor]);

  const handleSlotSelection = (day, time) => {
    if (!selectedDoctor) {
      alert("Please select a doctor first");
      return;
    }
    setSelectedSlot({ day, time });
    setShowConfirmation(true);
  };

  const handleConfirmBooking = () => {
    const bookingData = {
      doctorName: selectedDoctor.name,
      speciality: selectedDoctor.designation,
      date: `2024-10-${20 + weekDays.indexOf(selectedSlot.day)}`,
      time: selectedSlot.time,
    };
    setAvailableSlots(prevSlots => {
      const updatedSlots = { ...prevSlots };
      updatedSlots[selectedSlot.day] = updatedSlots[selectedSlot.day].map(slot => 
        slot.time === selectedSlot.time ? { ...slot, booked: true } : slot
      );
      return updatedSlots;
    });

    setShowConfirmation(false);
    setSelectedSlot(null);
    
    // Redirect to payment page
    navigate("/payment", { state: bookingData });
  };

  const filteredDoctors = selectedCategory === "all" 
    ? doctors 
    : doctors.filter(doctor => doctor.category === selectedCategory);

  return (
    <Layout userType="patient">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-red-700">
          Book an Appointment
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Select Specialty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => setSelectedCategory("all")}
                className={`${
                  selectedCategory === "all" ? "bg-red-700" : "bg-gray-500"
                }`}
              >
                All Specialties
              </Button>
              {doctorCategories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${
                    selectedCategory === category.id ? "bg-red-700" : "bg-gray-500"
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredDoctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className={`cursor-pointer ${
                    selectedDoctor?.id === doctor.id
                      ? "border-2 border-red-700"
                      : ""
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{doctor.name}</h3>
                    <p className="text-gray-600">{doctor.designation}</p>
                    <p className="text-gray-600">{doctor.education}</p>
                    <p className="text-gray-600">Experience: {doctor.experience}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Weekly Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day) => (
                <div key={day} className="text-center">
                  <div className="font-bold mb-2">{day}</div>
                  <div className="grid grid-rows-5 gap-2">
                    {availableSlots[day] && availableSlots[day].map((slot, index) => (
                      <Button
                        key={`${day}-${slot.time}`}
                        onClick={() => handleSlotSelection(day, slot.time)}
                        className={`w-full ${
                          slot.booked
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-700 hover:bg-green-800'
                        } text-white p-2 transition-all duration-200 ease-in-out group`}
                        disabled={slot.booked}
                      >
                        <span className="block group-hover:hidden">
                          {slot.time}
                        </span>
                        <span className="hidden group-hover:block">
                          {slot.booked ? 'Booked' : 'Book'}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <HumeAISection />

        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Appointment</DialogTitle>
              <DialogDescription>
                {selectedDoctor && selectedSlot && (
                  <div className="py-4">
                    <p className="mb-2">
                      <strong>Doctor:</strong> {selectedDoctor.name}
                    </p>
                    <p className="mb-2">
                      <strong>Specialty:</strong> {selectedDoctor.designation}
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
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmBooking}>
                Confirm Booking & Pay
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default DoctorsPage;