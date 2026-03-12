import { Request, Response } from "express";
import {
    getUserByEmail,
    getUserById,
    updateUser as updateUserModel,
    updateUserImage,
} from "../../models/user.model";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Readable } from "stream";

import multer from "multer";
import cloudinary from "../../config/cloudinary";

export const fetchUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).user?.id;
        if (!userId) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const user = await getUserById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateUser = async (_req: Request, res: Response): Promise<void> => {
    try {
        const req = _req as AuthRequest;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const currentUser = await getUserById(userId);
        if (!currentUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const body = _req.body ?? {};
        const nextFullName =
            body.full_name === undefined
                ? currentUser.full_name
                : typeof body.full_name === "string"
                ? body.full_name.trim() || null
                : currentUser.full_name;
        const nextEmail =
            body.email === undefined
                ? currentUser.email
                : typeof body.email === "string"
                ? body.email.trim().toLowerCase()
                : "";
        const nextPassword =
            typeof body.password === "string" && body.password.trim().length > 0
                ? body.password
                : null;

        if (!nextEmail) {
            res.status(400).json({ error: "Email is required" });
            return;
        }

        if (body.email !== undefined) {
            const existingUser = await getUserByEmail(nextEmail);
            if (existingUser && existingUser.id !== userId) {
                res.status(409).json({ error: "Email is already in use" });
                return;
            }
        }

        const updatedUser = await updateUserModel(
            userId,
            nextFullName,
            nextEmail,
            nextPassword
        );

        if (!updatedUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(200).json(updatedUser);
    } catch  (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const uploadProfilePhoto = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024},
});

const imageUploadToCloudinary = (buffer: Buffer, userId: string) => 
    new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: "pocket-ledger/profile-photo",
            public_id: `user-${userId}-${Date.now()}`,
            resource_type: "image",
        },
     (error, result) => {
        if (error) return reject (error);
        resolve(result);
     });
     Readable.from(buffer).pipe(stream);

    }); 

export const updatePhoto = async (req: Request, res: Response): Promise<void> =>{
    try {
        const user = (req as AuthRequest).user?.id;
        if (!user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        if (!req.file) {
            res.status(400).json({ error: "Profile photo is required" });
            return;
        }
        
        const existingUser = await getUserById(user);
        if (!existingUser) {
            res.status(404).json({ error: "User not found."});
            return;
        }

        const uploaded = await imageUploadToCloudinary(req.file.buffer, user);
        const updatedUser = await updateUserImage(user, uploaded.secure_url);

        res.status(200).json({
            message: "Profile photo is updated successfully.",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating profile photo:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};
