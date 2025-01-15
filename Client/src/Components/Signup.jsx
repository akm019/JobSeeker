import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { X } from "lucide-react";
import icon from "./google-brands-solid.svg";
import { useGoogleLogin } from "@react-oauth/google";
import { AuthContext } from '../AuthContext.jsx';
import { useNavigate } from "react-router-dom";

const Signup = ({ onClose }) => {
  const {login} = useContext(AuthContext)
  const [isSignup, setIsSignup] = useState(true); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [googleUserData, setGoogleUserData] = useState(null); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  // Google Login
  const Googlelogin = useGoogleLogin({
    onSuccess: (response) => fetchGoogleUserProfile(response),
    onError: (error) => console.error("Google Login Failed", error),
  });

  // Fetch user profile after Google login
  const fetchGoogleUserProfile = (tokenInfo) => {
    axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo.access_token}`,
            Accept: "application/json",
          },
        }
      )
      .then((resp) => {
        setGoogleUserData({
          name: resp.data.name,
          email: resp.data.email,
          picture: resp.data.picture,
        });
      })
      .catch((error) => {
        console.error("Error fetching Google user profile:", error);
      });
  };

  // Submit Google user role
  const handleGoogleRoleSubmit = async () => {
    if (!role) {
      alert("Please select a role before proceeding.");
      return;
    }

    try {
      const user = {
        ...googleUserData,
        role,
      };

      const response = await axios.post(
        "http://localhost:5000/api/google-auth",
        user
      );

      console.log("User authenticated with Google and role saved:", response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      // onClose(); // Close modal
      console.log(user)
      navigate('/')
      // navigate(role === "jobSeeker" ? "/" : "/JobPost");
    } catch (err) {
      console.error("Backend error:", err.response?.data || err.message);
      setError("Failed to authenticate Google user. Try again.");
    }
  };
 const handleClose = ()=>{
  onClose();
  navigate('/')
 }
  // Handle form submission (signup or login)
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
    <div className="fixed inset-0 bg-black z-50 bg-opacity-30 backdrop-blur-sm">

      <div className="flex flex-col items-center justify-center ">
        <div className="relative md:w-[30%] p-4 rounded-lg mt-10">
          <button
            onClick={handleClose}
            className="text-black absolute top-14 right-4 rounded-full p-2 hover:bg-blue-600 transition"
          >
            <X />
          </button>
          <form
            onSubmit={handleFormSubmit}
            className="mt-10 rounded-lg bg-white border border-blue-700 flex flex-col gap-4 p-10 items-center justify-center"
          >
            <p className="font-bold text-blue-600 text-2xl">
              {isSignup ? "Sign Up" : "Log In"}
            </p>

            {error && <p className="text-red-500">{error}</p>}

            {googleUserData ? (
              <>
                <p>Welcome, {googleUserData.name}!</p>
                <select
                  className="py-1 md:w-[70%] text-black border"
                  name="role"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  <option value="jobposter">Job Poster</option>
                  <option value="jobseeker">Job Seeker</option>
                  <option value="professional">Professional</option>
                </select>
                <button
                  type="button"
                  className="border border-blue-700 bg-blue-500 text-white py-2 px-4 mt-4"
                  onClick={handleGoogleRoleSubmit}
                >
                  Submit Role
                </button>
              </>
            ) : (
              <>
                {isSignup && (
                  <input
                    type="text"
                    placeholder="Enter Your Name"
                    className="py-1 md:w-[70%] text-black border"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                )}
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  className="py-1 md:w-[70%] text-black border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Enter Your Password"
                  className="py-1 md:w-[70%] text-black border"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {isSignup && (
                  <select
                    className="py-1 md:w-[70%] text-black border"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="">Select Role</option>
                    <option value="jobPoster">Job Poster</option>
                    <option value="jobSeeker">Job Seeker</option>
                    <option value="professional">Professional</option>
                  </select>
                )}
                <button
                  type="submit"
                  className="border border-blue-700 bg-blue-500 text-white py-2 px-4 mt-4"
                >
                  {isSignup ? "Sign Up" : "Log In"}
                </button>
                <h1 className="text-blue-500">OR</h1>
                <button
                  type="button"
                  className="border border-zinc-600 hover:border-sky-500 p-2 flex gap-2 text-blue-500"
                  onClick={Googlelogin}
                >
                  <img className="w-4 mt-1" src={icon} alt="Google Icon" />
                  {isSignup ? "Sign Up with Google" : "Log In with Google"}
                </button>
                <p
                  className="text-blue-500 cursor-pointer mt-2"
                  onClick={toggleSignupLogin}
                >
                  {isSignup ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
                </p>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
