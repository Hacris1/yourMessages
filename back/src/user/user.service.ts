import type { createUserDto, updateUserDto } from "./dto/user.dto.js";
import type { IUser } from "./user.model.js";
import { UserModel } from "./user.model.js";
import { keyEncryptionService } from "../encrypt/KeyEncryptionService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

class UserService {

    public async create (userData: createUserDto) : Promise<IUser> {
        const userExists : IUser | null = await this.getByEmail(userData.email);
        if (userExists) {
            throw new Error("User already exists");
        }


        const hashedPassword = await bcrypt.hash(userData.password, 10);

        return UserModel.create({
            name: userData.name,
            email: userData.email,
            password: hashedPassword, 
            publicKey: userData.publicKey,
            encryptedPrivateKey: userData.encryptedPrivateKey
        });
    }

    public async update (userId: string, userData: updateUserDto) {
        try {

            const user: IUser | null = await UserModel.findOneAndUpdate({ _id: userId }, userData, { returnOriginal: false });

            return user;

        } catch (error) {
            if (error instanceof ReferenceError) {
                throw new Error("User not found");
            }
            throw error;
        }
    }

    public async delete (userId: string) {
        try {

            const user: IUser | null = await UserModel.findOneAndDelete({ _id: userId });

            return user;

        } catch (error) {
            if (error instanceof ReferenceError) {
                throw new Error("User not found");
            }
            throw error;
        }
    }

    public async getByEmail (email: string) {
        return UserModel.findOne({ email });
    }

    public async login (email: string, password: string) {
        const user: IUser | null = await this.getByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }

        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }

        if (!user.isActive) {
            throw new Error("Account is deactivated. Please contact support to reactivate.");
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET not configured");
        }

        const token = jwt.sign({ 
            id: user._id,
            name: user.name,
            email: user.email,
            publicKey: user.publicKey
        }, secret as string, {
            expiresIn: process.env.JWT_EXPIRATION || "24h"
        } as any);

        return token;
    }

    public async getById (userId: string) {
        return UserModel.findById({ _id: userId });
    }

    public async getAll () {
        return UserModel.find();
    }

    public async sendPublicKey (userId: string, publicKey: string) {
        try {
            const user : IUser | null = await this.getById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            user.publicKey = publicKey;
            await user.save();

        } catch (error) {
            if (error instanceof ReferenceError) {
                throw new Error("User not found");
            }
            throw error;
        }
    }

    public async getPublicKey (userId: string) {
        try {
            const user : IUser | null = await this.getById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            return user.publicKey;

        } catch (error) {
            if (error instanceof ReferenceError) {
                throw new Error("User not found");
            }
            throw error;
        }
    }

    public async regenerateKeys (userId: string, publicKey: string) {
        try {
            const user : IUser | null = await this.getById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            user.publicKey = publicKey;
            await user.save();

            return user;

        } catch (error) {
            if (error instanceof ReferenceError) {
                throw new Error("User not found");
            }
            throw error;
        }
    }

    public async deactivateAccount (userId: string) {
        try {
            const user : IUser | null = await this.getById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            user.isActive = false;
            await user.save();

            return user;

        } catch (error) {
            if (error instanceof ReferenceError) {
                throw new Error("User not found");
            }
            throw error;
        }
    }

    public async deleteAccount (userId: string) {
        try {
            const user = await UserModel.findByIdAndDelete(userId);
            return user;
        } catch (error) {
            if (error instanceof ReferenceError) {
                throw new Error("User not found");
            }
            throw error;
        }
    }


    public async encryptAndStorePrivateKey(userId: string, privateKey: string): Promise<void> {
        try {
            const user = await this.getById(userId);
            if (!user) {
                throw new Error("User not found");
            }

      
            const encryptedKey = keyEncryptionService.encryptPrivateKeyWithEmail(privateKey, user.email);
            user.encryptedPrivateKey = encryptedKey;
            await user.save();
        } catch (error) {
            throw new Error(`Error encrypting private key: ${error}`);
        }
    }


    public async getDecryptedPrivateKey(userId: string): Promise<string> {
        try {
            const user = await this.getById(userId);
            if (!user || !user.encryptedPrivateKey) {
                throw new Error("User not found or no private key stored");
            }


            const decryptedKey = keyEncryptionService.decryptPrivateKeyWithEmail(user.encryptedPrivateKey, user.email);
            return decryptedKey;
        } catch (error) {
            throw new Error(`Error decrypting private key: ${error}`);
        }
    }

    public async logout(token: string, userId: string): Promise<void> {
        try {
            const { tokenBlacklistService } = await import('./token-blacklist.service.js');
            await tokenBlacklistService.blacklistToken(token, userId);
        } catch (error) {
            throw new Error(`Error logging out: ${error}`);
        }
    }

    public async logoutAll(userId: string): Promise<void> {
        try {
            const { tokenBlacklistService } = await import('./token-blacklist.service.js');
            await tokenBlacklistService.invalidateAllUserTokens(userId);
        } catch (error) {
            throw new Error(`Error logging out all sessions: ${error}`);
        }
    }

}



export const userServices = new UserService();