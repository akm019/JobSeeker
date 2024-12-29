import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import bodyParser from "body-parser";
import connectDB from './Config/db.js';
import authRoutes from './Routes/authRoutes.js';
import profileRoute from './Routes/profileRoute.js';
import JobRoutes from './Routes/JobRoutes.js';
import chatRoutes from './Routes/ChatRoutes.js';
import { Server } from "socket.io";
import ChatMessage from './Models/ChatMessage.js'; // Add this import

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api', authRoutes);
app.use('/api', profileRoute);
app.use('/api', JobRoutes);
app.use('/api', chatRoutes);

// Database Connection
connectDB();

// In your socket.io setup file
// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining a personal room
  socket.on('join_personal_room', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined personal room ${userId}`);
  });

  // Handle joining a chat room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Handle leaving a room
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  // Handle sending a personal message
  socket.on('send_personal_message', (message) => {
    console.log('Sending personal message to:', message.to);
    io.to(message.to).emit('receive_personal_message', message);
  });
  
  // Handle deleting a personal message
  socket.on('delete_personal_message', ({ messageId, to }) => {
    console.log('Deleting message:', messageId);
    io.to(to).emit('personal_message_deleted', messageId);
  });

  // Handle sending a room message
  socket.on('send_message', async ({ roomId, message }) => {
    try {
      io.to(roomId).emit('receive_message', message);
    } catch (error) {
      console.error('Error broadcasting message:', error);
      socket.emit('message_error', { error: 'Failed to broadcast message' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
// Start server
server.listen(PORT, () => {
  console.log(`Server is running at Port ${PORT}`);
});