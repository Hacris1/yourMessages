import NodeRSA from 'node-rsa';
import dotenv from 'dotenv';

dotenv.config(); 

export class RSA {
    private privateKey: NodeRSA;
    private publicKey: NodeRSA;

    constructor() {
        const privatekString = process.env.PRIVATE_KEY;
        const publicKString = process.env.PUBLIC_KEY;

        if (!privatekString || !publicKString) {
            throw new Error('Error al obtener llaves');
        }

        this.privateKey = new NodeRSA(privatekString, 'private');
        this.publicKey = new NodeRSA(publicKString, 'public');
    }

    public getPublicKey(): string | undefined {
        return process.env.PUBLIC_KEY;
    }

    public encrypt(message: string, KeyP?: string): string { //public key
        const key = KeyP ? new NodeRSA(KeyP) : this.publicKey;
        return key.encrypt(message, 'base64');
    }

    public decrypt(encryptedMessage: string): string { // private key
        return this.privateKey.decrypt(encryptedMessage, 'utf8');//
    }
}
 

export const rsa = new RSA();
