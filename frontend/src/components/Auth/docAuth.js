// src/components/DoctorAuth.js
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import { ref, set } from "firebase/database";
import { get } from "firebase/database";
import Layout from "../Layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card";
import { Button } from "../Button/Button";
import { useNavigate } from "react-router-dom";

const DoctorAuth = () => {
  const [isSignup, setIsSignup] = useState(true); // Toggle between Login and Signup
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    hospital: "",
    specialty: "",
    sex: "",
    dateOfBirth: "",
    phone: "",
    address: { street: "", state: "", zip: "" },
  });

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        address: { ...prevData.address, [addressField]: value },
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // Register doctor in the database
  const registerDoctor = async (userId, doctorData) => {
    try {
      await set(ref(db, `users/doctors/${userId}`), {
        ...doctorData,
        role: "doctor",
      });
      console.log("Doctor data saved successfully.");
    } catch (error) {
      console.error("Error saving doctor data:", error);
    }
  };

  // Handle signup or login
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        // Signup logic
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const userId = userCredential.user.uid;

        const doctorData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          hospital: formData.hospital,
          specialty: formData.specialty,
          sex: formData.sex,
          dateOfBirth: formData.dateOfBirth,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          role: "doctor",
        };

        // Save to database and localStorage
        await registerDoctor(userId, doctorData);
        localStorage.setItem("doctorId", userId);
        navigate("/doctor/setup-availability");
      } else {
        // Login logic
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const userId = userCredential.user.uid;

        // Verify doctor role in the database
        const dbRef = ref(db, `users/doctors/${userId}`);
        const snapshot = await get(dbRef);

        if (snapshot.exists() && snapshot.val().role === "doctor") {
          localStorage.setItem("doctorId", userId);
          navigate("/doctor/dashboard");
        } else {
          alert("This account is not registered as a doctor.");
          throw new Error("Invalid doctor login.");
        }
      }
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message); // Display error message
    }
  };

  // Google authentication
  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      const userId = userCredential.user.uid;
      const displayName = userCredential.user.displayName || "";
      const [firstName, ...lastNameArr] = displayName.split(" ");
      const lastName = lastNameArr.join(" ");

      const doctorData = {
        firstName: firstName || "",
        lastName: lastName || "",
        email: userCredential.user.email || "",
        role: "doctor",
      };

      await registerDoctor(userId, doctorData);
      localStorage.setItem("doctorId", userId);
      navigate("/doctor/setup-availability");
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold text-red-700">
              {isSignup ? "Doctor Signup" : "Doctor Login"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleAuth}>
              {isSignup && (
                <>
                  <div className="flex space-x-4">
                    <input
                      name="firstName"
                      placeholder="First Name"
                      className="border p-2 w-full"
                      onChange={handleChange}
                      value={formData.firstName}
                      required
                    />
                    <input
                      name="lastName"
                      placeholder="Last Name"
                      className="border p-2 w-full"
                      onChange={handleChange}
                      value={formData.lastName}
                      required
                    />
                  </div>
                  <input
                    name="hospital"
                    placeholder="Hospital Name"
                    className="border p-2 w-full"
                    onChange={handleChange}
                    value={formData.hospital}
                    required
                  />
                  <input
                    name="specialty"
                    placeholder="Specialty"
                    className="border p-2 w-full"
                    onChange={handleChange}
                    value={formData.specialty}
                    required
                  />
                  <div className="flex space-x-4">
                    <select
                      name="sex"
                      className="border p-2 w-full"
                      onChange={handleChange}
                      value={formData.sex}
                      required
                    >
                      <option value="">Select Sex</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      name="dateOfBirth"
                      type="date"
                      className="border p-2 w-full"
                      onChange={handleChange}
                      value={formData.dateOfBirth}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <input
                      name="address.street"
                      placeholder="Street Name"
                      className="border p-2 w-full"
                      onChange={handleChange}
                      value={formData.address.street}
                      required
                    />
                    <div className="flex space-x-4">
                      <select
                        name="address.state"
                        className="border p-2 w-full"
                        onChange={handleChange}
                        value={formData.address.state}
                        required
                      >
                        <option value="">Select State</option>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="AZ">Arizona</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="CT">Connecticut</option>
                        <option value="DE">Delaware</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                        <option value="HI">Hawaii</option>
                        <option value="ID">Idaho</option>
                        <option value="IL">Illinois</option>
                        <option value="IN">Indiana</option>
                        <option value="IA">Iowa</option>
                        <option value="KS">Kansas</option>
                        <option value="KY">Kentucky</option>
                        <option value="LA">Louisiana</option>
                        <option value="ME">Maine</option>
                        <option value="MD">Maryland</option>
                        <option value="MA">Massachusetts</option>
                        <option value="MI">Michigan</option>
                        <option value="MN">Minnesota</option>
                        <option value="MS">Mississippi</option>
                        <option value="MO">Missouri</option>
                        <option value="MT">Montana</option>
                        <option value="NE">Nebraska</option>
                        <option value="NV">Nevada</option>
                        <option value="NH">New Hampshire</option>
                        <option value="NJ">New Jersey</option>
                        <option value="NM">New Mexico</option>
                        <option value="NY">New York</option>
                        <option value="NC">North Carolina</option>
                        <option value="ND">North Dakota</option>
                        <option value="OH">Ohio</option>
                        <option value="OK">Oklahoma</option>
                        <option value="OR">Oregon</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="RI">Rhode Island</option>
                        <option value="SC">South Carolina</option>
                        <option value="SD">South Dakota</option>
                        <option value="TN">Tennessee</option>
                        <option value="TX">Texas</option>
                        <option value="UT">Utah</option>
                        <option value="VT">Vermont</option>
                        <option value="VA">Virginia</option>
                        <option value="WA">Washington</option>
                        <option value="WV">West Virginia</option>
                        <option value="WI">Wisconsin</option>
                        <option value="WY">Wyoming</option>
                      </select>
                      <input
                        name="address.zip"
                        placeholder="Zip Code"
                        className="border p-2 w-full"
                        onChange={handleChange}
                        value={formData.address.zip}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="border p-2 w-full"
                onChange={handleChange}
                value={formData.email}
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="border p-2 w-full"
                onChange={handleChange}
                value={formData.password}
                required
              />
              <Button
                type="submit"
                size="lg"
                className="bg-red-700 hover:bg-red-800 text-white w-full"
              >
                {isSignup ? "Sign Up" : "Log In"}
              </Button>
              <Button
                type="button"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                onClick={handleGoogleAuth}
              >
                Continue with Google
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={() => setIsSignup(!isSignup)}
                className="text-center text-sm text-gray-600 mt-2"
              >
                {isSignup
                  ? "Already have an account? Log In"
                  : "Don't have an account? Sign Up"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DoctorAuth;