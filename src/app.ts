import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { sendResponse } from "./utils/sendResponse";
import { userRouter } from "./modules/user/user.route";

const app: Application = express();

// Middleware
app.use(cors({
    origin: config.appUrl,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req: Request, res: Response) => {
    // res.send("Hello World!");

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Hello World!",
        author: "Ashraful Islam Ratul"
    });
});

app.use("/api/users", userRouter);


export default app;