const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const { login, register, getProfile, updateProfile } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", verifyToken, getProfile);
router.patch("/user-update", verifyToken, updateProfile);

module.exports = router;