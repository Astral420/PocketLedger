import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  googleOAuthCallback,
  googleOAuthExchange,
  OAuthFailure,
} from '../../controllers/auth.controller';
import { registerValidation, validateRequest } from '../../middlewares/helper/validation.middleware';


import passport from 'passport';



const router = Router();

router.post ('/register', registerValidation, validateRequest, register);
router.post ('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/google/exchange', googleOAuthExchange);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: "/api/v1/auth/google/failed",
  }),
  googleOAuthCallback
);
router.get('/google/failed', OAuthFailure);

export default router;
