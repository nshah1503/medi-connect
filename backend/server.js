const express = require("express");
const http = require("http");
const https = require("https");
const socketIo = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-adminsdk.json");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const { Datastore } = require('@google-cloud/datastore');
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const apiKey = process.env.DAILY_API_KEY;
const humeapiKey = process.env.HUME_API_KEY;
const humeAPIEndpoint = process.env.HUME_API_ENDPOINT;


// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "doctalk-9e28b.appspot.com",
  //databaseURL: "https://insurancehospitals.firebaseio.com/"
  databaseURL: "https://mediconnect.firebaseio.com/"
});

const bucket = admin.storage().bucket();

const db = admin.database();

const datastore = new Datastore({
  projectId: "doctalk-9e28b", // Replace with your project ID
  keyFilename: "./firebase-adminsdk.json", // Path to your se
});

// Function to check Firebase connection
async function checkFirebaseConnection() {
  try {
    await bucket.exists();
    console.log("Successfully connected to Firebase Storage");
    return true;
  } catch (error) {
    console.error("Failed to connect to Firebase Storage:", error);
    return false;
  }
}

// Use this function in your server startup
checkFirebaseConnection().then((isConnected) => {
  if (isConnected) {
    // Start your server or proceed with other initializations
    console.log("Server is ready to use Firebase Storage");
  } else {
    console.log("Please check your Firebase configuration");
  }
});

async function setupFolders() {
  const folders = ["audio_recordings", "pdfs"];

  for (const folder of folders) {
    try {
      // Check if folder exists
      const [files] = await bucket.getFiles({ prefix: `${folder}/` });

      if (files.length === 0) {
        // If folder doesn't exist, create an empty file to establish the folder
        await bucket.file(`${folder}/.placeholder`).save("");
        console.log(`Created folder: ${folder}`);
      } else {
        console.log(`Folder already exists: ${folder}`);
      }
    } catch (error) {
      console.error(`Error setting up folder ${folder}:`, error);
    }
  }
}

// Call this function during your server initialization
setupFolders();

// Set up multer for handling file uploads
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

// Helper function to generate a unique filename
const generateUniqueFilename = (originalName, prefix) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  return `${prefix}_${timestamp}_${randomString}.${extension}`;
};

app.post("/save-audio", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    console.log("No file received in the request");
    return res.status(400).send("No file uploaded.");
  }

  const file = req.file;
  const fileName = generateUniqueFilename(file.originalname, "audio");
  const filePath = `audio_recordings/${fileName}`;

  console.log(`Attempting to upload file: ${filePath}`);

  const fileUpload = bucket.file(filePath);

  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  blobStream.on("error", (error) => {
    console.error("Error uploading to Firebase:", error);
    res.status(500).send("An error occurred during file upload.");
  });

  blobStream.on("finish", () => {
    console.log(`File uploaded successfully: ${filePath}`);
    res.status(200).json({
      message: "File uploaded successfully to Firebase",
      fileName: filePath,
    });
  });

  blobStream.end(file.buffer);
});

// Add a new route to handle other file uploads
app.post("/save-file", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const file = req.file;
  const fileName = generateUniqueFilename(file.originalname, "file");
  const filePath = `pdfs/${fileName}`;

  const fileUpload = bucket.file(filePath);

  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  blobStream.on("error", (error) => {
    console.error("Error uploading to Firebase:", error);
    res.status(500).send("An error occurred during file upload.");
  });

  blobStream.on("finish", () => {
    res.status(200).json({
      message: "File uploaded successfully to Firebase",
      fileName: filePath,
    });
  });

  blobStream.end(file.buffer);
});

const PORT = process.env.PORT || 4000;

let doctorSocket = null;
let patientSocket = null;

io.on("connection", (socket) => {
  socket.on("request_id", (role) => {
    if (role === "doctor") {
      if (doctorSocket) {
        socket.emit("error", "A doctor is already connected");
        return;
      }
      doctorSocket = socket;
      socket.emit("assigned_id", "doctor");
    } else if (role === "patient") {
      if (patientSocket) {
        socket.emit("error", "A patient is already connected");
        return;
      }
      patientSocket = socket;
      socket.emit("assigned_id", "patient");
    } else {
      socket.emit("error", "Invalid role");
    }
  });

  socket.on("disconnect", () => {
    if (socket === doctorSocket) {
      doctorSocket = null;
    } else if (socket === patientSocket) {
      patientSocket = null;
    }
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    const targetSocket = userToCall === "doctor" ? doctorSocket : patientSocket;
    if (targetSocket) {
      targetSocket.emit("callUser", { signal: signalData, from, name });
    }
  });

  socket.on("answerCall", (data) => {
    const targetSocket = data.to === "doctor" ? doctorSocket : patientSocket;
    if (targetSocket) {
      targetSocket.emit("callAccepted", data.signal);
    }
  });
});

