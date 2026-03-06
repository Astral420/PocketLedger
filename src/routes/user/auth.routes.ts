import { Router } from 'express';
import { register, login, refresh, logout } from '../../controllers/auth.controller';
import { registerValidation, validateRequest } from '../../middlewares/helper/validation.middleware';

const router = Router();

router.post ('/register', registerValidation, validateRequest, register);
router.post ('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
