import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import gameRouter from "./routes/game.route.js";

dotenv.config();

const app = express();
app.use(express.json());

// for cors policy
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// for cookies
app.use(cookieParser());

// Define routes
app.use("/api/user", userRouter);
app.use("/api/game", gameRouter);

export default app;
