const Note = require("../models/Note");
const Activity = require("../models/Activity");
const User = require("../models/User");
const mongoose = require("mongoose");

const createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const { uid } = req; // From auth middleware
        
        const user = await User.findOne({ uid });
        
        const newNote = new Note({
            title,
            content,
            createdBy: user._id,
        });

        await newNote.save();

        // Track activity
        await new Activity({
            actionType: "note_created",
            userId: user._id,
            noteId: newNote._id
        }).save();

        res.status(201).json({ message: "Note created successfully", note: newNote });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", isError: true });
    }
};

const getNotes = async (req, res) => {
    try {
        const { uid } = req;
        const user = await User.findOne({ uid });

        // Get notes created by user or shared with user
        const notes = await Note.find({
            $or: [
                { createdBy: user._id },
                { "sharedWith.userId": user._id }
            ]
        }).populate("createdBy", "name email").sort({ updatedAt: -1 });

        res.status(200).json({ notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", isError: true });
    }
};

const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findById(id).populate("createdBy", "name email");
        if (!note) {
            return res.status(404).json({ message: "Note not found", isError: true });
        }
        res.status(200).json({ note });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", isError: true });
    }
};

const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, isLocked } = req.body;
        const { uid } = req;

        const user = await User.findOne({ uid });


        const note = await Note.findById(id);
        if (!note) return res.status(404).json({ message: "Note not found" });

        // Update note
        note.title = title || note.title;
        note.content = content || note.content;
        note.isLocked = isLocked !== undefined ? isLocked : note.isLocked;
        note.lastEditedBy = user._id;

        await note.save();

        // Track activity
        await new Activity({
            actionType: "note_edited",
            userId: user._id,
            noteId: note._id
        }).save();

        res.status(200).json({ message: "Note updated successfully", note });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", isError: true });
    }
};

const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req;

        const user = await User.findOne({ uid });


        const note = await Note.findById(id);
        if (!note) return res.status(404).json({ message: "Note not found" });

        // Only owner can delete
        if (note.createdBy.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: Only the owner can delete this note" });
        }

        await Note.findByIdAndDelete(id);
        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", isError: true });
    }
};

const searchNotes = async (req, res) => {
    try {
        const { query } = req.query;
        const { uid } = req;
        const user = await User.findOne({ uid });

        const notes = await Note.find({
            $and: [
                { $or: [{ createdBy: user._id }, { "sharedWith.userId": user._id }] },
                { $text: { $search: query } }
            ]
        }).sort({ updatedAt: -1 });

        res.status(200).json({ notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid note ID", isError: true });
        }

        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isFavorite = user.favorites.some(f => f.toString() === id);
        
        const update = isFavorite 
            ? { $pull: { favorites: id } } 
            : { $addToSet: { favorites: id } };

        const updatedUser = await User.findOneAndUpdate({ uid }, update, { new: true }).select("-password");

        res.status(200).json({ 
            message: isFavorite ? "Removed from favorites" : "Added to favorites", 
            isFavorite: !isFavorite,
            user: updatedUser 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getFavorites = async (req, res) => {
    try {
        const { uid } = req;
        const user = await User.findOne({ uid }).populate("favorites");
        res.status(200).json({ favorites: user.favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getSharedNotes = async (req, res) => {
    try {
        const { uid } = req;
        const user = await User.findOne({ uid });

        const notes = await Note.find({ "sharedWith.userId": user._id }).populate("createdBy", "name email");
        res.status(200).json({ notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
    searchNotes,
    toggleFavorite,
    getFavorites,
    getSharedNotes
};

