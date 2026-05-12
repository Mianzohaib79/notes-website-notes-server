const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const { checkOwner, checkEditor, checkViewer } = require("../middlewares/permissionMiddleware");
const { createNote, getNotes, getNoteById, updateNote, deleteNote, searchNotes, getFavorites, toggleFavorite, getSharedNotes } = require("../controllers/noteController");
const { shareNote, updatePermission, removeUserFromShare } = require("../controllers/shareController");

const router = express.Router();

// Notes CRUD
router.post("/", verifyToken, createNote);
router.get("/", verifyToken, getNotes);
router.get("/search", verifyToken, searchNotes);
router.get("/favorites", verifyToken, getFavorites);
router.post("/:id/favorite", verifyToken, toggleFavorite);
router.get("/shared", verifyToken, getSharedNotes);
router.get("/:id", verifyToken, checkViewer, getNoteById);
router.put("/:id", verifyToken, checkEditor, updateNote);
router.delete("/:id", verifyToken, checkOwner, deleteNote);

// Sharing
router.post("/:id/share", verifyToken, checkOwner, shareNote);
router.put("/:id/permission", verifyToken, checkOwner, updatePermission);
router.delete("/:id/remove-user", verifyToken, checkOwner, removeUserFromShare);

module.exports = router;
