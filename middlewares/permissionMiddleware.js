const Note = require("../models/Note");
const User = require("../models/User");
const mongoose = require("mongoose");

const checkOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { uid } = req;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid note ID format" });
        }

        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ message: "User not found" });

        const note = await Note.findById(id);

        if (!note) return res.status(404).json({ message: "Note not found" });

        if (!note.createdBy || note.createdBy.toString() === user._id.toString()) {
            req.note = note;
            req.userObj = user;
            return next();
        }

        return res.status(403).json({ message: "Access denied: Owner only" });
    } catch (error) {
        console.error("checkOwner middleware error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const checkEditor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { uid } = req;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid note ID format" });
        }

        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ message: "User not found" });

        const note = await Note.findById(id);

        if (!note) return res.status(404).json({ message: "Note not found" });

        // Owner is always an editor
        if (!note.createdBy || note.createdBy.toString() === user._id.toString()) {
            req.note = note;
            req.userObj = user;
            return next();
        }

        // Check shared permissions
        const share = note.sharedWith && note.sharedWith.find(s => s.userId && s.userId.toString() === user._id.toString());
        if (share && share.permission === "editor") {
            req.note = note;
            req.userObj = user;
            return next();
        }

        return res.status(403).json({ message: "Access denied: Editor permission required" });
    } catch (error) {
        console.error("checkEditor middleware error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const checkViewer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { uid } = req;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid note ID format" });
        }

        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ message: "User not found" });

        const note = await Note.findById(id);

        if (!note) return res.status(404).json({ message: "Note not found" });

        // Owner is always a viewer
        if (!note.createdBy || note.createdBy.toString() === user._id.toString()) {
            req.note = note;
            req.userObj = user;
            return next();
        }

        // Check shared permissions
        const share = note.sharedWith && note.sharedWith.find(s => s.userId && s.userId.toString() === user._id.toString());
        if (share) {
            req.note = note;
            req.userObj = user;
            return next();
        }

        return res.status(403).json({ message: "Access denied: Viewer permission required" });
    } catch (error) {
        console.error("checkViewer middleware error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = {
    checkOwner,
    checkEditor,
    checkViewer
};