const recordingsDir = path.join(__dirname, "recordings");

if (!fs.existsSync(recordingsDir)) {
  try {
    fs.mkdirSync(recordingsDir, { recursive: true });
  } catch (err) {
    process.exit(1);
  }
}

try {
  fs.accessSync(recordingsDir, fs.constants.W_OK);
} catch (err) {
  process.exit(1);
}

const checkRecordingStatus = async (recordingId) => {
  try {
    const response = await axios.get(
      `https://api.daily.co/v1/recordings/${recordingId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return (
      response.data.status === "finished" ||
      response.data.status === "completed"
    );
  } catch (error) {
    return false;
  }
};

const getDownloadLink = async (recordingId) => {
  for (let i = 0; i < 5; i++) {
    try {
      const downloadLinkResponse = await axios.get(
        `https://api.daily.co/v1/recordings/${recordingId}/access-link`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return downloadLinkResponse.data.download_link;
    } catch (error) {
      if (i < 4) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  throw new Error(
    `Failed to get download link for recording ${recordingId} after 5 attempts`
  );
};

const downloadFile = (url, filePath) => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
          return;
        }

        response.pipe(fileStream);

        fileStream.on("error", (err) => {
          fileStream.close();
          reject(err);
        });

        fileStream.on("finish", () => {
          fileStream.close();
          resolve(filePath);
        });
      })
      .on("error", (err) => {
        fileStream.close();
        reject(err);
      });
  });
};

app.get("/api/check-call-and-recording", async (req, res) => {
  if (!apiKey) {
    return res.status(500).json({ error: "API key is not configured" });
  }

  try {
    const sessionsResponse = await axios.get(
      "https://api.daily.co/v1/meetings",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        params: {
          room: "doc-talk",
        },
      }
    );

    const activeSessions = sessionsResponse.data.data.filter(
      (session) => session.ongoing
    );
    const callEnded = activeSessions.length === 0;

    let recordingReady = false;
    let downloadedFilePath = null;
    let processingResult = null;

    if (callEnded) {
      const recordingsResponse = await axios.get(
        "https://api.daily.co/v1/recordings",
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          params: {
            room_name: "doc-talk",
            limit: 10,
          },
        }
      );

      const sortedRecordings = recordingsResponse.data.data.sort(
        (a, b) => b.start_ts - a.start_ts
      );
      const latestRecording = sortedRecordings[0];

      if (latestRecording) {
        recordingReady = await checkRecordingStatus(latestRecording.id);
        if (recordingReady) {
          try {
            const downloadLink = await getDownloadLink(latestRecording.id);
            const fileName = `recording_${latestRecording.id}.mp4`;
            const filePath = path.join(recordingsDir, fileName);
            await downloadFile(downloadLink, filePath);
            downloadedFilePath = filePath;

            // Send the file to the Flask server
            console.log("Sending file to Flask server");
            processingResult = await sendFileToFlaskServer(filePath);
          } catch (error) {
            console.error("Error processing audio:", error);
            return res.status(500).json({
              error: "Failed to process audio file",
              details: error.message,
            });
          }
        }
      }
    }

    res.json({
      callEnded,
      recordingReady,
      downloadedFilePath: downloadedFilePath
        ? path.basename(downloadedFilePath)
        : null,
      processingResult,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to check call and recording status",
      details: error.message,
    });
  }
});

