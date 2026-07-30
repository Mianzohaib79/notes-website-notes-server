const mongoose = require("mongoose");

const connectDB = async () => {
    // Agar already connected hai to log dikha kar return ho jaye
    if (mongoose.connection.readyState >= 1) {
        console.log("⚡ MongoDB is already connected.");
        return;
    }

    const { MONGO_USERNAME, MONGO_PASSWORD } = process.env;

    if (!MONGO_USERNAME || !MONGO_PASSWORD) {
        console.error("❌ MongoDB credentials missing in environment variables!");
        throw new Error("MongoDB credentials missing");
    }

    const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.prhecp0.mongodb.net/notes_db?appName=Cluster0`;

    try {
        await mongoose.connect(uri);
        console.log("✅ MongoDB connected successfully.");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        throw error;
    }
};

module.exports = { connectDB };