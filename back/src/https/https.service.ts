import fs from 'fs';
import path from 'path';
import https from 'https';

export class HttpsService {
    private certPath: string;
    private keyPath: string;
    private isDevelopment: boolean;

    constructor() {
        this.isDevelopment = process.env.NODE_ENV !== 'production';
        this.certPath = path.join(process.cwd(), 'certs', 'cert.pem');
        this.keyPath = path.join(process.cwd(), 'certs', 'key.pem');
    }

    public getHttpsOptions(): https.ServerOptions | null {
        if (process.env.NODE_ENV === 'production') {
            
            const prodKeyPath = process.env.SSL_KEY_PATH;
            const prodCertPath = process.env.SSL_CERT_PATH;

            if (!prodKeyPath || !prodCertPath) {
                console.warn('⚠️ Production HTTPS configured but SSL paths not found in .env');
                return null;
            }

            try {
                const key = fs.readFileSync(prodKeyPath, 'utf8');
                const cert = fs.readFileSync(prodCertPath, 'utf8');
                console.log('🔒 Using production HTTPS (Let\'s Encrypt)');
                return { key, cert };
            } catch (error) {
                console.error('❌ Error loading production SSL certificates:', error);
                return null;
            }
        }

        if (this.certificatesExist()) {
            console.log('🔒 Using development HTTPS (Self-signed certificate)');
            try {
                const key = fs.readFileSync(this.keyPath, 'utf8');
                const cert = fs.readFileSync(this.certPath, 'utf8');
                return { key, cert };
            } catch (error) {
                console.error('❌ Error loading self-signed certificates:', error);
                return null;
            }
        }

        console.log('⚠️ No HTTPS certificates found. Running on HTTP.');
        console.log('💡 To enable HTTPS in development, run:');
        console.log('   ./scripts/generate-cert.sh  (Linux/Mac)');
        console.log('   or manually:');
        console.log('   openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365');
        console.log('   mkdir -p certs && mv cert.pem key.pem certs/');
        return null;
    }

    private certificatesExist(): boolean {
        return fs.existsSync(this.certPath) && fs.existsSync(this.keyPath);
    }

    public getProtocol(): 'http' | 'https' {
        const options = this.getHttpsOptions();
        return options ? 'https' : 'http';
    }
}

export const httpsService = new HttpsService();
