require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("./config/db");

const auth = require("./routes/auth");
const notes = require("./routes/notes");
const socketHandler = require("./sockets/socketHandler");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["https://notes-website-jjak.vercel.app"],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
    }
});
app.set("io", io);
app.use(cors());
app.use(express.json());
app.use("/auth", auth);
app.use("/notes", notes);

app.get("/", (req, res) => {
    res.send({ status: "Server is running", time: new Date().toLocaleString() });
});

app.get("/health-check", (req, res) => {
    res.send({ status: "ok", features: ["auth", "notes", "sockets"] });
});

socketHandler(io);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: "Something broke!", error: err.message });
});

const PORT = parseInt(process.env.PORT, 10) || 8000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server is running on PORT ${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to connect DB, server not started:", err.message);
});