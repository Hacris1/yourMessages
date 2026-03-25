import crypto from 'crypto';

export class KeyEncryptionService {
    private algorithm = 'aes-256-cbc';
    private saltLength = 16;

    public encryptPrivateKey(privateKey: string, masterPassword: string): string {
        try {
            const salt = crypto.randomBytes(this.saltLength);
            
            const derivedKey = crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, 'sha256');
            const iv = crypto.randomBytes(16);

            const cipher = crypto.createCipheriv(this.algorithm, derivedKey, iv);
            let encrypted = cipher.update(privateKey, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const combined = salt.toString('hex') + ':' + iv.toString('hex') + ':' + encrypted;
            
            return Buffer.from(combined).toString('base64');
        } catch (error) {
            throw new Error(`Error encrypting private key: ${error}`);
        }
    }

    public decryptPrivateKey(encryptedKey: string, masterPassword: string): string {
        try {
            const combined = Buffer.from(encryptedKey, 'base64').toString('utf8');
            const parts = combined.split(':');
            
            if (parts.length !== 3) {
                throw new Error('Invalid encrypted key format');
            }

            const salt = Buffer.from(parts[0] as string, 'hex');
            const iv = Buffer.from(parts[1] as string, 'hex');
            const encrypted = parts[2] as string;

            const derivedKey = crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, 'sha256');

            const decipher = crypto.createDecipheriv(this.algorithm, derivedKey, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            throw new Error(`Error decrypting private key: ${error}`);
        }
    }

    public deriveMasterKey(password: string, email: string): string {
        const derived = crypto.pbkdf2Sync(password, email, 100000, 32, 'sha256');
        return derived.toString('hex');
    }

    public encryptPrivateKeyWithEmail(privateKey: string, email: string): string {
        try {

            const derivedKey = crypto.pbkdf2Sync(email, email, 100000, 32, 'sha256');
            const iv = crypto.randomBytes(16);

            const cipher = crypto.createCipheriv(this.algorithm, derivedKey, iv);
            let encrypted = cipher.update(privateKey, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const combined = iv.toString('hex') + ':' + encrypted;
            
            return Buffer.from(combined).toString('base64');
        } catch (error) {
            throw new Error(`Error encrypting private key: ${error}`);
        }
    }

    public decryptPrivateKeyWithEmail(encryptedKey: string, email: string): string {
        try {
            const combined = Buffer.from(encryptedKey, 'base64').toString('utf8');
            const parts = combined.split(':');
            
            if (parts.length !== 2) {
                throw new Error('Invalid encrypted key format');
            }

            const iv = Buffer.from(parts[0] as string, 'hex');
            const encrypted = parts[1] as string;

            const derivedKey = crypto.pbkdf2Sync(email, email, 100000, 32, 'sha256');

            const decipher = crypto.createDecipheriv(this.algorithm, derivedKey, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            throw new Error(`Error decrypting private key: ${error}`);
        }
    }
}

export const keyEncryptionService = new KeyEncryptionService();
