import {
  createUser,
  findUser,
  loginUser,
  getUser,
  logoutUser,
  changeRole,
} from "../controllers/user.controller.js";
import express from "express";

const userRouter = express.Router();

userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/find", findUser);
userRouter.get("/get", getUser);
userRouter.get("/logout", logoutUser);
userRouter.post("/changeRole", changeRole);

export default userRouter;
