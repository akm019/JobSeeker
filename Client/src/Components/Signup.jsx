import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { X } from "lucide-react";
import icon from "./google-brands-solid.svg";
import { useGoogleLogin } from "@react-oauth/google";
import { AuthContext } from '../AuthContext.jsx';
import { useNavigate } from "react-router-dom";

const Signup = ({ onClose }) => {
  const { login } = useContext(AuthContext);
  const [isSignup, setIsSignup] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [googleUserData, setGoogleUserData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // const Googlelogin = useGoogleLogin({
  //   onSuccess: (response) => fetchGoogleUserProfile(response),
  //   onError: (error) => console.error("Google Login Failed", error),
  // });

  // const fetchGoogleUserProfile = (tokenInfo) => {
  //   axios
  //     .get(
  //       `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${tokenInfo.access_token}`,
  //           Accept: "application/json",
  //         },
  //       }
  //     )
  //     .then((resp) => {
  //       setGoogleUserData({
  //         name: resp.data.name,
  //         email: resp.data.email,
  //         picture: resp.data.picture,
  //       });
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching Google user profile:", error);
  //     });
  // };

  // const handleGoogleRoleSubmit = async () => {
  //   if (!role) {
  //     alert("Please select a role before proceeding.");
  //     return;
  //   }

  //   try {
  //     const user = {
  //       ...googleUserData,
  //       role,
  //     };

  //     const response = await axios.post(
  //       "http://localhost:5000/api/google-auth",
  //       user
  //     );

  //     console.log("User authenticated with Google and role saved:", response.data);
  //     localStorage.setItem("user", JSON.stringify(response.data));
  //     console.log(user);
  //     navigate('/');
  //   } catch (err) {
  //     console.error("Backend error:", err.response?.data || err.message);
  //     setError("Failed to authenticate Google user. Try again.");
  //   }
  // };

  // const handleClose = () => {
  //   onClose();
  //   navigate('/');
  // };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const endpoint = isSignup ? "signup" : "login";
    const data = isSignup
      ? { name, email, password, role }
      : { email, password };

    try {
      const response = await axios.post(`https://jobseeker-1-mg4e.onrender.com/api/${endpoint}`, data);

      if (isSignup) {
        setIsSignup(false);
      } else {
        const { token, user } = response.data;
        login(user, token);
        onClose();
        navigate('/');
      }
    } catch (err) {
      const backendError = err.response?.data?.message || "An error occurred";
      setError(backendError);
    }
  };

  const toggleSignupLogin = () => {
    setIsSignup(!isSignup);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="relative bg-gray-900 rounded-2xl shadow-xl border border-gray-800">
          <button
            onClick={handleClose}
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

            {googleUserData ? (
              <div className="space-y-5">
                <p className="text-gray-200 text-center">Welcome, {googleUserData.name}!</p>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Role</label>
                  <select
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="">Select Role</option>
                    <option value="jobposter">Job Poster</option>
                    <option value="jobseeker">Job Seeker</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleRoleSubmit}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
                >
                  Submit Role
                </button>
              </div>
            ) : (
              <>
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

                <div className="mt-6 text-center">
                  <p className="text-gray-400 mb-4">OR</p>
                  {/* <button
                    type="button"
                    onClick={Googlelogin}
                    className="w-full px-6 py-3 rounded-lg border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all flex items-center justify-center gap-2"
                  >
                    <img className="w-5 h-5" src={icon} alt="Google Icon" />
                    <span>{isSignup ? "Sign Up with Google" : "Log In with Google"}</span>
                  </button> */}

                  <p className="mt-6 text-gray-400">
                    {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                      type="button"
                      onClick={toggleSignupLogin}
                      className="text-blue-400 hover:text-blue-300 font-medium focus:outline-none"
                    >
                      {isSignup ? "Sign In" : "Create Account"}
                    </button>
                  </p>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;