app.post('/hume-ai', async (req, res) => {
  try {
    // const apiKey = process.env.HUME_API_KEY; // Use backend environment variables
    // const endpoint = process.env.HUME_API_ENDPOINT;

    const response = await axios.post(humeAPIEndpoint, req.body, {
      headers: { Authorization: `Bearer ${humeapiKey}`, 'Content-Type': 'application/json' },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/empanelhospital', async (req, res) => {
  const {
    hospitalName,
    rohiniId,
    hospitalAddress,
    pinCode,
    contactPersonName,
    contactPersonEmail,
    contactPersonPhone,
  } = req.body;

  // Basic validation (optional but recommended)
  if (!hospitalName || !hospitalAddress || !pinCode) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  // Structure the hospital data
  const hospitalData = {
    hospitalName,
    rohiniId: rohiniId || null,
    hospitalAddress,
    pinCode,
    contactPersonName,
    contactPersonEmail,
    contactPersonPhone,
    createdAt: admin.firestore.FieldValue.serverTimestamp(), // Alternatively, use Date.now()
  };

  try {
    // Generate a new unique key under 'insurancehospitals/hospitals'
    const hospitalsRef = db.ref('insurancehospitals/hospitals');
    const newHospitalRef = hospitalsRef.push(); // Creates a unique key
    await newHospitalRef.set(hospitalData);

    res.status(200).json({ message: 'Hospital data successfully stored.', id: newHospitalRef.key });
  } catch (error) {
    console.error('Error storing hospital data:', error);
    res.status(500).json({ message: 'Failed to store hospital data.' });
  }
});


// API Endpoint to Fetch Patient Data
// server.js (continued)

// GET Route: Fetch Patient Data
app.get('/patients/:id', async (req, res) => {
  const patientId = req.params.id;

  try {
    // Correct path reference
    const patientRef = db.ref(`users/patients/${patientId}`);

    // Fetch data
    const snapshot = await patientRef.once('value');

    const data = snapshot.val();
    if (!data) {
      return res.status(404).json({ message: 'Patient data not found.' });
    }

    // Construct response
    const responseObject = {
      id: patientId,
      firstName: data.firstName,
      lastName: data.lastName,
      prescriptions: data.prescriptions || "No prescriptions available.",
      upcomingAppointments: data.upcomingAppointments || "No appointments scheduled.",
      upcomingTests: data.upcomingTests || "No upcoming tests scheduled."
    };

    res.status(200).json(responseObject);
  } catch (error) {
    console.error('Error fetching patient data:', error);
    res.status(500).json({ message: 'Failed to fetch patient data.' });
  }
});

async function sendFileToFlaskServer(filePath) {
  const form = new FormData();
  form.append("audio", fs.createReadStream(filePath));

  try {
    const response = await axios.post(
      "http://localhost:5000/process_transcription",
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending file to Flask server:", error);
    throw error;
  }
}



app.get("/fetch-bookings/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const userRef = db.ref(`users/patients/${userId}`);
    const snapshot = await userRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No bookings found for this user." });
    }

    const bookings = Object.entries(snapshot.val()).map(([id, details]) => ({
      id,
      ...details,
    }));

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings.", error });
  }
});

app.get("/specialties", async (req, res) => {
  try {
    const doctorsRef = db.ref("users/doctors");

    const snapshot = await doctorsRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No doctors found." });
    }

    const doctors = snapshot.val();

    const specialties = new Set(Object.values(doctors).map((doctor) => doctor.specialty));

    res.status(200).json([...specialties]); // Convert Set to Array
  } catch (error) {
    res.status(500).json({ message: "Error fetching specialties." });
  }
});


app.get("/doctors", async (req, res) => {
  const { category } = req.query; // Example: /doctors?category=cardiology

  try {
    const doctorsRef = db.ref("users/doctors");
    const snapshot = await doctorsRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No doctors found." });
    }

    const doctors = snapshot.val();
    const filteredDoctors = category
      ? Object.values(doctors).filter((doctor) => doctor.specialty === category)
      : Object.values(doctors); // Return all if no category provided

    res.status(200).json(filteredDoctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Error fetching doctors." });
  }
});

app.get("/availability/:doctorId", async (req, res) => {
  const { doctorId } = req.params;

  try {
    const availabilityRef = db.ref(`users/doctors/${doctorId}/availability`);
    const snapshot = await availabilityRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No availability found for this doctor." });
    }

    const availability = snapshot.val();
    res.status(200).json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ message: "Error fetching availability." });
  }
});

app.get("/doctors-by-specialty", async (req, res) => {
  try {
    const { specialty } = req.query;

    // Validate the specialty query parameter
    if (!specialty) {
      return res.status(400).json({ message: "Specialty is required." });
    }

    // Reference the doctors node in Firebase
    const doctorsRef = db.ref("users/doctors");
    const snapshot = await doctorsRef.once("value");

    // If no data is found, return a 404
    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No doctors found in the database." });
    }

    const doctors = snapshot.val();

    // Filter doctors by the specialty field
    const filteredDoctors = Object.keys(doctors)
      .map((key) => ({
        doctorId: key,
        ...doctors[key],
      }))
      .filter((doctor) => {
        return doctor.specialty === specialty;
      });

    // If no doctors match the specialty, return a 404
    if (filteredDoctors.length === 0) {
      return res.status(404).json({ message: "No doctors found for this specialty." });
    }

    // Return the filtered doctors
    res.status(200).json(filteredDoctors);
  } catch (error) {
    console.error("Error fetching doctors by specialty:", error);
    res.status(500).json({ message: "Error fetching doctors by specialty." });
  }
});


