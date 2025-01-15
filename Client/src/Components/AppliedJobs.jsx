import React from 'react';
import { useSelector } from 'react-redux';

const AppliedJobsSection = () => {
  const { jobs, appliedJobs } = useSelector((state) => state.jobs);
  
  // Filter jobs to only show applied ones
  const appliedJobsDetails = jobs.filter(job => appliedJobs.includes(job._id));

  const getStatusColor = (status) => {
    switch (status) {
      case 'selected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (appliedJobsDetails.length === 0) {
    return (
      <div className="mt-8 text-center text-gray-600">
        You haven't applied to any jobs yet.
      </div>
    );
  }

  return (
    <div className="py-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Your Job Applications
      </h2>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4">
        {appliedJobsDetails.map((job) => (
          <div
            key={job._id}
            className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-blue-500"
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {job.positionTitle}
              </h3>
              <p className="text-gray-600">
                {job.companyName}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Location:</span> {job.location}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Salary:</span> ${job.salary}
              </p>
              <div className={`mt-4 px-3 py-2 rounded-md border ${getStatusColor(job.applicationStatus)}`}>
                <p className="text-sm font-medium">
                  Status: {job.applicationStatus ? 
                    job.applicationStatus.charAt(0).toUpperCase() + job.applicationStatus.slice(1) 
                    : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppliedJobsSection;      