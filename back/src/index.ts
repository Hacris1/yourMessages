import type { Express, Request, Response } from 'express';
import express from 'express';
import { createServer } from 'http';
import https from 'https';
import { httpsService } from './https/https.service.js';
import type { Server } from 'http';
import { db } from './config/dbConnection.js';
import { router as messageRouter } from './message/message.routes.js';
import { router as userRouter } from './user/user.routes.js';
import { initializeSocket } from './socket/socket.service.js';
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();


const isProduction = process.env.NODE_ENV === 'production';
const httpsOptions = isProduction ? httpsService.getHttpsOptions() : null;
const httpServer: Server = isProduction && httpsOptions
  ? https.createServer(httpsOptions, app)
  : createServer(app);

const port = Number(process.env.APP_PORT) || 4000;
const protocol = isProduction && httpsOptions ? 'https' : 'http';


const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || `https://localhost:${port}`]
    : ['http://localhost:3000', 'http://localhost:5173', 'http://192.168.1.21:3000', 'http://192.168.1.21:5173'],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/messages", messageRouter);
app.use("/api/user", userRouter);

app.get("/", (req: Request, res: Response) => {
    res.send('Hola Mundo - YourMessages API');
});

initializeSocket(httpServer);

db.then(() =>
    httpServer.listen(port, "0.0.0.0", () => {
        const url = `${protocol}://localhost:${port}`;
        console.log(`\n🚀 Server is running on ${url}`);
        console.log(`📱 Protocol: ${protocol.toUpperCase()}`);
        
        if (protocol === 'https') {
            console.log('🔒 Secure HTTPS enabled');
            console.log(`   Certificate: ${process.env.NODE_ENV === 'production' ? 'Let\'s Encrypt' : 'Self-signed (Development)'}`);
        } else {
            console.log('⚠️  Running on HTTP (NOT SECURE)');
        }
        console.log(`🔗 API Endpoints: ${url}/api/*\n`);
    })
).catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
});