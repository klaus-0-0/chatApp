require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

console.log("Database URL:", process.env.DATABASE_URL); // Debugging


//  Register Route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    } 

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);  
 
    // Save user to the database
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

//  Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/search', async (req, res) => {
  const { username } = req.body; // Username to search for

  try {
    // Fetch users whose username contains the input string (case-insensitive search)
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username, // Search for usernames containing the input string
          mode: 'insensitive', // Make the search case-insensitive
        }
      },
      select: {
        id: true, // Select user id
        username: true, // Select username
        email: true,
      }
    });

    if (users.length === 0) {
      return res.status(404).json({ error: 'No matching users found' });
    }

    // Return the list of matching users (usernames only)
    res.status(200).json({ message: "success", users });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/user-details', async (req, res) => {
  const { userId } = req.body; // User ID passed after selecting a username

  try {
    // Fetch the details of the selected user using the user ID
    const userDetails = await prisma.user.findUnique({
      where: {
        id: userId, // Get the user by ID
      },
    });
 
    if (!userDetails) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the details of the selected user
    res.status(200).json({ message: "success", userDetails });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  } 
});


module.exports = router;
