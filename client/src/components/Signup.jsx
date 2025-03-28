import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const Signup = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [popped, setPopped] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [success, setSuccess] = useState(false); // New state to track successful signup

    useEffect(() => {
        setTimeout(() => setPopped(true), 200); // Button pop effect
    }, []);

    const handleSignup = async (e) => {
        e.preventDefault();
        setClicked(true); // Button is clicked

        try {
            setLoading(true);
            setError(''); // Reset error

            const response = await axios.post(`${config.apiUrl}/auth/signup`, {
                username,
                email,
                password,
            });

            localStorage.setItem('user-info', JSON.stringify(response.data));

            setSuccess(true); // Mark success (this will trigger falling animation)
            setTimeout(() => navigate('/TestingUi'), 2000); // Navigate after animation
        } catch (err) {
            setError('Signup failed / User already exists');
            setClicked(false);
            setSuccess(false); // Prevent falling animation
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden">
            <h2 className="text-3xl font-bold mb-8">Sign Up</h2>
            <form onSubmit={handleSignup} className="flex flex-col items-center space-y-6 w-80">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-500 text-white focus:outline-none focus:border-blue-400 transition-all p-2"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-500 text-white focus:outline-none focus:border-blue-400 transition-all p-2"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-500 text-white focus:outline-none focus:border-blue-400 transition-all p-2"
                    required
                />

                {!success ? ( // Show the button only if signup is NOT successful
                    <button
                        type="submit"
                        className={`mt-8 flex items-center justify-center text-lg font-semibold text-white 
                                ${error ? "bg-red-500 animate-glow-red" : "bg-gradient-to-r from-blue-500 to-indigo-600"} 
                                rounded-full shadow-lg transition-all duration-700 ease-in-out transform
                                ${popped ? "w-20 h-20 opacity-100 translate-y-0" : "w-6 h-6 opacity-0 -translate-y-10"}
                                hover:scale-110 active:scale-90 animate-glow-blue`}
                    >
                        {loading ? "Up..." : error ? "T_T" : "Up"}
                    </button>
                ) : (
                    <div className="mt-6 flex gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="w-6 h-6 bg-blue-500 rounded-full animate-fall"
                                style={{ animationDelay: `${i * 200}ms` }}
                            ></div>
                        ))}
                    </div>
                )}
            </form>

            {error && <p className="text-red-500 mt-4">{error}</p>}

            <p className="mt-6">
                Already have an account?{' '}
                <span className="text-blue-400 cursor-pointer" onClick={() => navigate('/login')}>
                    Login
                </span>
            </p>
        </div>
    );
};

export default Signup;
