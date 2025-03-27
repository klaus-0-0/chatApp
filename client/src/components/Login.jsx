import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError(""); // Reset error before making request

    try {
      const { data } = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });

      localStorage.setItem("user-info", JSON.stringify(data));

      setTimeout(() => navigate("/chatbox"), 1500);
    } catch (error) {
      setError("Login Failed! Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden">
      <h2 className="text-3xl font-bold mb-8">Login</h2>

      <form className="flex flex-col items-center space-y-6 w-80">
        <input
          type="email"
          placeholder="Email"
          className="w-full bg-transparent border-b border-gray-500 text-white focus:outline-none focus:border-green-400 transition-all p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full bg-transparent border-b border-gray-500 text-white focus:outline-none focus:border-green-400 transition-all p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className={`mt-8 flex items-center justify-center text-lg font-semibold text-white 
              ${error ? "bg-red-500 animate-glow-red" : "bg-gradient-to-r from-green-500 to-green-600 animate-glow-green"}
              rounded-full shadow-lg transition-all duration-700 ease-in-out transform
              hover:scale-110 active:scale-90 w-32 h-12`}
        >
          {loading ? "•‿•" : error ? "T_T" : "O-O"}
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>

      <p className="mt-6">
        Don't have an account?{" "}
        <span
          className="text-green-400 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Signup
        </span>
      </p>
    </div>
  );
};

export default Login;
