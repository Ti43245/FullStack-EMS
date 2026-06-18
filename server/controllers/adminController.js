import Admin from "../models/Admin.js";
import bcrypt from "bcrypt"
import User from '../models/User.js'

// GET ADMINS
// GET /api/admins
export const getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({}).sort({createdAt: -1}).populate("userId", "role").lean()
        // console.log('Admins: ', admins)
        return res.json(admins)
    } catch {
        return res.status(500).json({error: "Failed to fetch employees"})
    }
}

// CREATE ADMIN
// POST /api/admins
export const createAdmin = async (req, res) => {
    try {
        const {name, email, password} = req.body

        if(!email, !name, !password) return res.status(400).json({
            error: "Missing Required Fields!"
        })

        const hashed = await bcrypt.hash(password, 10)

        const user = await User.create({
            email, password: hashed, role: 'ADMIN'
        })

        const admin = await Admin.create({
            userId: user._id, name, email, password: hashed
        })

        return res.status(201).json({success: true, admin})
    } catch(error) {
        if(error.code === 11000){
            return res.status(400).json({ error: "Admin Email already exists" })
        }

        console.error("Create employee error:", error)
        return res.status(500).json({ error: "Failed to create Admin." });
    }
}

// UPDATE ADMIN
// PUT /api/admins
export const updateAdmin = async (req, res) => {
    try {
        const {id} = req.params
        const {name, email, password} = req.body

        const admin = await Admin.findById(id)
        if(!admin) return res.status(404).json({error: "Admin not found"})

        const hashed = await bcrypt.hash(password, 10)

        await Admin.findByIdAndUpdate(id, {
            name, email, password: hashed
        })

        // update admin in User record
        const adminUpdate = {email}
        if(password) adminUpdate.password = hashed

        await User.findByIdAndUpdate(admin.userId, adminUpdate)

        return res.json({success: true})
    } catch {
        if(error.code === 11000){
            return res.status(400).json({ error: "Admin Email already exists" })
        }

        return res.status(500).json({ error: "Failed to create employee" });
    }
}