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
import ChatMessage from './Models/ChatMessage.js';
import session from 'express-session';

dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Most permissive CORS settings
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// Standard middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH', 'OPTIONS'],
  allowedHeaders: '*',
  credentials: false
}));

app.use(express.json());
app.use(bodyParser.json());

// Socket.IO setup with permissive CORS
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["*"],
    credentials: false
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true // Enable Socket.IO v3 compatibility
});

// Make io accessible to routes
app.set('io', io);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Routes
app.use('/api/resume', resumeRouter);
app.use('/api/quiz', quizRouter);
app.use('/api', authRoutes);
app.use('/api', profileRoute);
app.use('/api', JobRoutes);
app.use('/api', chatRoutes);
app.use('/api/interview', interview);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_personal_chat', (roomId) => {
    socket.join(roomId);
    console.log(`User joined personal chat: ${roomId}`);
  });

  socket.on('send_personal_message', ({ message, room }) => {
    console.log('Broadcasting to room:', room, 'Message:', message);
    socket.to(room).emit('receive_personal_message', message);
  });

  socket.on('delete_personal_message', ({ messageId, room }) => {
    socket.to(room).emit('message_deleted', { messageId });
  });

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

// Database Connection
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running at Port ${PORT}`);
});

