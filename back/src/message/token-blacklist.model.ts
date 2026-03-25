import mongoose from "mongoose";

/**
 * Modelo para almacenar tokens inválidos (logout)
 * Cuando un usuario hace logout, el token se agrega a esta colección
 * Permite implementar logout real en lugar de solo limpiar cliente
 */
export interface ITokenBlacklist extends mongoose.Document {
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
}

const tokenBlacklistSchema = new mongoose.Schema<ITokenBlacklist>({
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: 86400 } // TTL: 24 horas
}, {
    timestamps: false
});

/**
 * Índice para limpiar tokens expirados automáticamente
 * MongoDB eliminará documentos cuando createdAt + expires llegue
 */
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklistModel = mongoose.model<ITokenBlacklist>('TokenBlacklist', tokenBlacklistSchema);
