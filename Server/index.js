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
import resumeRouter from './Routes/resumeRoutes.js'
import interview from './Routes/interviewRoutes.js'
import quizRouter from './Routes/quizRoutes.js'
import ChatMessage from './Models/ChatMessage.js'; // Add this import

dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
// Initialize Socket.IO with CORS - Update this part
const io = new Server(server, {
  cors: {
    origin: "https://jobseeker-inky.vercel.app", // Your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin:'*',
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/resume',resumeRouter)
app.use('/api/quiz',quizRouter)
app.use('/api', authRoutes);
app.use('/api', profileRoute);
app.use('/api', JobRoutes);
app.use('/api', chatRoutes);
app.use('/api/interview',interview)

// Database Connection
connectDB();
import session from 'express-session';

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
// In your socket.io setup file
// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join personal chat room
  socket.on('join_personal_chat', (roomId) => {
    socket.join(roomId);
    console.log(`User joined personal chat: ${roomId}`);
  });

  // Send personal message
  socket.on('send_personal_message', ({ message, room }) => {
    console.log('Broadcasting to room:', room, 'Message:', message);
    socket.to(room).emit('receive_personal_message', message);
  });

  // Delete personal message
  socket.on('delete_personal_message', ({ messageId, room }) => {
    socket.to(room).emit('message_deleted', { messageId });
  });

  // Handle room chat
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room ${roomId}`);
  });

  socket.on('send_message', async ({ roomId, message }) => {
    io.to(roomId).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
// Start server
server.listen(PORT, () => {
  console.log(`Server is running at Port ${PORT}`);
});