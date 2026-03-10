import { Router } from "express";
import {
  fetchUser,
  updateUser,
  updatePhoto,
  uploadProfilePhoto,
} from "../../controllers/user/user.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router ();

router.use(requireAuth);

router.get("/", fetchUser);
router.patch("/", updateUser);
router.patch("/profile", uploadProfilePhoto.single("photo"), updatePhoto);



export default router;
