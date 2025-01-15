import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../AuthContext";
import axios from "axios";

const JobPost = () => {
  const [formData, setFormData] = useState({
    positionTitle: "",
    industry: "",
    salary: "",
    location: "",
    description: "",
    companyName: "",
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [viewingApplicants, setViewingApplicants] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch jobs posted by the user
  const fetchJobs = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Unauthorized: Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/MyJobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setJobs(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load your job postings.");
      setLoading(false);
    }
  };
  const handleDeleteJob = async (jobId) => {
    const token = localStorage.getItem("token");
    console.log(jobId)
    if (!token) {
      alert("Unauthorized: Please log in.");
      return;
    }
  
    try {
      await axios.delete(`http://localhost:5000/api/JobPost/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Remove the deleted job from the jobs list
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      alert("Job deleted successfully!");
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete the job.");
    }
  };
  
  // Fetch applicants for a specific job
  const fetchApplicants = async (jobId) => {
    console.log(jobId)
    const token = localStorage.getItem("token");
    try {
      console.log(user)
      const response = await axios.get(`http://localhost:5000/api/applications/${jobId}`, {
        
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setApplicants(response.data);
      setViewingApplicants(true);
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setError("Failed to load applicants.");
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized: Please log in.");
      return;
    }

    try {
      await axios.post("https://jobseeker1-6lnb.onrender.com/api/JobPost", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Job posted successfully!");
      setFormData({
        positionTitle: "",
        industry: "",
        salary: "",
        location: "",
        description: "",
        companyName: "",
      });
      fetchJobs();
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post the job.");
    }
  };

  useEffect(() => {
    if (!user || user.role !== "jobPoster") {
      alert("You are not a Job Poster, register as a Job Poster first.");
      navigate("/");
    } else {
      fetchJobs();
    }
  }, [user, navigate]);

  const ApplicantsList = ({ applicants,fetchApplicants }) => {
    const handleStatusChange = async (applicationId, newStatus,jobId) => {
      const token = localStorage.getItem("token");
      try {
        await axios.patch(
          `https://jobseeker1-6lnb.onrender.com/api/applications/${applicationId}/status`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setApplicants(prevApplicants => 
          prevApplicants.map(applicant => 
            applicant._id === applicationId 
              ? { ...applicant, status: newStatus }
              : applicant
          )
        );
        // Refresh the applicants list after status update
        if (jobId) {
          fetchApplicants(jobId);
        }
      } catch (error) {
        console.error("Error updating application status:", error);
        alert("Failed to update application status");
      }
    };
  
    return (
      <div className="bg-gray-950 p-6 rounded-lg border border-purple-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Applicants</h3>
          <button
            onClick={() => setViewingApplicants(false)}
            className="text-white hover:text-gray-300"
          >
            ← Back to Jobs
          </button>
        </div>
        {!applicants || applicants.length === 0 ? (
          <p className="text-gray-400">No applicants yet.</p>
        ) : (
          <div className="space-y-4">
            {applicants.map((applicant) => (
              <div
                key={applicant._id}
                className="bg-gray-900 p-4 rounded-lg border border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {applicant.user?.name || "Anonymous Applicant"}
                    </h4>
                    <p className="text-gray-300">
                      Email: {applicant.user?.email || "Not provided"}
                    </p>
                    <p className="text-gray-300">
                      Skills: {applicant.user?.skills || "Not specified"}
                    </p>
                    <p className="text-gray-300">
                      Status: <span className={`font-semibold ${
                        applicant.status === 'selected' ? 'text-green-400' :
                        applicant.status === 'rejected' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>{applicant.status}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(applicant._id, 'selected', applicant.jobId)}
                      className={`px-3 py-1 ${
                        applicant.status === 'selected'
                          ? 'bg-green-800'
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white rounded`}
                      disabled={applicant.status === 'selected'}
                    >
                      {applicant.status === 'selected' ? 'Selected' : 'Select'}
                    </button>
                    <button
                      onClick={() => handleStatusChange(applicant._id, 'rejected', applicant.jobId)}
                      className={`px-3 py-1 ${
                        applicant.status === 'rejected'
                          ? 'bg-red-800'
                          : 'bg-red-600 hover:bg-red-700'
                      } text-white rounded`}
                      disabled={applicant.status === 'rejected'}
                    >
                      {applicant.status === 'rejected' ? 'Rejected' : 'Reject'}
                    </button>
                  </div>
                </div>
                {applicant.coverLetter && (
                  <div className="mt-2">
                    <p className="text-gray-400">Cover Letter:</p>
                    <p className="text-gray-300">{applicant.coverLetter}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!user || user.role !== "jobPoster") {
    return null;
  }

  return (
    <div className="flex flex-col items-center py-10 bg-black min-h-full">
      {user && (
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 px-4">
        {/* Form Section */}
        <div className="w-full lg:w-1/2">
          <div className="bg-gray-950 border border-purple-500 shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-white mb-6 text-center">
                Post a Job
              </h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="positionTitle" className="block text-sm font-medium text-white">
                    Position Title
                  </label>
                  <input
                    type="text"
                    name="positionTitle"
                    id="positionTitle"
                    value={formData.positionTitle}
                    onChange={handleChange}
                    placeholder="e.g., Software Engineer"
                    className="mt-1 p-2 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                    required
                  />
                </div>
                {/* Other form fields remain the same, just adjust padding to p-2 */}
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-white">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    id="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g., Technology, Healthcare"
                    className="mt-1 p-2 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                  />
                </div>
                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-white">
                    Salary
                  </label>
                  <input
                    type="number"
                    name="salary"
                    id="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g., 50000"
                    className="mt-1 p-2 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-white">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., New York, Remote"
                    className="mt-1 p-2 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-white">
                    Job Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Write a brief description of the role"
                    className="mt-1 p-2 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-white">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g., ABC Corp"
                    className="mt-1 p-2 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                  />
                </div>
                <div className="pt-2 pb-4">
                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md shadow focus:ring focus:ring-purple-300"
                  >
                    Post Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

          {/* Jobs Section */}
          <div className="w-full lg:w-1/2 p-6 bg-gray-950 border border-purple-500 shadow-lg rounded-lg h-[700px] overflow-y-auto">
            {viewingApplicants ? (
              <ApplicantsList applicants={applicants} />
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Your Posted Jobs
                </h2>
                {loading ? (
                  <p className="text-gray-300">Loading jobs...</p>
                ) : error ? (
                  <div className="p-3 bg-red-900 text-white rounded">
                    {error}
                  </div>
                ) : jobs.length === 0 ? (
                  <p className="text-gray-300">No jobs posted yet.</p>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div
                        key={job._id}
                        className="bg-gray-900 p-4 border border-gray-700 rounded-md shadow-sm"
                      >
                        <h3 className="text-lg font-bold text-white">
                          {job.positionTitle}
                        </h3>
                        <p className="text-sm text-gray-300">
                          <strong>Industry:</strong> {job.industry || "N/A"}
                        </p>
                        <p className="text-sm text-gray-300">
                          <strong>Salary:</strong> ${job.salary || "N/A"}
                        </p>
                        <p className="text-sm text-gray-300">
                          <strong>Location:</strong> {job.location || "N/A"}
                        </p>
                        <p className="text-sm text-gray-300">
                          <strong>Company:</strong> {job.companyName || "N/A"}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              if (job._id) {
                                fetchApplicants(job._id);
                              } else {
                                setError("Invalid job ID");
                              }
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm"
                          >
                            View Applicants
                          </button>
                          <button
                            onClick={() => {
                              if (job._id) {
                                handleDeleteJob(job._id);
                              } else {
                                setError("Invalid job ID");
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm"
                          >
                            Delete Job
                          </button>
                        </div>
                      </div>
))}

                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPost;

