const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" }, // Supports rich text (HTML string)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isLocked: { type: Boolean, default: false },
    sharedWith: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        permission: { type: String, enum: ["viewer", "editor"], default: "viewer" },
        addedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Add index for search
noteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model("Note", noteSchema);
