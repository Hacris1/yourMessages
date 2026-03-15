import type { Express, Request, Response } from 'express';
import express from 'express';
import { db } from './config/dbConnection.js';
import { router as messageRouter } from './message/message.routes.js';
import { router as userRouter } from './user/user.routes.js';

const app: Express = express();

process.loadEnvFile();

const port = process.env.APP_PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/messages", messageRouter);
app.use("/api/user", userRouter);

app.get("/", (req: Request, res: Response) => {
    res.send('Hola Mundo');
});

db.then(() =>
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })
);