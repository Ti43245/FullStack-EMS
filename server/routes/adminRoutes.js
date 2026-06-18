import { Router } from "express"
import { createAdmin, updateAdmin, getAdmins } from "../controllers/adminController.js";
import { protectAdmin, protect } from "../middleware/auth.js";

const adminRouter = Router();
adminRouter.put('/:id', protect, protectAdmin, updateAdmin)
adminRouter.get('/', protect, protectAdmin, getAdmins)
adminRouter.post('/', protect, protectAdmin, createAdmin)

export default adminRouter;