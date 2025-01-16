import React, { useState } from 'react';
import { X } from 'lucide-react';
import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from '../AuthContext.jsx';
import { useNavigate } from "react-router-dom";
const { login } = useContext(AuthContext);
const navigate = useNavigate();

function App() {
  const [isOpen, setIsOpen] = useState(true);
  return isOpen ? <Signup onClose={() => setIsOpen(false)} /> : null;
}

const Signup = ({ onClose }) => {
  const [isSignup, setIsSignup] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState(null);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    const endpoint = isSignup ? "signup" : "login";
    const data = isSignup
      ? { name, email, password, role }
      : { email, password };

      try {
        const response = await axios.post(`https://jobseeker-1-mg4e.onrender.com/api/${endpoint}`, data);
  
        if (isSignup) {
          setIsSignup(false); // Switch to login form
        } else {
          const { token, user } = response.data;
          login(user, token); // Use the login function from context
          onClose(); // Close modal
          // navigate(user.role === "jobSeeker" ? "/" : "/JobPost");
          navigate('/')
        }
      } catch (err) {
        const backendError = err.response?.data?.message || "An error occurred";
        setError(backendError);
      }
  };

  // Toggle between signup and login forms
  const toggleSignupLogin = () => {
    setIsSignup(!isSignup);
    setError(null); // Clear errors when toggling
  };


 

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="relative bg-gray-900 rounded-2xl shadow-xl border border-gray-800">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>

          <form onSubmit={handleFormSubmit} className="p-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                {isSignup ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-400 mt-2">
                {isSignup ? "Join our community today" : "Sign in to your account"}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {isSignup && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {isSignup && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="">Select your role</option>
                    <option value="jobPoster">Job Poster</option>
                    <option value="jobSeeker">Job Seeker</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-8 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
            >
              {isSignup ? "Create Account" : "Sign In"}
            </button>

            <p className="mt-6 text-center text-gray-400">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={toggleSignupLogin}
                className="text-blue-400 hover:text-blue-300 font-medium focus:outline-none"
              >
                {isSignup ? "Sign In" : "Create Account"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;