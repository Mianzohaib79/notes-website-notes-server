const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(401).json({ message: "Email is already in use.", isError: true });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const uid = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

        const newUser = new User({
            uid,
            name,
            email,
            password: hashedPassword,
            profileImage: req.body.profileImage || "" // Cloudinary URL if provided
        });

        await newUser.save();
        const userResponse = await User.findOne({ uid: newUser.uid }).select("-password");
        res.status(201).json({ message: "A new user has been successfully created", user: userResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", isError: true });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password", isError: true });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            const { uid, email: userEmail, name } = user;
            const token = jwt.sign({ uid, email: userEmail }, process.env.JWT_SECRET || "codevpk", { expiresIn: "1d" });

            // Return full user object (excluding password)
            const userResponse = await User.findOne({ uid }).select("-password");

            res.status(200).json({ message: "Login successful", token, user: userResponse });
        } else {
            res.status(401).json({ message: "Invalid email or password", isError: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", isError: true });
    }
};

const getProfile = async (req, res) => {
    try {
        const { uid } = req;
        const user = await User.findOne({ uid }).select("-password").exec();
        if (!user) {
            return res.status(401).json({ message: "User not found", isError: true });
        }
        res.status(200).json({ message: "User found", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", isError: true });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { uid } = req;
        const { name, profileImage } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { uid },
            { name, profileImage },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(401).json({ message: "User not found", isError: true });
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", isError: true });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};
