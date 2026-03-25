import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { tokenBlacklistService } from '../user/token-blacklist.service.js';

export interface AuthRequest extends Request {
    userId?: string;
    user?: any;
    headers: Record<string, string | string[] | undefined>;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
        if (isBlacklisted) {
            return res.status(401).json({ error: 'Token has been invalidated. Please login again.' });
        }

        const secret = process.env.JWT_SECRET || "mi_clave_secreta";
        const decoded = jwt.verify(token, secret);

        req.userId = (decoded as any).id;
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Token has expired' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};
