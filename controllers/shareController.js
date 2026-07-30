const Note = require("../models/Note");
const User = require("../models/User");
const Activity = require("../models/Activity");

const shareNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, permission } = req.body; // Share with email
        const { uid } = req;

        const owner = await User.findOne({ uid });
        const note = await Note.findById(id);

        if (!owner) return res.status(404).json({ message: "Owner not found" });
        if (!note) return res.status(404).json({ message: "Note not found" });
        if (note.createdBy.toString() !== owner._id.toString()) {
            return res.status(403).json({ message: "Only the owner can share high-level permissions" });
        }

        const userToShareWith = await User.findOne({ email });
        if (!userToShareWith) {
            return res.status(404).json({ message: "User to share with not found" });
        }

        // Check if already shared
        const existingShare = note.sharedWith.find(s => s.userId.toString() === userToShareWith._id.toString());
        if (existingShare) {
            existingShare.permission = permission;
        } else {
            note.sharedWith.push({ userId: userToShareWith._id, permission });
        }

        await note.save();

        const pusher = require("../config/pusher");
        try {
            await pusher.trigger("notes-channel", "note-shared", {
                message: `${owner.name} shared a note with you: ${note.title}`,
                note,
                sharedWithUserId: userToShareWith._id
            });
        } catch (pusherErr) {
            console.error("Pusher note-shared error (non-fatal):", pusherErr.message);
        }

        // Emit real-time notification via socket.io if available
        const io = req.app.get("io");
        if (io) {
            // We use the shared user's uid as the room name for personal notifications
            io.to(userToShareWith.uid).emit("new-notification", {
                type: "note_shared",
                message: `${owner.name} shared a note with you: ${note.title}`,
                noteId: note._id
            });
        }

        // Track activity
        await new Activity({
            actionType: "note_shared",
            userId: owner._id,
            noteId: note._id,
            details: `Shared with ${email} as ${permission}`
        }).save();

        res.status(200).json({ message: `Note shared with ${email} as ${permission}`, note });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updatePermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, permission } = req.body;
        const { uid } = req;

        const owner = await User.findOne({ uid });
        const note = await Note.findById(id);

        if (!owner) return res.status(404).json({ message: "Owner not found" });
        if (!note) return res.status(404).json({ message: "Note not found" });

        if (note.createdBy.toString() !== owner._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const sharedUser = note.sharedWith.find(s => s.userId.toString() === userId);
        if (!sharedUser) return res.status(404).json({ message: "User not in share list" });

        sharedUser.permission = permission;
        await note.save();

        res.status(200).json({ message: "Permission updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const removeUserFromShare = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const { uid } = req;

        const owner = await User.findOne({ uid });
        const note = await Note.findById(id);

        if (!owner) return res.status(404).json({ message: "Owner not found" });
        if (!note) return res.status(404).json({ message: "Note not found" });

        if (note.createdBy.toString() !== owner._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        note.sharedWith = note.sharedWith.filter(s => s.userId.toString() !== userId);
        await note.save();

        res.status(200).json({ message: "User removed from share list" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    shareNote,
    updatePermission,
    removeUserFromShare
};
