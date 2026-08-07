import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import connectDB from './config/db';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Socket.io
export const io = new Server(server, {
  cors: {
    origin: '*', // Customize in production
    methods: ['GET', 'POST']
  }
});

// Configure Socket.io connections
import { socketHandler } from './socket/socketHandler';
socketHandler(io);

// Connect to Database
connectDB();

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import swipeRoutes from './routes/swipeRoutes';
import chatRoutes from './routes/chatRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swipes', swipeRoutes);
app.use('/api/chats', chatRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
