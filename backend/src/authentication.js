const bcrypt = require('bcrypt');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require("jsonwebtoken");

const router = express.Router();
const prisma = new PrismaClient();

// Signup
router.post("/signup", async (req, res) => {
    const { username, number, password } = req.body;

    try {
        if (!username || !number || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await prisma.user.findUnique({ where: { number } });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (number.length !== 10) {
            return res.status(400).json({ message: "Number must be 10 digits" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { username, number, password: hashedPassword }
        });
        const token = jwt.sign({ id: newUser.id }, process.env.TOKEN, { expiresIn: "1h" })
        res.status(200).json({ message: "Signed up successfully", user: newUser, token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { number, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { number } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const token = jwt.sign({ id: newUser.id }, process.env.TOKEN, { expiresIn: "1h" });
        res.status(200).json({ message: "Login succeeded", user,token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server issue" });
    }
});

// Search user by number
router.post("/searchNumber", async (req, res) => {
    const { number } = req.body;

    try {
        const userData = await prisma.user.findUnique({ where: { number } });

        if (userData) {
            res.status(200).json({
                message: "Number found",
                userData: { number: userData.number, username: userData.username, id: userData.id }
            });
        } else {
            res.status(404).json({ message: "User number not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server issue" });
    }
});

// Save message to DB
router.post('/sendMessages', async (req, res) => {
    const { senderId, receiverId, content } = req.body;

    try {
        const newMsg = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content,
                status: "sent"
            },
        });
        res.status(201).json({ message: "Message saved successfully", messageId: newMsg.id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server issue" });
    }
});

// Get messages for a user (both sent and received)
router.get('/fetchmessages/:userId', async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: req.params.userId },
                    { receiverId: req.params.userId }
                ]
            },
            orderBy: { timestamp: 'desc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        number: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        number: true
                    }
                }
            }
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get contacts for a user
router.get('/contacts/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get all unique users that the current user has chatted with
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        number: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        number: true
                    }
                }
            }
        });

        // Extract unique contacts
        const contactsMap = new Map();
        
        messages.forEach(message => {
            if (message.sender.id !== userId) {
                contactsMap.set(message.sender.id, message.sender);
            }
            if (message.receiver.id !== userId) {
                contactsMap.set(message.receiver.id, message.receiver);
            }
        });

        const contacts = Array.from(contactsMap.values());
        res.status(200).json(contacts);

    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
