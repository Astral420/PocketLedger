import { Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail } from '../models/user.model';
import bcrypt from 'bcrypt';

export const register = async (req: Request, res: Response) => {

    try {
    const { full_name, email, password } = req.body;

    const existingUser = await getUserByEmail(email);
    if(existingUser) return res.status(409).json({ error: 'User already exists' });
    
    const newUser = await createUser(full_name, email, password);
    res.status(201).json({ message: 'User created successfully', userId: newUser.id });
        
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error', message: err });  
    }
}

export const login = async (req: Request, res: Response) => {

    try {
        const { email, password } = req.body;

        const user = await getUserByEmail(email);
        if(!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if(!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

        const accessToken = jwt.sign(
            { sub: user.id }, 
            process.env.JWT_SECRET!,
            { expiresIn: '15m' });

        const refreshToken = jwt.sign(
            { sub: user.id }, 
            process.env.JWT_SECRET_REFRESH!,
            { expiresIn: '30d' });

            return res.status(200).json({
                accessToken,
                refreshToken,
                user: { id: user.id, email: user.email, full_name: user.full_name }
            });
        
        
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error', message: err });  
    }
}