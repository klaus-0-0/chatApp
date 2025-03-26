const express = require("express"); // ❌ Removed destructuring
const { Server } = require("socket.io");
const http = require("http");

const port = 3000;
const app = express();
const server = http.createServer(app);
// Store connected users
const users = {}; // { socketId: username }

app.get("/", (req, res) => {
    res.send("Server is running...");
});

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST"],
        credentials: true,
    }
});

io.on("connection", (socket) => {
    console.log(" A user connected:", socket.id);

    socket.on("register", (username) => {
        if (!username) return; // Prevent empty usernames
        users[socket.id] = username;
        console.log(" Registered user:", username);
        console.log(" Current users:", Object.values(users));

        io.emit("userList", Object.values(users)); // Send updated user list to all clients
    });

    socket.on("privateMessage", ({ sender, recipient, message }) => {
        console.log(` Message from ${sender} to ${recipient}: ${message}`);
        const recipientSocketId = Object.keys(users).find((id) => users[id] === recipient);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("receiveMessage", { sender, message });
        }
    });

    socket.on("disconnect", () => {
        console.log(" User disconnected:", socket.id);
        delete users[socket.id]; // Remove user from list
        console.log(" Updated users list:", Object.values(users));

        io.emit("userList", Object.values(users)); // Send updated user list
    });

    // Send user list to the newly connected user
    socket.emit("userList", Object.values(users));
});

server.listen(port, () => {
    console.log(` Server is running on port ${port}`);
});
