require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("./config/db");

// Routes
const auth = require("./routes/auth");
const notes = require("./routes/notes");

// Sockets
const socketHandler = require("./sockets/socketHandler");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://notes-website-jjak.vercel.app"], // Adjust in production
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
    }
});

// Attach io to app to access in controllers
app.set("io", io);

// Middlewares
app.use(cors());
app.use(express.json());

// DB Connection
connectDB();

// API Routes
app.use("/auth", auth);
app.use("/notes", notes);

// Basic Endpoints
app.get("/", (req, res) => {
    res.send({ status: "Server is running", time: new Date().toLocaleString() });
});

app.get("/health-check", (req, res) => {
    res.send({ status: "ok", features: ["auth", "notes", "sockets"] });
});

// Socket.io initialization
socketHandler(io);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: "Something broke!", error: err.message });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});