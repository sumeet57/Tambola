import express from "express";
import {
  isPlayerInvited,
  getPlayerData,
  getInvites,
  getPlayer,
  inviteUser,
  deleteInvite,
  getRooms,
} from "../controllers/game.controller.js";

const gameRouter = express.Router();

gameRouter.post("/invited", isPlayerInvited);
gameRouter.post("/player", getPlayerData);
gameRouter.get("/invites", getInvites);
gameRouter.get("/player", getPlayer);
gameRouter.post("/invite", inviteUser);
gameRouter.delete("/invite/:inviteId", deleteInvite);
gameRouter.get("/rooms", getRooms);
export default gameRouter;
