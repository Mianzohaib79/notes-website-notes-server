const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" }, // Cloudinary URL
    role: { type: String, enum: ["user", "admin"], default: "user" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
