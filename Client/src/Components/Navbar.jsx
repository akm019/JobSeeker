import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import Signup from './Signup';
import icon from '../assets/icon.jpeg';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-[#020B2D] px-4 py-4 border-b border-[#4361EE]/20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          JOBSEEKER
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            {user.picture ? (
              <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full border-2 border-[#4361EE]" />
            ) : (
              <img src={icon} alt="Default" className="w-8 h-8 rounded-full border-2 border-[#4361EE]" />
            )}
            <span className="text-white">{user.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-[#4361EE] text-white rounded-lg hover:opacity-90 transition-colors"
          >
            SIGN IN
          </button>
        )}
      </div>
      {showModal && <Signup onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Header;