import {
  createUser,
  loginUser,
  refreshToken,
  getUser,
  getInvites,
  changeRole,
  logoutSession
} from "../controllers/user.controller.js";
import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/rbac.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/tokens", refreshToken);
userRouter.get("/me",authenticate ,getUser);
userRouter.get("/get-invites", authenticate, getInvites);
userRouter.post("/change-role", authenticate, changeRole);
userRouter.post("/logout", authenticate, logoutSession);

export default userRouter;
