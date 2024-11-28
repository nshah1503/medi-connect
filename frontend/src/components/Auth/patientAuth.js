// src/components/PatientAuth.js
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../../firebase"; // Import auth and db from firebase.js
import { ref, set } from "firebase/database"; // Import ref and set from firebase/database
import Layout from "../Layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card";
import { Button } from "../Button/Button";
import { useNavigate } from "react-router-dom";
import { get, child } from "firebase/database";


const PatientAuth = () => {
  const [isSignup, setIsSignup] = useState(true); // Toggle between Login and Signup
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    sex: "",
    dateOfBirth: "",
    phone: "",
    address: { street: "", state: "", zip: "" },
    insurance: "",
    otherInsurance: "", // For manual entry of "Other" insurance
  });

  const [isOtherInsurance, setIsOtherInsurance] = useState(false); // Track if "Other" is selected

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested address updates and otherInsurance logic
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else if (name === "insurance" && value === "Other") {
      setIsOtherInsurance(true);
      setFormData((prev) => ({ ...prev, insurance: value, otherInsurance: "" }));
    } else if (name === "insurance") {
      setIsOtherInsurance(false);
      setFormData((prev) => ({ ...prev, insurance: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const registerPatient = async (userId, patientData) => {
    try {
      await set(ref(db, `users/patients/${userId}`), {
        ...patientData,
        role: "patient", // Add the role explicitly
      });
      console.log("Patient data saved successfully.");
    } catch (error) {
      console.error("Error saving patient data:", error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    try {
      if (isSignup) {
        // Sign up user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const userId = userCredential.user.uid;
  
        // Prepare patient data
        const patientData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          sex: formData.sex,
          dateOfBirth: formData.dateOfBirth,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          insurance: isOtherInsurance ? formData.otherInsurance : formData.insurance,
          role: "patient", // Assign role explicitly
        };
  
        // Save data to database
        await registerPatient(userId, patientData);
        navigate("/patient/dashboard"); // Redirect to patient dashboard
      } else {
        // Log in user
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const userId = userCredential.user.uid;
  
        // Verify the role from the database
        const dbRef = ref(db, `users/patients/${userId}`);
        const snapshot = await get(dbRef);
  
        if (snapshot.exists() && snapshot.val().role === "patient") {
          navigate("/patient/dashboard"); // Redirect to patient dashboard
        } else {
          alert("This account is not registered as a patient.");
          throw new Error("Invalid patient login.");
        }
      }
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message); // Optionally keep error alerts
    }
  };
  

  const handleGoogleAuth = async (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      const userId = userCredential.user.uid;
      const displayName = userCredential.user.displayName || "";
      const [firstName, ...lastNameArr] = displayName.split(" ");
      const lastName = lastNameArr.join(" ");

      const patientData = {
        firstName: firstName || "",
        lastName: lastName || "",
        email: userCredential.user.email || "",
        // Add other default fields if necessary
      };

      await registerPatient(userId, patientData);
      navigate("/patient/dashboard"); // Redirect to patient dashboard
    } catch (error) {
      console.error("Error:", error);
      alert(error.code || error.message); // Optionally keep error alerts
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold text-red-700">
              {isSignup ? "Patient Signup" : "Patient Login"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Form for Input Fields */}
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
                  <div className="flex space-x-4">
                    <input
                      name="phone"
                      placeholder="Phone Number"
                      className="border p-2 w-full"
                      onChange={handleChange}
                      value={formData.phone}
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
                  <div className="space-y-2">
                    <select
                      name="insurance"
                      className="border p-2 w-full"
                      onChange={handleChange}
                      value={formData.insurance}
                      required
                    >
                      <option value="">Select Insurance Provider</option>
                      <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
                      <option value="UnitedHealthcare">UnitedHealthcare</option>
                      <option value="Kaiser Permanente">Kaiser Permanente</option>
                      <option value="Aetna">Aetna</option>
                      <option value="Cigna">Cigna</option>
                      <option value="Humana">Humana</option>
                      <option value="Centene">Centene</option>
                      <option value="Molina Healthcare">Molina Healthcare</option>
                      <option value="Anthem">Anthem</option>
                      <option value="WellCare">WellCare</option>
                      <option value="Other">Other</option>
                    </select>
                    {isOtherInsurance && (
                      <input
                        name="otherInsurance"
                        placeholder="Enter Insurance Provider"
                        className="border p-2 w-full"
                        onChange={handleChange}
                        value={formData.otherInsurance}
                        required
                      />
                    )}
                  </div>
                </>
              )}
              <div className="space-y-2">
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
              </div>
              <div className="flex flex-col space-y-2 mt-4">
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
                <p className="mt-4 text-center">
                  {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignup(!isSignup)}
                    className="text-red-700 underline"
                  >
                    {isSignup ? "Log In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PatientAuth;
