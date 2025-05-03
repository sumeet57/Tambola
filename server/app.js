import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import hostRouter from "./routes/host.route.js";
import gameRouter from "./routes/game.route.js";

dotenv.config();

const app = express();
app.use(express.json());

// for cors policy
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(cookieParser());

// Define routes
app.use("/api/user", userRouter);
app.use("/api/host", hostRouter);
app.use("/api/game", gameRouter);

export default app;
