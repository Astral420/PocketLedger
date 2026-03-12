import { Router } from "express";
import authRoutes from './user/auth.routes';
import userRoutes from './user/user.routes';


const router = Router();

router.use('/auth', authRoutes);
router.use('/me', userRoutes);





export default router;