import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true},
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
}, {timestamps: true})


const admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema)

export default admin;