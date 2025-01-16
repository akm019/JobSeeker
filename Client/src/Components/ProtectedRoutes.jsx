import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    toast.error('Please login or signup to access this page', {
      duration: 3000,
      position: 'top-center',
    });
    
    return <Navigate to="/Signup" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;