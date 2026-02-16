// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const authentication = require('./authentication');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://text-t.onrender.com", 
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    credentials: true,
  },
});

app.use(cors({
  origin: "https://text-t.onrender.com",
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());
app.use("/auth", authentication);

// 🔹 Unique chat room between two users (using IDs now)
// 🔹 Unique chat room between two users (using IDs)
function generateRoomId(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}

io.on('connection', (socket) => {
  console.log(`✅ New user connected: ${socket.id}`);

  // Join personal room for user-specific events
  socket.on('joinPersonalRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined personal room`);
  });

  // Join private chat room between two users
  socket.on('joinRoom', ({ senderId, receiverId }) => {
    const roomId = generateRoomId(senderId, receiverId);
    socket.join(roomId);
    console.log(`User ${senderId} joined chat room: ${roomId}`);
  });

  // Handle sending a message
  socket.on('chatMessage', async (msg) => {
    const { senderId, receiverId } = msg;
    const roomId = generateRoomId(senderId, receiverId);
    const roomSockets = io.sockets.adapter.rooms.get(roomId);

    // Get user info for the message
    try {
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { id: true, username: true, number: true }
      });

      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { id: true, username: true, number: true }
      });

      // Add user info to the message
      const enrichedMsg = {
        ...msg,
        sender,
        receiver
      };

      if (roomSockets && roomSockets.size >= 2) {
        // Both users online in chat → broadcast inside room
        socket.to(roomId).emit('chatMessage', enrichedMsg);
      } else {
        // Receiver not in room → send via personal room
        io.to(receiverId).emit('chatMessage', enrichedMsg);
      }
    } catch (error) {
      console.error('Error enriching message:', error);
    }
  });

  // ✅ Mark single message delivered
  socket.on('markAsDelivered', async ({ messageId, senderId, receiverId }) => {
    if (!messageId) return;

    try {
      const updated = await prisma.message.update({
        where: { id: messageId },
        data: { status: 'delivered' },
      });

      const roomId = generateRoomId(senderId, receiverId);
      io.to(roomId).emit('updateMessageStatus', {
        messageId: updated.id,
        status: updated.status,
      });
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  });

  // ✅ Mark ALL messages sender → receiver as seen when chat is opened
  socket.on('markChatAsSeen', async ({ senderId, receiverId }) => {
    if (!senderId || !receiverId) return;

    try {
      // Update all delivered messages
      await prisma.message.updateMany({
        where: {
          senderId: senderId,
          receiverId: receiverId,
          status: 'delivered',
        },
        data: { status: 'seen' },
      });

      const roomId = generateRoomId(senderId, receiverId);

      // Notify room that all messages are seen
      io.to(roomId).emit('chatSeen', {
        senderId,
        receiverId,
      });

      console.log(`👀 Chat marked as seen: ${senderId} -> ${receiverId}`);
    } catch (error) {
      console.error('Error marking chat as seen:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
