import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, fetchUserApplications, applyToJob, clearMessages } from '../JobSlice';
import { useOutsideClick } from "../Hooks/useOutsideClick.js";
import Alert from '@mui/material/Alert';
import { Building2, MapPin, DollarSign, Briefcase, X as CloseIcon, Search } from 'lucide-react';

export function JobFind() {
  const dispatch = useDispatch();
  const [active, setActive] = useState(null);
  const id = useId();
  const ref = useRef(null);
  
  const { jobs, appliedJobs, loading, error, successMessage } = useSelector((state) => state.jobs);

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

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const handleApply = async (jobId) => {
    dispatch(applyToJob(jobId))
      .unwrap()
      .then(() => {
        dispatch(fetchUserApplications());
        setActive(null);
      });
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-400 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-lg text-indigo-200 font-medium">Loading job postings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#060818] bg-gradient-to-b from-indigo-950 to-[#060818]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDk5LDEwMiwyNDEsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      </div>

      <div className="relative z-10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Available Job Postings
            </h1>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
              Discover your next opportunity from our curated list of positions
            </p>
          </motion.div>

          {/* Alerts */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto mb-8"
              >
                <Alert severity="success" className="shadow-xl bg-green-900/20 text-green-200">
                  {successMessage}
                </Alert>
              </motion.div>
            )}
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto mb-8"
              >
                <Alert severity="error" className="shadow-xl bg-red-900/20 text-red-200">
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Job Cards Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {jobs.map((job, index) => (
              <motion.div
                layoutId={`card-${job._id}-${id}`}
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => setActive(job)}
                className="group bg-[#0A0F1C] hover:bg-[#141B2D] rounded-xl shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer border border-indigo-500/10 backdrop-blur-sm"
              >
                <div className="p-6">
                  <motion.h3
                    layoutId={`title-${job._id}-${id}`}
                    className="font-semibold text-xl text-white mb-2 group-hover:text-indigo-400 transition-colors"
                  >
                    {job.positionTitle}
                  </motion.h3>
                  <motion.div
                    layoutId={`company-${job._id}-${id}`}
                    className="flex items-center gap-2 text-indigo-200 mb-4"
                  >
                    <Building2 className="w-4 h-4" />
                    {job.companyName}
                  </motion.div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-200">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-indigo-200">
                      <DollarSign className="w-4 h-4" />
                      ${job.salary}
                    </div>
                  </div>

                  {appliedJobs.includes(job._id) && (
                    <div className={`mt-4 py-2 px-3 rounded-lg text-sm font-medium text-center ${
                      job.applicationStatus === 'selected' ? 'bg-green-900/20 text-green-300' :
                      job.applicationStatus === 'rejected' ? 'bg-red-900/20 text-red-300' :
                      'bg-yellow-900/20 text-yellow-300'
                    }`}>
                      {job.applicationStatus ? 
                        job.applicationStatus.charAt(0).toUpperCase() + job.applicationStatus.slice(1) 
                        : 'Pending'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Modal */}
          <AnimatePresence>
            {active && typeof active === "object" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm h-full w-full z-10"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {active && typeof active === "object" ? (
              <div className="fixed inset-0 grid place-items-center z-[100] px-4">
                <motion.div
                  layoutId={`card-${active._id}-${id}`}
                  ref={ref}
                  className="w-full max-w-2xl bg-[#0A0F1C] rounded-2xl shadow-2xl overflow-hidden border border-indigo-500/10"
                >
                  <div className="relative p-6">
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-4 right-4 p-2 hover:bg-indigo-500/10 rounded-full transition-colors"
                      onClick={() => setActive(null)}
                    >
                      <CloseIcon className="w-5 h-5 text-indigo-200" />
                    </motion.button>

                    <div className="mb-6">
                      <motion.h3
                        layoutId={`title-${active._id}-${id}`}
                        className="text-2xl font-bold text-white mb-2"
                      >
                        {active.positionTitle}
                      </motion.h3>
                      <motion.div
                        layoutId={`company-${active._id}-${id}`}
                        className="flex items-center gap-2 text-indigo-200"
                      >
                        <Building2 className="w-4 h-4" />
                        {active.companyName}
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <MapPin className="w-4 h-4" />
                        {active.location}
                      </div>
                      <div className="flex items-center gap-2 text-indigo-200">
                        <DollarSign className="w-4 h-4" />
                        ${active.salary}
                      </div>
                      <div className="flex items-center gap-2 text-indigo-200">
                        <Briefcase className="w-4 h-4" />
                        {active.industry || "Not specified"}
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none mb-6">
                      <h4 className="text-lg font-semibold mb-2 text-white">Description</h4>
                      <p className="text-indigo-200">{active.description}</p>
                    </div>
                    
                    {appliedJobs.includes(active._id) ? (
                      <div className={`p-4 rounded-lg text-center font-medium ${
                        active.applicationStatus === 'selected' ? 'bg-green-900/20 text-green-300' :
                        active.applicationStatus === 'rejected' ? 'bg-red-900/20 text-red-300' :
                        'bg-yellow-900/20 text-yellow-300'
                      }`}>
                        Application Status: {active.applicationStatus ? 
                          active.applicationStatus.charAt(0).toUpperCase() + active.applicationStatus.slice(1) 
                          : 'Pending'}
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleApply(active._id)}
                        className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-indigo-500/25"
                      >
                        Apply Now
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default JobFind;