const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    actionType: { 
        type: String, 
        required: true,
        enum: ["note_created", "note_edited", "note_shared", "permission_changed", "note_locked", "note_unlocked"]
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    details: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Activity", activitySchema);
