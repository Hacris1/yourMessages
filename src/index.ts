import express, { Express, Request, Response } from 'express';

import { db } from './config/dbConnection';
import { router as messageRouter } from './message/message.route';
import { router as userRouter } from './user/user.route';

const app: Express = express();

process.loadEnvFile();

const port = process.env.APP_PORT || 3000;

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