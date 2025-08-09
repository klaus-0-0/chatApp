// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const authentication = require('./authentication'); // Your auth routes
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);

// Setup Socket.io server
const io = new Server(server, {
  cors: {
    origin: "https://whatsapp-32fo.onrender.com", // frontend
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'], // OPTIONS for preflight
    credentials: true,
  },
});

// Express Middleware
app.use(cors({
  origin: "https://whatsapp-32fo.onrender.com",
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'], // OPTIONS for preflight
  credentials: true,
}));

app.use(express.json());
app.use("/auth", authentication);


function generateRoomId(user1, user2) {
  return [user1, user2].sort().join('_');
}

io.on('connection', (socket) => {

  console.log(`✅ New user connected: ${socket.id}`);
  socket.on('joinPersonalRoom', (number) => {
    socket.join(number);
    console.log(`User ${number} joined personal room`);
  });

  // Join chat room for two users
  socket.on('joinRoom', ({ from, to }) => {
    const roomId = generateRoomId(from, to);
    socket.join(roomId);
    console.log(`User ${from} joined chat room: ${roomId}`);
  });

socket.on('chatMessage', (msg) => {
    const { from, to } = msg;
    const roomId = generateRoomId(from, to);
    const roomSockets = io.sockets.adapter.rooms.get(roomId);

    // Only broadcast to others, not back to sender
    if (roomSockets && roomSockets.size >= 2) {
        socket.to(roomId).emit('chatMessage', msg); // Send to others in room
    } else {
        io.to(to).emit('chatMessage', msg); // Send to recipient
    }
    
    // No need to send back to sender - they already have it
});


  // Backend
  socket.on('markAsDelivered', async ({ messageId, from, to }) => {
    if (!messageId) return;

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { status: 'delivered' },
    });

    const roomId = generateRoomId(from, to);
    io.to(roomId).emit('updateMessageStatus', {
      messageId: updated.id,
      status: updated.status,
    });
  });

  socket.on('markAsSeen', async ({ messageId, from, to }) => {
    if (!messageId) return;

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { status: 'seen' },
    });

    const roomId = generateRoomId(from, to);
    io.to(roomId).emit('updateMessageStatus', {
      messageId: updated.id,
      status: updated.status,
    });
  });


  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


// 🚀 Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
