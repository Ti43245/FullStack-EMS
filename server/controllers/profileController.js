import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import { session } from "./authController.js"

// Get profile
// Get /api/profile
export const getProfile = async (req, res) => {
    try{
        const session = req.session;
        const employee = await Employee.findOne({userId: session.userId})
        const admin = await Admin.findOne({userId: session.userId})
        //console.log('Employee: ', employee)

        return res.json(!employee ? {
                firstName: admin.name,
                lastName: "",
                email: session.email,

        }: {
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                position: employee.position,
                bio: employee.bio

        })
      
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch profile" });

    }
}

// Update Exployee profile
// PUT /api/profile
export const updateProfile =  async (req, res) => {
    try{
        const session = req.session;
        console.log('Employee Session: ', session)
        console.log('Emp Payload: ', req.body)
        const employee = await Employee.findOne({userId: session.userId})

        if(!employee) return res.status(404).json({ error: "Employee not found" });

        if (employee.isDeleted){
            return res.status(403).json({error: "Your account is deactivated. You cannot update your profile.",})
        }
        await Employee.findByIdAndUpdate(employee._id, {
            bio: req.body.bio
        })
        return res.json({ success: true});
    }catch (error){
        return res.status(500).json({ error: "Failed to update profile" });
    }
}

// Update Admin Profile
// PUT /api/adminprofile
export const updateAdminProfile =  async (req, res) => {

/*         console.log('Admin Endpoint recieved!')
        return res.json({ success: true}) */

    try{
        const session = req.session;
        // console.log("Admin Session: ", session)
        const admin = await Admin.findOne({userId: session.userId})
        // onsole.log('Admin Fetched: ', admin)
        if(!admin) return res.status(404).json({ error: "Admin not found" });

        const {name: aname, email: aemail} = req.body
        // console.log('Admin Credentials: ', name, email)
        await Admin.findByIdAndUpdate(admin._id, {
            name: aname, email: aemail
        })

        await User.findByIdAndUpdate(session.userId, {
            email: aemail
        })
        return res.json({ success: true});
    }catch (error){
        return res.status(500).json({ error: "Failed to update profile" });
    }
}