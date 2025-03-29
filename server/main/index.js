require('dotenv').config();
require('dotenv').config();
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const registerRoute = require('./register'); // Import signup/login routes
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const app = express();
const server = http.createServer(app);
const port = 3000;
const prisma = new PrismaClient();

console.log("Database URL:", process.env.DATABASE_URL);

app.use(express.json());

app.use(cors({
    origin: "https://text-t.onrender.com",
    methods: ['GET', 'POST'],
    credentials: true
}));

// Routes
app.use("/auth", registerRoute);

const io = new Server(server, {
    cors: {
        origin: ['https://text-t.onrender.com'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(express.static(path.join(__dirname, "../../client/dist")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/dist", "index.html"));
});



app.get("/users", async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { email: true, username: true }
        });
        res.json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

app.get("/messages/:email/:recipient", async (req, res) => {
    const { email, recipient } = req.params;

    try {
        if (!email || !recipient) {
            return res.status(400).json({ error: "Both email and recipient are required." });
        }

        console.log(`📩 Fetching messages between ${email} and ${recipient}`);

        const senderUser = await prisma.user.findUnique({ where: { email } });
        const recipientUser = await prisma.user.findUnique({ where: { email: recipient } });

        if (!senderUser || !recipientUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: senderUser.id, receiverId: recipientUser.id },
                    { senderId: recipientUser.id, receiverId: senderUser.id }
                ]
            },
            orderBy: { timestamp: "asc" },
            include: { sender: true }
        });

        console.log("✅ Messages Fetched:", messages);

        const formattedMessages = messages.map(msg => ({
            sender: msg.sender.email,
            message: msg.content
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const users = {};

io.on('connection', (socket) => {
    console.log(`🔗 User connected: ${socket.id}`);

    socket.on('register', (username, email) => {
        if (!username || !email) return;
        const formattedEmail = email.trim().toLowerCase();
        users[formattedEmail] = socket.id;
        console.log(`✅ Registered: ${username} (${formattedEmail}) - Socket: ${socket.id}`);
        io.emit('userList', Object.keys(users));
    });

    socket.on('privateMessage', async ({ sender, recipient, message }) => {
        try {
            const senderEmail = sender.trim().toLowerCase();
            const recipientEmail = recipient.trim().toLowerCase();
            console.log(`📩 Attempting to send message from ${senderEmail} to ${recipientEmail}`);

            const recipientSocketId = users[recipientEmail];
            console.log("recipientSocketId = ", recipientSocketId);

            if (recipientSocketId) {
                io.to(recipientSocketId).emit("receiveMessage", {
                    sender: senderEmail,
                    message
                });
                console.log(`📤 Message sent to online user ${recipientEmail}`);
            } else {
                console.log(`📥 User ${recipientEmail} is offline. Message stored.`);
            }

            const senderUser = await prisma.user.findUnique({ where: { email: senderEmail } });
            const recipientUser = await prisma.user.findUnique({ where: { email: recipientEmail } });

            if (!senderUser || !recipientUser) {
                console.error("❌ Error: One or both users not found in the database.");
                return;
            }

            await prisma.message.create({
                data: {
                    senderId: senderUser.id,
                    receiverId: recipientUser.id,
                    content: message
                }
            });

            console.log("✅ Message saved in DB.");
        } catch (error) {
            console.error("❌ Error sending message:", error);
        }
    });

    socket.on('disconnect', () => {
        const email = Object.keys(users).find(key => users[key] === socket.id);
        if (email) {
            delete users[email];
            console.log(`❌ ${email} disconnected.`);
        }

        io.emit('userList', Object.keys(users));
    });
});

server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
