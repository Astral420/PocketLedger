import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
     const authReq = req as AuthRequest;
     if(!authReq.user){
        res.status (401).json (
            {
                message:'Authentication Required.'
            }

        );
        return;
     }
     if (!allowedRoles.includes(authReq.user.role)){
        res.status (403).json (
            {
                error: 'Forbidden',
                message: `Allowed roles: ${allowedRoles.join(", ")}`,

            });
        return;
     }
     next();   
    };
};