import express from "express";
import {
  deductPoints,
  isPlayerInvited,
  getPlayerData,
} from "../controllers/game.controller.js";

const gameRouter = express.Router();

gameRouter.post("/points", deductPoints);
gameRouter.post("/invited", isPlayerInvited);
gameRouter.post("/player", getPlayerData);

export default gameRouter;
