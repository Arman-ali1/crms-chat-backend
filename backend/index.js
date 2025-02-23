// server.js
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './src/db/dbconn.js'; // Updated MongoDB connection
import Chat from './src/module/chat.module.js';  // This should be a Mongoose model

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// REST endpoint to fetch chat messages
app.get('/api/chats', async (req, res) => {
  try {
    // Using Mongoose: find all chats and sort by createdAt in ascending order
    const chats = await Chat.find({}).sort({ createdAt: 1 });
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // adjust as needed
    methods: ['GET', 'POST'],
  },
});


io.on('connection', async (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Send chat history upon connection
  try {
    const chatHistory = await Chat.find({}).sort({ createdAt: 1 });
    console.log('Sending chat history:', chatHistory);
    socket.emit('receive_message', chatHistory);
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
  }

  // Handle new message event
  socket.on('send_message', async (data) => {
    // Expecting: { author, message, userId, targetUserId }
    const { author, message, userId, targetUserId } = data;
    try {
      await Chat.create({ author, message, userId, targetUserId });
      console.log('Chat created');
      const updatedChats = await Chat.find({}).sort({ createdAt: 1 });
      io.emit('receive_message', updatedChats);
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  });

  // Handle delete message event
  socket.on('delete_message', async (messageId) => {
    console.log('Received delete_message event for ID:', messageId);
    try {
      // Use findByIdAndDelete to remove the document by its _id
      const deleted = await Chat.findByIdAndDelete(messageId);
      if (!deleted) {
        console.log('No chat found with ID:', messageId);
      } else {
        console.log(`Chat with id ${messageId} deleted successfully.`);
      }
      const updatedChats = await Chat.find({}).sort({ createdAt: 1 });
      io.emit('receive_message', updatedChats);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  });
});

const PORT = process.env.PORT || 7000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
