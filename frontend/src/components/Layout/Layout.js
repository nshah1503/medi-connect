import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Facebook, Twitter, Instagram, Mail, Phone, Globe } from "lucide-react";
import MyAccount from "./MyAccount"; // Ensure correct path

const Layout = ({ children }) => {
  const location = useLocation();
  const isDoctor = location.pathname.includes("/doctor");
  const logoLink = isDoctor ? "/doctor" : "/patient";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-red-700 text-white py-1 px-4 text-sm">
        <div className="container mx-auto flex justify-between items-center">
          <span>Transforming Healthcare, One Consultation at a Time</span>
          <span>
            <Link to="/about" className="hover:underline">
              About Us
            </Link>{" "}
            |{" "}
            <Link to="/contact" className="hover:underline">
              Contact
            </Link>
          </span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-md py-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to={logoLink} className="text-3xl font-bold text-red-700">
            Mediconnect
          </Link>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <MyAccount /> {/* Updated MyAccount */}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* ... existing footer content ... */}
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Mediconnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;