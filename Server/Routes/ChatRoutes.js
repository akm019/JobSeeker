import express from 'express'
const router = express.Router();
// const auth = require('../middleware/auth'); // Your existing auth middleware
import ChatRoom from '../Models/ChatRoom.js'
import ChatMessage from '../Models/ChatMessage.js'
import jwt from 'jsonwebtoken'
import RoomEnrollment from '../Models/Enrollment.js'
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


const app = express();
// Configure static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
import PersonalMessage from '../Models/PersonalMessage.js';



const validateMessageInput = (req, res, next) => {
  console.log('Request body:', req.body);
  
  if (!req.body.to) {
    return res.status(400).json({ message: 'Recipient ID is required' });
  }

  if (!req.body.text && !req.body.attachment) {
    return res.status(400).json({ message: 'Message must contain either text or attachment' });
  }

  next();
};

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

// Add to your routes file
// Create personal message
router.post('/personal-messages', authenticateToken, validateMessageInput, async (req, res) => {
  try {
    console.log('Creating message with data:', {
      from: req.user.id,
      to: req.body.to,
      text: req.body.text,
      attachment: req.body.attachment
    });

    const newMessage = new PersonalMessage({
      from: req.user.id,
      to: req.body.to,
      text: req.body.text || '',
      attachment: req.body.attachment || null,
      timestamp: new Date()
    });
    
    const savedMessage = await newMessage.save();
    const populatedMessage = await PersonalMessage.findById(savedMessage._id)
      .populate('from to', 'name role');
    
    console.log('Message saved successfully:', populatedMessage);
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Server error creating message:', error);
    res.status(500).json({ 
      message: error.message,
      details: 'Error creating personal message'
    });
  }
});

// Get personal messages
router.get('/personal-messages/:userId', authenticateToken, async (req, res) => {
  try {
    const messages = await PersonalMessage.find({
      $or: [
        { from: req.user.id, to: req.params.userId },
        { from: req.params.userId, to: req.user.id }
      ]
    })
    .populate('from to', 'name role')
    .sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // Increased to 10MB to accommodate PDFs
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('File type not supported! Please upload an image or PDF.'));
  }
});

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Configure upload based on file type
    const uploadOptions = {
      resource_type: 'auto', // This allows both images and PDFs
      folder: 'chat_attachments',
      // Optional: Add these for PDFs if you want to restrict download access
      // access_mode: 'authenticated',
      // type: 'private'
    };

    // If it's a PDF, you might want to add specific options
    if (req.file.mimetype === 'application/pdf') {
      uploadOptions.format = 'pdf';
      uploadOptions.flags = 'attachment'; // Forces download rather than preview
    }

    const result = await cloudinary.v2.uploader.upload(req.file.path, uploadOptions);

    // Clean up the local file
    fs.unlinkSync(req.file.path);

    // Return a more detailed response
    res.json({
      url: result.secure_url,
      originalName: req.file.originalname,
      filename: result.public_id,
      fileType: req.file.mimetype,
      format: result.format,
      size: result.bytes
    });

  } catch (error) {
    console.error('Upload error:', error);
    // Clean up local file if it exists
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
});

// Update multer configuration to accept PDFs

  
  // Modified message post endpoint to include attachments
  router.post('/messages', authenticateToken, async (req, res) => {
    try {
      const newMessage = new ChatMessage({
        room: req.body.room,
        sender: req.user.id,
        text: req.body.text || '',
        attachment: req.body.attachment ? {
          url: req.body.attachment.url,
          originalName: req.body.attachment.originalName,
          filename: req.body.attachment.filename
        } : null,
        timestamp: new Date()
      });
  
      const savedMessage = await newMessage.save();
      const populatedMessage = await ChatMessage.findById(savedMessage._id)
        .populate('sender', 'name role');
  
      res.status(201).json(populatedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ message: 'Error saving message', error: error.message });
    }
  });
  
  // Delete message endpoint
  router.delete('/messages/:messageId', authenticateToken, async (req, res) => {
    try {
      const message = await ChatMessage.findById(req.params.messageId);
      
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      // Check if user is the message sender
      if (message.sender.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this message' });
      }
      
      // If message has an attachment, delete the file too
      if (message.attachment) {
        // Add file deletion logic here if needed
      }
      
      await message.deleteOne();
      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ message: 'Error deleting message' });
    }
  });

// Create a new chat room (only for professionals)

// POS


