const mongoose = require("mongoose")

const { Schema } = mongoose

const schema = new Schema({
    uid: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    states: { type: String, default: "active" },
    role: { type: [String], default: "student" },
    timezone: { type: String, default: "" },
}, { timestamps: true })

const Users = mongoose.model("users", schema)

module.exports = Users