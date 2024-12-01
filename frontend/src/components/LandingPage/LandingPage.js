import React, { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../Layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card.js";
import { Button } from "../Button/Button.js";
import { Clock, Smartphone, Database, MapPin } from "lucide-react";
import { motion, useAnimation } from "framer-motion"; // Import useAnimation
import testimonialsData from "../../data/testimonials"; // Assuming you have a testimonials data file

const LandingPage = () => {
  const { userType } = useParams();

  // Refs for the "I am a Doctor" and "I am a Patient" buttons
  const doctorButtonRef = useRef(null);
  const patientButtonRef = useRef(null);

  // Animation controls for the buttons
  const doctorButtonControls = useAnimation();
  const patientButtonControls = useAnimation();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Function to handle "Get Started Now" click
  const handleGetStartedClick = () => {
    // Scroll to the top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Trigger subtle zoom animation on the doctor and patient buttons
    if (doctorButtonRef.current && patientButtonRef.current) {
      doctorButtonControls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.6 },
      });
      patientButtonControls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.6 },
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2 },
    }),
  };

  // Refined button variants for smoother animation
  const refinedButtonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.7)",
      transition: {
        duration: 0.3,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <Layout userType={userType}>
      {/* Main navigation */}
      <motion.div
        className="bg-gray-100 py-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-6">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-red-700"
              onClick={() => scrollToSection("features")}
            >
              Features
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-red-700"
              onClick={() => scrollToSection("how-it-works")}
            >
              How It Works
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-red-700"
              onClick={() => scrollToSection("pricing")}
            >
              Pricing
            </Button>
          </div>
          <motion.button
            whileHover="hover"
            variants={refinedButtonVariants}
            className="bg-red-700 hover:bg-red-800 text-white flex items-center px-4 py-2 rounded"
            onClick={handleGetStartedClick} // Attach the click handler
          >
            <MapPin className="mr-2 h-5 w-5" />
            Get Started
          </motion.button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.section
        className="py-12 bg-gray-100"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto flex flex-col-reverse md:flex-row items-center">
          <motion.div
            className="w-full md:w-1/2 pr-8"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-4xl font-bold mb-4 text-red-700">
              Streamline Healthcare with AI
            </h1>
            <p className="text-xl mb-8">
              Our AI assistant automates consultations, diagnoses, and appointments—saving time and improving patient care for doctors. Patients can connect with top doctors and receive care from the comfort of their home.
            </p>
            <div className="flex space-x-4">
              <motion.button
                ref={doctorButtonRef}
                animate={doctorButtonControls}
                className="bg-red-700 hover:bg-red-800 text-white flex items-center px-4 py-2 rounded"
              >
                <Link to="/doctor/auth">I am a Doctor</Link>
              </motion.button>
              <motion.button
                ref={patientButtonRef}
                animate={patientButtonControls}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center px-4 py-2 rounded"
              >
                <Link to="/patient/auth">I am a Patient</Link>
              </motion.button>
            </div>
          </motion.div>
          <motion.div
            className="w-full md:w-1/2 mb-8 md:mb-0"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <img
              src={"/resources/landing-pic.jpg"}
              alt="Medical consultation"
              className="rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Why This Application Section */}
      <section id="features" className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Why Mediconnect?
          </h2>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Save Time for Doctors", "Improve Patient Care", "Centralized Medical Information"].map((title, index) => (
              <motion.div
                key={title}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {index === 0 && <Clock className="mr-2 h-6 w-6 text-red-700" />}
                      {index === 1 && <Smartphone className="mr-2 h-6 w-6 text-red-700" />}
                      {index === 2 && <Database className="mr-2 h-6 w-6 text-red-700" />}
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {index === 0 && "Current methods of documenting doctor-patient interactions take hours, sometimes a full day, due to offshore transcriptions. Our real-time AI assistant cuts that time down to minutes, freeing up doctors to focus on patient care instead of paperwork."}
                    {index === 1 && "With more time to spend with patients, doctors can see more individuals, especially in emergency cases where delays are common. Faster treatment, better care, and quicker access to prescriptions all lead to an improved patient experience."}
                    {index === 2 && "All patient details, including histories, notes, and prescriptions, are stored in one place for easy access. No more hunting for files or waiting for summaries—everything is at your fingertips in real-time."}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How to Use Section */}
      <section id="how-it-works" className="py-12 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            How to Use Mediconnect?
          </h2>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Start the Consultation", "Automatic Summarization", "Review and Confirm"].map((step, index) => (
              <motion.div
                key={step}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{index + 1}. {step}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {index === 0 && "Simply begin the patient consultation. Our platform records the interaction and captures key medical details automatically."}
                    {index === 1 && "Once the meeting concludes, the AI instantly generates a summary of the conversation, along with prescriptions and follow-up details. No manual intervention required."}
                    {index === 2 && "The doctor quickly reviews the AI-generated details for accuracy, then approves or makes minor edits. The final report is sent to the patient instantly."}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Pricing</h2>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Basic Plan",
                price: "$49/month",
                features: ["Real-time summaries", "Basic appointment scheduling", "Secure data storage"],
              },
              {
                title: "Pro Plan",
                price: "$99/month",
                features: ["All Basic features", "Multi-doctor support", "Advanced analytics & patient management"],
              },
              {
                title: "Enterprise Plan",
                price: "Custom Pricing",
                features: ["Unlimited usage and features", "Custom integrations with your existing systems", "Priority support & enhanced security features"],
              },
            ].map((plan, index) => (
              <motion.div
                key={plan.title}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{plan.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold mb-4 text-red-700">
                      {plan.price}
                    </p>
                    <p className="mb-4">
                      Best for {plan.title === "Basic Plan" ? "solo practitioners and small clinics." : plan.title === "Pro Plan" ? "mid-sized practices." : "hospitals and large organizations."} Includes:
                    </p>
                    <ul className="list-disc list-inside">
                      {plan.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            What Our Users Say
          </h2>
          <motion.div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
            {testimonialsData.map((testimonial, index) => (
              <motion.div
                key={index}
                custom={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex-1 bg-white p-6 rounded-lg shadow-md"
              >
                <p className="text-gray-700 mb-4">"{testimonial.message}"</p>
                <p className="text-gray-900 font-semibold">{testimonial.name}</p>
                <p className="text-gray-500 text-sm">{testimonial.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-red-700">
        <div className="container mx-auto text-center">
          <motion.h2
            className="text-3xl font-bold mb-4 text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Ready to Transform Your Practice?
          </motion.h2>
          <motion.p
            className="text-xl mb-8 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Join the healthcare revolution and streamline your consultations today.
          </motion.p>
          <motion.button
            whileHover="hover"
            whileTap="tap"
            variants={refinedButtonVariants}
            className="bg-white text-red-700 hover:bg-gray-100 px-6 py-3 rounded"
            onClick={handleGetStartedClick} // Attach the click handler
          >
            Get Started Now
          </motion.button>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;