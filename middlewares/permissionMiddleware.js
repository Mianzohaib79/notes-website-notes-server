const Note = require("../models/Note");
const User = require("../models/User");

const checkOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { uid } = req;
        const user = await User.findOne({ uid });
        const note = await Note.findById(id);

        if (!note) return res.status(404).json({ message: "Note not found" });

        if (note.createdBy.toString() === user._id.toString()) {
            return next();
        }

        return res.status(403).json({ message: "Access denied: Owner only" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const checkEditor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { uid } = req;
        const user = await User.findOne({ uid });
        const note = await Note.findById(id);

        if (!note) return res.status(404).json({ message: "Note not found" });

        // Owner is always an editor
        if (note.createdBy.toString() === user._id.toString()) {
            return next();
        }

        // Check shared permissions
        const share = note.sharedWith.find(s => s.userId.toString() === user._id.toString());
        if (share && share.permission === "editor") {
            return next();
        }

        return res.status(403).json({ message: "Access denied: Editor permission required" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const checkViewer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { uid } = req;
        const user = await User.findOne({ uid });
        const note = await Note.findById(id);

        if (!note) return res.status(404).json({ message: "Note not found" });

        // Owner is always a viewer
        if (note.createdBy.toString() === user._id.toString()) {
            return next();
        }

        // Check shared permissions
        const share = note.sharedWith.find(s => s.userId.toString() === user._id.toString());
        if (share) {
            return next();
        }

        return res.status(403).json({ message: "Access denied: Viewer permission required" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    checkOwner,
    checkEditor,
    checkViewer
};
