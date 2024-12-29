import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, fetchUserApplications, applyToJob, clearMessages } from '../JobSlice';

const JobFind = () => {
  const dispatch = useDispatch();
  const { 
    jobs, 
    appliedJobs, // Using array instead of Set
    loading, 
    error, 
    successMessage 
  } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchUserApplications());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleApply = async (jobId) => {
    dispatch(applyToJob(jobId))
      .unwrap()
      .then(() => {
        dispatch(fetchUserApplications());
      });
  };

  if (loading) {
    return <div className="text-center mt-10">Loading job postings...</div>;
  }

  return (
    <div className="py-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Available Job Postings
      </h1>
      {successMessage && (
        <div className="text-center text-green-600 font-semibold mb-4">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="text-center text-red-600 font-semibold mb-4">
          {error}
        </div>
      )}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {job.positionTitle}
              </h2>
              <p className="text-gray-600 mt-1">
                <strong>Company:</strong> {job.companyName}
              </p>
              <p className="text-gray-600 mt-1">
                <strong>Industry:</strong> {job.industry || "Not specified"}
              </p>
              <p className="text-gray-600 mt-1">
                <strong>Location:</strong> {job.location}
              </p>
              <p className="text-gray-600 mt-1">
                <strong>Salary:</strong> ${job.salary}
              </p>
              <p className="text-gray-600 mt-3">
                <strong>Description:</strong> {job.description}
              </p>
            </div>
            <button
              className={`mt-4 py-2 px-4 rounded-md shadow ${
                appliedJobs.includes(job._id)
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              onClick={() => handleApply(job._id)}
              disabled={appliedJobs.includes(job._id)}
            >
              {appliedJobs.includes(job._id) ? 'Applied' : 'Apply Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobFind;