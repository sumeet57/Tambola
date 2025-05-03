import Room from "../models/room.model.js";
import { activeRooms, roomLocks } from "../socketConnections/room.js";

export const SaveGameInDb = async (roomid, roomData) => {
  try {
    if (!roomid || !roomData) {
      return "Invalid room data";
    }

    if (!activeRooms.has(roomid)) {
      return "Room not found in memory";
    }

    const newGame = new Room({
      roomid: roomid,
      host: roomData?.host,
      players: roomData?.players,
      settings: {
        patterns: roomData.patterns || [],
        schedule: roomData.schedule || null,
        drawno: roomData.drawno || [],
      },
      claimData: roomData.claimData || [],
      isCompleted: roomData?.isCompleted,
      isOngoing: roomData?.isOngoing,
      finishTime: roomData?.finishTime || null,
    });

    await newGame.save();

    return true;
  } catch (err) {
    return "Error saving game";
  }
};

export const SaveExistingGameInDb = async (roomid, roomData) => {
  try {
    if (!roomid || !roomData) {
      return "Invalid room data";
    }

    if (!activeRooms.has(roomid)) {
      return "Room not found in memory";
    }

    const existingGame = await Room.findOne({ roomid: roomid });

    if (!existingGame) {
      return "No existing game found";
    }

    existingGame.players = roomData?.players;
    existingGame.settings = {
      patterns: roomData.patterns || [],
      schedule: roomData.schedule || null,
      drawno: roomData.drawno || [],
    };
    existingGame.claimData = roomData?.claimData;
    existingGame.isCompleted = roomData?.isCompleted;
    existingGame.isOngoing = roomData?.isOngoing;

    await existingGame.save();

    return true;
  } catch (err) {
    // console.error("Error saving existing game:", err);
    return "Error saving existing game";
  }
};
