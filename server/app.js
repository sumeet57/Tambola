import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import hostRouter from "./routes/host.route.js";
import gameRouter from "./routes/game.router.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Define routes
app.use("/api/user", userRouter);
app.use("/api/host", hostRouter);
app.use("/api/game", gameRouter);

export default app;
