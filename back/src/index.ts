import type { Express, Request, Response } from 'express';
import express from 'express';
import { db } from './config/dbConnection.js';
import { router as messageRouter } from './message/message.routes.js';
import { router as userRouter } from './user/user.routes.js';
import cors from 'cors';

const app: Express = express();

process.loadEnvFile();

const port = Number(process.env.APP_PORT) || 4000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/messages", messageRouter);
app.use("/api/user", userRouter);

app.get("/", (req: Request, res: Response) => {
    res.send('Hola Mundo');
});


db.then(() =>
    app.listen(port, "0.0.0.0",() => {
        console.log(`Server is running on port ${port}`);
    })
);