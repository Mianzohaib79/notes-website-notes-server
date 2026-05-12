const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        // Join a specific note room
        socket.on("join-note", (noteId) => {
            socket.join(noteId);
            console.log(`User ${socket.id} joined note ${noteId}`);
        });

        // Real-time editing coordination
        socket.on("edit-note", (data) => {
            const { noteId, content } = data;
            // Broadcast changes to everyone in the room except the sender
            socket.to(noteId).emit("note-updated", content);
        });

        // Notifications for shared notes
        socket.on("send-notification", (data) => {
            const { userId, message } = data;
            // Emit to a room named after the userId
            io.to(userId).emit("new-notification", message);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
};

module.exports = socketHandler;
