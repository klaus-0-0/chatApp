import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from '../config';
import wall from '../assets/SignBI.png';

const Signup = () => {
  const [username, setName] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const Info = JSON.parse(localStorage.getItem("user-info"));
  if (Info) {
    navigate('/Dashboard')
  }

  const handleSignup = async () => {
    try {
      const userData = await axios.post(`${config.apiUrl}/signup`, {
        username,
        number,
        password,
      });

      localStorage.setItem("user-info", JSON.stringify(userData.data));
      setTimeout(() => {
        navigate("/Dashboard");
      }, 1500);
    } catch (error) {
      console.error("Signup Failed:", error.response.data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Added relative positioning to the parent container to allow absolute positioning of children */}
      {/* Background Image - positioned absolutely to cover entire screen */}
      <img
        src={wall}
        alt="Background"
        className="absolute w-full h-full object-cover opacity-100"  // Removed opacity to show full image
      />

      <div className="absolute"></div>

      {/* Top Navigation Bar - added z-index to appear above background */}
      <nav className="w-full bg-white p-4 flex justify-end relative z-10">
        <div className="flex space-x-6">
          <button
            className="text-black font-bold mt-4"
            onClick={() => navigate("")}
          >
            About
          </button>
          <div className="flex justify-center pt-4 gap-4">
            <button
              className="w-50 bg-black hover:bg-cyan-700 text-white py-2 px-4 rounded font-medium transition "
              onClick={handleSignup}
            >
              Sign up
            </button>
            <button
              className="w-50 bg-white hover:bg-cyan-700 text-black border border-black py-2 px-4 rounded font-medium transition"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - added relative z-index to appear above background */}
      <div className="flex-1 flex items-center justify-center lg:justify-start p-4 relative z-10">
        {/* Form Container - added white background with opacity for better readability */}
        <div className="w-full max-w-md lg:ml-60 bg-white bg-opacity-90 p-6 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-600 mt-2">Welcome</p>
          </div>

          <div className="space-y-4">
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">Name</label> */}
              <input
                type="text"
                className="w-full border border-black rounded p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="username"
                value={username}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label> */}
              <input
                type="number"
                className="w-full border border-black rounded p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="Your phone number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>

            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">Password</label> */}
              <input
                type="password"
                className="w-full border border-black rounded p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-center pt-4 gap-4">
              <button
                className="w-50 bg-black hover:bg-cyan-700 text-white py-2 px-4 rounded font-medium transition "
                onClick={handleSignup}
              >
                Sign up
              </button>
              <button
                className="w-50 bg-white hover:bg-cyan-700 text-black border border-black py-2 px-4 rounded font-medium transition"
                onClick={() => navigate("/login")}
              >
                Log in
              </button>
            </div>
          </div>

          {/* <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <button
                className="w-50 bg-white hover:bg-cyan-700 text-black border border-black py-2 px-4 rounded font-medium transition"
                onClick={() => navigate("/login")}
              >
                Log in
              </button>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Signup;