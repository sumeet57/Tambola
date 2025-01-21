import {
  createUser,
  findUser,
  loginUser,
} from "../controllers/user.controller.js";
import express from "express";

const userRouter = express.Router();

userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/find", findUser);

export default userRouter;
