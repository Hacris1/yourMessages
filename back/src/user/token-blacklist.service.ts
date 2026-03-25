import { TokenBlacklistModel, type ITokenBlacklist } from "../message/token-blacklist.model.js";
import jwt from "jsonwebtoken";

export class TokenBlacklistService {
    
    public async blacklistToken(token: string, userId: string): Promise<void> {
        try {
            const decoded = jwt.decode(token) as any;
            if (!decoded || !decoded.exp) {
                throw new Error("Invalid token format");
            }

            const expiresAt = new Date(decoded.exp * 1000);

            await TokenBlacklistModel.create({
                token,
                userId,
                expiresAt
            });
        } catch (error) {
            throw new Error(`Error blacklisting token: ${error}`);
        }
    }

    public async isTokenBlacklisted(token: string): Promise<boolean> {
        try {
            const blacklisted = await TokenBlacklistModel.findOne({ token });
            return blacklisted !== null;
        } catch (error) {
            console.error(`Error checking token blacklist: ${error}`);
            return false;
        }
    }

    public async getUserBlacklist(userId: string): Promise<ITokenBlacklist[]> {
        try {
            return await TokenBlacklistModel.find({ userId });
        } catch (error) {
            throw new Error(`Error getting user blacklist: ${error}`);
        }
    }

    public async cleanExpiredTokens(): Promise<number> {
        try {
            const result = await TokenBlacklistModel.deleteMany({
                expiresAt: { $lt: new Date() }
            });
            return result.deletedCount || 0;
        } catch (error) {
            throw new Error(`Error cleaning expired tokens: ${error}`);
        }
    }

    public async invalidateAllUserTokens(userId: string): Promise<number> {
        try {
            const result = await TokenBlacklistModel.deleteMany({ userId });
            return result.deletedCount || 0;
        } catch (error) {
            throw new Error(`Error invalidating user tokens: ${error}`);
        }
    }
}

export const tokenBlacklistService = new TokenBlacklistService();
