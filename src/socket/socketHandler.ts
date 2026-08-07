import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message';
import Chat from '../models/Chat';
import User from '../models/User';

export const socketHandler = (io: Server) => {
  // Authentication middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
      if (err) return next(new Error('Authentication error'));
      socket.data.userId = decoded.id;
      next();
    });
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User connected to socket: ${userId}`);

    // Join personal room for global notifications (matches, etc.)
    socket.join(`user_${userId}`);

    // Join specific chat room
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User ${userId} joined chat ${chatId}`);
    });

    // Send a message
    socket.on('send_message', async (data) => {
      const { chatId, content, imageUrl } = data;

      try {
        // Save message to DB
        const newMessage = await Message.create({
          chatId,
          senderId: userId,
          content,
          imageUrl,
        });

        // Update lastMessage on Chat
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: content || 'Image',
          updatedAt: new Date(),
        });

        // Emit message to everyone in the chat room
        io.to(`chat_${chatId}`).emit('receive_message', newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Typing indicators
    socket.on('typing', ({ chatId, isTyping }) => {
      // Emit to everyone in the chat EXCEPT the sender
      socket.to(`chat_${chatId}`).emit('typing', { userId, isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });
};