// Mark a time slot as booked
app.post("/book", async (req, res) => {
  const { doctorId, date, time } = req.body;

  try {
    const slotRef = db.ref(`doctors/${doctorId}/availability/${date}/${time}`);
    await slotRef.set(false); // Mark the slot as unavailable

    res.status(200).json({ message: "Booking successful!" });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ message: "Error booking slot." });
  }
});


app.post("/book-and-store", async (req, res) => {
  const {
    doctorId,
    userId,
    doctorName,
    speciality,
    date,
    time,
    paymentDetails,
  } = req.body;

  // Validate input
  if (!doctorId || !userId || !doctorName || !speciality || !date || !time || !paymentDetails) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Step 1: Mark the doctor's time slot as unavailable
    const slotRef = db.ref(`user/doctors/${doctorId}/availability/${date}/${time}`);
    await slotRef.set(false); // Mark the slot as unavailable

    // Step 2: Store the booking data
    const appointmentId = `appointment_${Date.now()}`;
    const bookingData = {
      userId,
      doctorName,
      speciality,
      date,
      time,
      payment: paymentDetails,
    };

    // Store in user-specific node
    const appointmentRef = db.ref(`${userId}/${appointmentId}`);
    await appointmentRef.set(bookingData);

    // Respond with success
    res.status(200).json({
      message: "Booking confirmed and data stored successfully.",
      appointmentId,
    });
  } catch (error) {
    console.error("Error during booking process:", error);
    res.status(500).json({ message: "Error processing booking.", error });
  }
});


app.post("/create-payment-intent", async (req, res) => {
  const Stripe = require('stripe');
  const stripe = Stripe('sk_test_51QOEgjH9ehGELQwr2jk71FWQ6IdRNH82iI9k3QmwSQCHgltrTy750Mc9C2UbHl9x5QGunaFOymS4biULT6F4zGRY00svp2VhYP');

  const { amount, bookingData } = req.body;

  try {
    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store booking and update availability after payment confirmation
    paymentIntent.metadata = { ...bookingData };

    // Return client secret and booking data for client-side confirmation
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      bookingData,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Failed to create payment intent.", error });
  }
});

// Store booking data and update doctor availability after payment confirmation
app.post("/confirm-payment", async (req, res) => {
  const Stripe = require('stripe');
  const stripe = Stripe('sk_test_51QOEgjH9ehGELQwr2jk71FWQ6IdRNH82iI9k3QmwSQCHgltrTy750Mc9C2UbHl9x5QGunaFOymS4biULT6F4zGRY00svp2VhYP');
  const { paymentIntentId, bookingData } = req.body;

  try {
    // Confirm payment
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Store booking in patients table
      const { patientId, doctorId, doctorName, specialty, date, time, consultationFee } = bookingData;

      // Store in patients table
      const patientBookingRef = db.ref(`users/patients/${patientId}/appointments`);
      const newBookingRef = patientBookingRef.push();
      await newBookingRef.set({
        doctorId,
        doctorName,
        specialty,
        date,
        time,
        consultationFee,
        status: "Confirmed",
      });

      // Update availability in doctors table
      const availabilityRef = db.ref(`users/doctors/${doctorId}/availability/${date}/${time}`);
      await availabilityRef.set(false); // Mark slot as unavailable

      res.status(200).json({ message: "Payment and booking successful." });
    } else {
      res.status(400).json({ message: "Payment not confirmed." });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ message: "Error processing payment confirmation.", error });
  }
});


app.get("/current-patient", async (req, res) => {
  try {
    // Extract the patientId from the headers
    const patientId = req.headers["patient-id"]; // Ensure the frontend sends this header
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is missing." });
    }

    // Query the patients table using the patientId
    const patientRef = db.ref(`users/patients/${patientId}`);
    const snapshot = await patientRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Return the patient data
    const patientData = snapshot.val();
    res.status(200).json({ patientId, ...patientData });
  } catch (error) {
    console.error("Error fetching current patient:", error);
    res.status(500).json({ message: "Failed to fetch current patient." });
  }
});


