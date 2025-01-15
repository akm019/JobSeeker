import React, { useContext } from 'react';
import { X, Briefcase, Search } from 'lucide-react';
import { AuthContext } from '../AuthContext.jsx';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

const GetStarted = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="relative w-full max-w-md transform transition-all duration-300 ease-out scale-100"
      >
        {/* Glass morphism card effect */}
        <div className="relative bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
          {/* Decorative gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-90" />

          {/* Content container */}
          <div className="relative p-8">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-200"
              aria-label="Close Modal"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-900 bg-clip-text text-transparent mb-3">
                What brings you here?
              </h2>
              <p className="text-gray-600">
                Let us guide you on your journey to success.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-4">
              <Link to="JobPost" className="block">
                <button className="w-full group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 p-4 border-2 border-transparent hover:border-blue-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <div className="relative flex items-center justify-center gap-3">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-800">Post a Job</span>
                  </div>
                </button>
              </Link>

              <Link to="JobFind" className="block">
                <button className="w-full group relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="relative flex items-center justify-center gap-3 text-white">
                    <Search className="w-5 h-5" />
                    <span className="font-semibold">Find a Job</span>
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;