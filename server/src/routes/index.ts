import { Router } from "express";
import authRoutes from './user/auth.routes';

import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use('/auth', authRoutes);

router.use(requireAuth);






export default router;