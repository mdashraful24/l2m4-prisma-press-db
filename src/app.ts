import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { sendResponse } from "./utils/sendResponse";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.route";
import { postRoutes } from "./modules/post/post.route";
import { commentRoutes } from "./modules/comment/comment.route";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { subscriptionRoutes } from "./modules/subscription/subscription.route";

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

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/subscription", subscriptionRoutes);

// Route Not Found
app.use(notFound);

// Global Error Handling Middleware
app.use(globalErrorHandler);

export default app;