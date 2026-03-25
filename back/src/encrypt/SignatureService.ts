import crypto from 'crypto';

export class SignatureService {
    private algorithm = 'RSA-SHA256';

    public signMessage(message: string, privateKeyPem: string): string {
        try {
            const sign = crypto.createSign(this.algorithm);
            sign.update(message, 'utf8');
            const signature = sign.sign(privateKeyPem, 'base64');
            return signature;
        } catch (error) {
            throw new Error(`Error signing message: ${error}`);
        }
    }

    public verifySignature(message: string, signature: string, publicKeyPem: string): boolean {
        try {
            const verify = crypto.createVerify(this.algorithm);
            verify.update(message, 'utf8');
            return verify.verify(publicKeyPem, signature, 'base64');
        } catch (error) {
            console.error(`Error verifying signature: ${error}`);
            return false;
        }
    }

    public hashMessage(message: string): string {
        return crypto.createHash('sha256').update(message, 'utf8').digest('hex');
    }
}

export const signatureService = new SignatureService();
