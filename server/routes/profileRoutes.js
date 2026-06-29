import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getProfile, updateProfile, updateAdminProfile } from "../controllers/profileController.js";


const profileRouter = Router();

profileRouter.get("/", protect, getProfile)
profileRouter.put("/", protect, updateProfile)
profileRouter.put("/admin", protect, updateAdminProfile)

export default profileRouter;