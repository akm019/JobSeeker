import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../Models/User.js';

const router = express.Router();

// Middleware to authenticate and extract user from JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user data to request object
    next();
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Profile update route
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, location, skills,resume } = req.body;
    console.log('Request body:', req.body); // Add this to debug incoming data

    const userId = req.user.id;
    console.log(userId);

    // Process skills - if it's a string, convert to array and clean it
    const processedSkills = typeof skills === 'string' 
      ? skills.split(',').map(skill => skill.trim())
      : skills;

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(location && { location }),
      ...(skills && { skills:processedSkills }),
      ...(resume && {resume}),
      updatedAt: new Date()
    };

    console.log('Update data:', updateData); // Add this to debug

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData,
      { new: true, select: '-password' } // Exclude password from response
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Profile updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error in profile update:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});
export default router;
