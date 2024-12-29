import jwt from 'jsonwebtoken';
import User from '../Models/User.js'; // Adjust the path to your user model

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

export default authenticateToken;
