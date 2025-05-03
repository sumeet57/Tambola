// import {
//   createHost,
//   loginHost,
//   inviteUser,
// } from "../controllers/host.controller.js";

import {
  createHost,
  loginHost,
  //   inviteUser,
} from "../controllers/user.controller.js";
import express from "express";

const hostRouter = express.Router();

hostRouter.post("/register", createHost);
hostRouter.post("/login", loginHost);
// hostRouter.post("/invite", inviteUser);

export default hostRouter;