// Test Endpoint to Fetch All Patients (Optional Debugging Tool)
app.get("/all-patients", async (req, res) => {
  try {
    const snapshot = await db.ref("users/patients").once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No patients found." });
    }
    res.status(200).json(snapshot.val());
  } catch (error) {
    console.error("Error fetching all patients:", error.message);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
});


const { v4: uuidv4 } = require('uuid');
app.post('/create-appointment', async (req, res) => {
  const { patientId, doctorId, date, time, status = 'confirmed' } = req.body;

  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const appointmentId = `appointment_${uuidv4()}`;
    const appointmentRef = db.ref(`users/appointments/${appointmentId}`);

    const appointmentData = {
      appointmentId,
      patientId,
      doctorId,
      date,
      time,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await appointmentRef.set(appointmentData);

    // Update availability in the doctors table
    const slotRef = db.ref(`users/doctors/${doctorId}/availability/${date}/${time}`);
    await slotRef.set(false); // Mark the slot as unavailable

    res.status(200).json({ message: 'Appointment created successfully.', appointmentId });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment.' });
  }
});


app.get("/appointments/doctor/:doctorId/date/:date", async (req, res) => {
  const { doctorId, date } = req.params;

  try {
    // Fetch appointments for the doctor
    const appointmentsSnapshot = await db
      .ref("users/appointments")
      .orderByChild("doctorId")
      .equalTo(doctorId)
      .once("value");

    if (!appointmentsSnapshot.exists()) {
      return res.status(404).json({ appointments: [] });
    }

    const appointments = Object.values(appointmentsSnapshot.val()).filter(
      (appointment) => appointment.date === date
    );

    // Fetch patient details for each appointment
    const enhancedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        try {
          const patientSnapshot = await db
            .ref(`users/patients/${appointment.patientId}`)
            .once("value");

          if (patientSnapshot.exists()) {
            const patientData = patientSnapshot.val();
            return {
              ...appointment,
              patientName: `${patientData.firstName} ${patientData.lastName}`, // Add patient's name
            };
          }

          return { ...appointment, patientName: "Unknown Patient" }; // Fallback if patient data is missing
        } catch (err) {
          console.error("Error fetching patient data:", err);
          return { ...appointment, patientName: "Unknown Patient" }; // Fallback if an error occurs
        }
      })
    );

    res.status(200).json({ appointments: enhancedAppointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

app.post("/doctor/setup", async (req, res) => {
  const { doctorId, consultationFee, availability } = req.body;

  if (!doctorId || !consultationFee || !availability) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Reference to the doctor's setup in the database
    const doctorSetupRef = db.ref(`users/doctors/${doctorId}`);

    // Data to be saved
    const setupData = {
      consultationFee: parseFloat(consultationFee),
      availability,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save setup details
    await doctorSetupRef.set(setupData); // Overwrites the `setup` field with new data

    res.status(200).json({
      message: "Doctor setup saved successfully.",
    });
  } catch (error) {
    console.error("Error saving doctor setup:", error);
    res.status(500).json({
      error: "Failed to save doctor setup.",
    });
  }
});


app.get('/appointments/patient/:patientId', async (req, res) => {
  const { patientId } = req.params;

  try {
    const appointmentsSnapshot = await db
      .ref('users/appointments')
      .orderByChild('patientId')
      .equalTo(patientId)
      .once('value');

    if (!appointmentsSnapshot.exists()) {
      return res.status(200).json({ message: 'No appointments found.', appointments: [] });
    }

    const appointments = appointmentsSnapshot.val();
    const appointmentList = await Promise.all(
      Object.values(appointments).map(async (appointment) => {
        // Fetch doctor details
        const doctorSnapshot = await db
          .ref(`users/doctors/${appointment.doctorId}`)
          .once('value');

        if (!doctorSnapshot.exists()) {
          console.warn(`Doctor with ID ${appointment.doctorId} not found.`);
          return { ...appointment, doctorName: 'Unknown', specialty: 'Unknown' };
        }

        const doctorData = doctorSnapshot.val();

        // Combine doctor details with appointment
        return {
          ...appointment,
          doctorName: `${doctorData.firstName} ${doctorData.lastName}`,
          specialty: doctorData.specialty,
        };
      })
    );

    res.status(200).json({ appointments: appointmentList });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
});


server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
