import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase"; // Ensure this points to your firebase.js
import { ref, child, get } from "firebase/database";

const MyAccount = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null); // Track user role (doctor or patient)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setRole(null); // User not logged in
          return;
        }

        const userId = currentUser.uid;
        const dbRef = ref(db);

        // Check both doctor and patient paths in the database
        const doctorSnapshot = await get(child(dbRef, `users/doctors/${userId}`));
        const patientSnapshot = await get(child(dbRef, `users/patients/${userId}`));

        if (doctorSnapshot.exists()) {
          setRole("doctor");
        } else if (patientSnapshot.exists()) {
          setRole("patient");
        } else {
          setRole(null); // Role not found
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
      navigate("/"); // Redirect to the login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const handleProfileNavigation = () => {
    if (role === "doctor") {
      navigate("/doctor/profile");
    } else if (role === "patient") {
      navigate("/profile");
    } else {
      alert("Unable to determine your role. Please log in again.");
      handleLogout();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 focus:outline-none"
      >
        <span>My Account</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
          <button
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => {
              handleProfileNavigation();
              setIsOpen(false);
            }}
          >
            My Profile
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default MyAccount;


// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { ChevronDown } from "lucide-react";
// import { signOut } from "firebase/auth";
// import { auth } from "../../firebase"; // Ensure this points to your firebase.js

// const MyAccount = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const navigate = useNavigate();

//   const toggleDropdown = () => setIsOpen(!isOpen);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       alert("Logged out successfully!");
//       navigate("/"); // Redirect to the login page after logout
//     } catch (error) {
//       console.error("Error logging out:", error);
//       alert("Failed to log out. Please try again.");
//     }
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={toggleDropdown}
//         className="flex items-center space-x-1 focus:outline-none"
//       >
//         <span>My Account</span>
//         <ChevronDown className="h-4 w-4" />
//       </button>
//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
//           <Link
//             to="/profile"
//             className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
//             onClick={() => setIsOpen(false)}
//           >
//             My Profile
//           </Link>
//           <button
//             className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
//             onClick={() => {
//               setIsOpen(false);
//               handleLogout();
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyAccount;
