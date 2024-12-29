import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router';

const ProfileEdit = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    skills: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize form data with user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        skills: user.skills || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Unauthorized: Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/profile',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data.user) {
        // Update local storage with new user data
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update AuthContext
        updateUser(updatedUser);
        
        // Navigate after successful update
        navigate('/');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(
        error.response?.data?.message || 'Error updating profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-medium text-gray-700">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="font-medium text-gray-700">Phone</label>
            <input
              id="phone"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="location" className="font-medium text-gray-700">Location</label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="skills" className="font-medium text-gray-700">Skills</label>
            <textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="skills" className="font-medium text-gray-700">Resume Link</label>
            <textarea
              id="resumme"
              name="resume"
              value={formData.resume}
              onChange={handleChange}
              className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;