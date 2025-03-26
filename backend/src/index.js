const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');

const port = 3000;
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Store active users { username: socketId }
const users = {};

io.on('connection', (socket) => {           // ✅ Now "socket" is defined!
    console.log('A user connected:', socket.id);

    // Register a user with their name
    socket.on('register', (username) => {
        console.log("🔹 Register event received!");
        console.log("➡️ Data received:", username);

        if (!username) {
            console.log("⚠️ ERROR: Username is missing or undefined!");
            return;
        }

        users[username] = socket.id;
        console.log(`✅ User Registered -> Username: ${username}, Socket ID: ${socket.id}`);

        io.emit('userList', Object.keys(users));
    });

    // Handle private messaging
    socket.on('privateMessage', ({ sender, recipient, message }) => {
        const recipientSocketId = users[recipient];

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receiveMessage', { sender, message });
        } else {
            console.log(`User ${recipient} not found!`);
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        const username = Object.keys(users).find(key => users[key] === socket.id);
        if (username) {
            delete users[username];
            console.log(`${username} disconnected`);
        }

        io.emit('userList', Object.keys(users));
    });
});

server.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
