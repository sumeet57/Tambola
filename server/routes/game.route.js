import express from "express";
import {
  isPlayerInvited,
  deleteInvite,
  getRooms,
} from "../controllers/game.controller.js";
import authenticate from "../middleware/auth.middleware.js";

const gameRouter = express.Router();

gameRouter.post("/invited", isPlayerInvited);
gameRouter.delete("/invite/:inviteId",authenticate, deleteInvite);
gameRouter.get("/rooms", authenticate ,getRooms);
export default gameRouter;