router.post('/rooms', authenticateToken, async (req, res) => {
  try {
    // Check if user is a professional
    if (req.user.role !== 'professional') {
      return res.status(403).json({ message: 'Only professionals can create chat rooms' });
    }

    const newRoom = new ChatRoom({
      name: req.body.name,
      domain: req.body.domain,
      description: req.body.description,
      createdBy: req.user.id,
      professional: req.user.id
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/messages', authenticateToken, async (req, res) => {
    try {
      const newMessage = new ChatMessage({
        room: req.body.room,
        sender: req.user.id,
        text: req.body.text,
        timestamp: new Date()
      });
      app.post('/api/upload', auth, upload.single('file'), (req, res) => {
        // Handle file upload to storage (e.g., local disk, S3, etc.)
        // Return file URL
        res.json({ url: fileUrl });
      });
      
      // Delete message endpoint
      app.delete('/api/messages/:messageId',authenticateToken , async (req, res) => {
        // Delete message from database
        // Return success response
      });
      
      // In your socket.io setup:
      socket.on('delete_message', ({ roomId, messageId }) => {
        socket.to(roomId).emit('message_deleted', messageId);
      });
      const savedMessage = await newMessage.save();
      
      // Populate sender details before sending response
      const populatedMessage = await ChatMessage.findById(savedMessage._id)
        .populate('sender', 'name role');
  
      res.status(201).json(populatedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ message: 'Error saving message', error: error.message });
    }
  });
  

// Get all chat rooms
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const rooms = await ChatRoom.find()
      .populate('professional', 'name email')
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages for a specific room
router.get('/messages/:roomId', authenticateToken, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ room: req.params.roomId })
      .populate('sender', 'name role')
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.delete('/personal-messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Find the message and verify ownership
    const message = await PersonalMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if the user is the sender of the message
    if (message.from.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this message' });
    }

    await PersonalMessage.findByIdAndDelete(messageId);
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});


router.delete('/rooms/:roomId/participants/:userId', authenticateToken, async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    
    // Check if the requester is the professional of the room
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.professional.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the professional can remove participants' });
    }

    // Delete the enrollment
    await RoomEnrollment.findOneAndDelete({
      room: roomId,
      user: userId
    });

    // Emit socket event to notify the removed user
    req.app.get('io').to(roomId).emit('participant_removed', {
      roomId,
      userId,
      removedBy: req.user.id
    });

    res.json({ message: 'Participant removed successfully' });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ message: 'Error removing participant' });
  }
});

router.get('/rooms/:roomId/participants', authenticateToken, async (req, res) => {
  try {
    const enrollments = await RoomEnrollment.find({ room: req.params.roomId })
      .populate('user', '_id name email role') // Make sure to include _id
      .exec();

    const participants = enrollments
      .filter(enrollment => enrollment.user) // Filter out any enrollment without a user
      .map(enrollment => ({
        _id: enrollment.user._id,  // Ensure _id is included
        name: enrollment.user.name,
        email: enrollment.user.email,
        role: enrollment.user.role,
        enrolledAt: enrollment.createdAt
      }));

    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ message: 'Error fetching room participants', error: error.message });
  }
});
  
  router.get('/rooms/:roomId', authenticateToken, async (req, res) => {
    try {
      const room = await ChatRoom.findById(req.params.roomId).populate('professional', 'name email');
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  router.get('/rooms/:roomId/enrollment-status', authenticateToken, async (req, res) => {
    try {
        // Use req.user.id consistently instead of _id
        const enrollment = await RoomEnrollment.findOne({
            room: req.params.roomId,
            user: req.user.id  // Changed from _id to id
        });
        
        res.json({ isEnrolled: !!enrollment });
    } catch (error) {
        console.error('Error checking enrollment status:', error);
        res.status(500).json({ message: 'Error checking enrollment status' });
    }
});

router.post('/rooms/:roomId/enroll', authenticateToken, async (req, res) => {
    try {
        // First check if the room exists
        const room = await ChatRoom.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if user is already enrolled
        const existing = await RoomEnrollment.findOne({
            room: req.params.roomId,
            user: req.user.id
        });

        if (existing) {
            // Return 200 instead of 400 when already enrolled
            return res.status(200).json({ 
                message: 'Already enrolled',
                enrollment: existing,
                isEnrolled: true
            });
        }

        // Create new enrollment
        const enrollment = new RoomEnrollment({
            room: req.params.roomId,
            user: req.user.id,
            status: 'active'
        });

        await enrollment.save();

        res.status(201).json({ 
            message: 'Successfully enrolled',
            enrollment,
            isEnrolled: true
        });

    } catch (error) {
        console.error('Enrollment error details:', error);
        res.status(500).json({ 
            message: 'Error enrolling in room', 
            error: error.message 
        });
    }
});
export default router;