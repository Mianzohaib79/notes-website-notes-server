const mongoose = require("mongoose");

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    const { MONGO_USERNAME, MONGO_PASSWORD } = process.env;

    if (!MONGO_USERNAME || !MONGO_PASSWORD) {
        console.error("MongoDB credentials missing in environment variables!");
        throw new Error("MongoDB credentials missing");
    }

    const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.prhecp0.mongodb.net/?appName=Cluster0`;
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully.");
};

module.exports = { connectDB };
