import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
      console.log('User loaded from localStorage:', savedUser);
    } else {
      console.log('No user found in localStorage');
    }
  }, []);

  // Login function
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
    console.log('User logged in:', userData);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('User logged out');
  };

  // Update user profile
  const updateUser = async (updatedData) => {
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'POST', // Change this to 'PATCH' if your backend expects a PATCH request
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Ensure the token is correct and not null/undefined
        },
        body: JSON.stringify(updatedData),
      });
  
      // Debugging response status
      console.log('Response Status:', response.status);
  
      if (!response.ok) {
        const errorMessage = await response.text(); // Get the error message from the response
        console.error('Response Error Message:', errorMessage);
        throw new Error(`Failed to update profile: ${errorMessage}`);
      }
  
      const data = await response.json();
  
      // Check for expected response data structure
      if (data.user) {
        // Update the user state
        setUser(data.user);
  
        // Persist updated user in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
  
        console.log('User updated successfully:', data.user);
      } else {
        console.error('Unexpected API response structure:', data);
      }
    } catch (error) {
      console.error('Error updating profile:', error.message);
    }
  };
  
  
  

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
