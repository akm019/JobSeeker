import React, { useContext } from 'react';
import { X } from 'lucide-react';
import {AuthContext} from '../AuthContext.jsx'
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import JobPost from './JobPost.jsx';

const GetStarted = ({ onClose }) => {
const {user} = useContext(AuthContext)
const navigate = useNavigate();
  return (
    
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
      {/* Modal Content */}
      <div className="relative bg-slate-100 rounded-lg shadow-lg p-8 w-[90%] max-w-lg text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-6 right-4 text-  rounded-full p-2 hover:bg-blue-600 transition"
          aria-label="Close Modal"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text- mb-4">
          What brings you here?
        </h2>
        <p className="text- mb-6">
          Let us guide you on your journey to success.
        </p>

        {/* Buttons */}
        <div  className="flex flex-col gap-4">
        <Link   className="flex flex-col gap-4" to='JobPost'>
        <button  className="bg-blue-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-orange-300 transition">
            Post a Job
          </button></Link>
          <Link   className="flex flex-col gap-4" to='JobFind'>
        <button  className="bg-blue-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-orange-300 transition">
            Find a Job
          </button></Link>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
