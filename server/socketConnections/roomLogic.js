import { activeRooms, roomLocks, pendingRoomDeletions } from "./room.js";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";
import { assignNumbersToPlayers } from "./assignNumberLogic.js";
import { SaveExistingGameInDb, SaveGameInDb } from "../utils/game.utils.js";

function isLocked(roomId) {
  let locked = roomLocks.has(roomId);
  return locked;
}

function acquireLock(roomId) {
  roomLocks.set(roomId, true);
  return true;
}

function releaseLock(roomId) {
  roomLocks.delete(roomId);
  return true;
}

// updated the code ,tested (latest approch)
export const createRoom = async (player, setting) => {
  let result = true; // default
  const roomId = setting?.roomId;
  try {
    if (!player?.id || !roomId) {
      result = "Invalid player or setting data";
      return;
    }

    if (isLocked(roomId)) {
      result = "Room is currently being created. Please wait.";
      return;
    } else {
      acquireLock(roomId); // acquire lock
    }

    const exist = await Room.findOne({ roomid: roomId });
    if (activeRooms.has(roomId) || exist) {
      result = "Room exists, choose another ID or reconnect.";
      return;
    }

    const user = await User.findById(player.id);
    if (!user || user.role !== "host") {
      result = "You are not a host";
      return;
    }

    const alreadyInvited = user.invites.some((invite) => invite?.id === roomId);
    if (!alreadyInvited) {
      user.invites.push({
        id: roomId,
        schedule: setting?.schedule || null,
      });
      await user.save();
    }

    const newRoom = {
      host: player?.id,
      players: [],
      patterns: setting.pattern || [],
      schedule: setting.schedule || null,
      claimData: [],
      claimTrack: setting.pattern || [],
      drawno: [],
      playersList: [],
      isOngoing: false,
      isCompleted: false,
      finishTime: null,
      requestedTicketCount: [],
    };

    newRoom.players.push({
      id: player?.id,
      socketid: player?.socketId,
      name: player?.name,
      phone: player?.phone,
      claims: [],
      assign_numbers: [],
      ticketCount: player.ticketCount || 1,
    });

    newRoom.playersList.push(player?.name);

    activeRooms.set(roomId, newRoom);

    if (setting.schedule) {
      const saveRes = await SaveGameInDb(roomId, newRoom);
      if (typeof saveRes === "string") {
        activeRooms.delete(roomId);
        result = saveRes;
        return;
      }
    }

    result = true;
  } catch (err) {
    console.error("Error creating room:", err);
    result = "Error creating room";
  } finally {
    releaseLock(roomId); // always release lock
    return result; // return after release
  }
};

// updated the code, tested (latest approch)
export const joinRoom = async (player, roomid) => {
  if (!player || !roomid) {
    return "Invalid player data";
  }

  const roomId = roomid;

  // Acquire room lock
  if (isLocked(roomId)) {
    return "Room is currently busy, try again shortly";
  } else {
    acquireLock(roomId); // acquire lock
  }

  try {
    let room = activeRooms.get(roomId);
    const dbRoom = await Room.findOne({ roomid: roomId });

    // Room doesn't exist anywhere
    if (!room && !dbRoom) {
      return "Room not found";
    }

    // Room is completed
    const isCompleted =
      (room && room.isCompleted) || (dbRoom && dbRoom.isCompleted);
    if (isCompleted) {
      return "Room is completed, please join a new one.";
    }

    // Load room from DB into memory if not already loaded
    if (!room && dbRoom) {
      room = {
        host: dbRoom.host,
        players: dbRoom.players || [],
        patterns: dbRoom.settings.patterns || [],
        schedule: dbRoom.settings.schedule || null,
        drawno: dbRoom.settings.drawno || [],
        claimData: [],
        claimTrack: dbRoom.settings.patterns || [],
        playersList: dbRoom.players?.map((p) => p.name) || [],
        isOngoing: dbRoom.isOngoing,
        isCompleted: dbRoom.isCompleted,
        finishTime: dbRoom.finishTime,
      };
      activeRooms.set(roomId, room);
      room = activeRooms.get(roomId);
    }

    // Cancel pending room deletion if exists
    if (pendingRoomDeletions?.has(roomId)) {
      clearTimeout(pendingRoomDeletions.get(roomId));
      pendingRoomDeletions.delete(roomId);
    }

    // Check if player already joined
    const roomData = activeRooms.get(roomId);
    const alreadyExists = roomData.players.some((p) => p.id === player.id);
    const playerIndex = roomData.players.findIndex((p) => p.id === player.id);
    if (alreadyExists && roomData.isOngoing) {
      roomData.players[playerIndex].socketid = player.socketId; // Update socket ID
      return true;
    } else if (alreadyExists && !roomData.isOngoing) {
      roomData.players[playerIndex].socketid = player.socketId; // Update socket ID
      return false;
    }

    // Add player to memory room
    const newPlayer = {
      id: player.id,
      socketid: player.socketId,
      name: player.name,
      phone: player.phone,
      claims: [],
      assign_numbers: [],
      requestedTicketCount: player.requestedTicketCount || 1,
      ticketCount: player.ticketCount || 1,
    };

    roomData.players.push(newPlayer);
    roomData.playersList.push(player.name);
    let requestFound = roomData.requestedTicketCount.find(
      (p) => p.id === player.id
    );
    if (!requestFound) {
      roomData.requestedTicketCount.push({
        id: player.id,
        name: player.name,
        phone: player.phone,
        count: player.requestedTicketCount || 1,
      });
    } else {
      roomData.requestedTicketCount.find((p) => p.id === player.id).count =
        player.requestedTicketCount || 1;
    }

    return false;
  } catch (err) {
    console.error("Error joining room:", err);
    return "Internal error while joining room";
  } finally {
    releaseLock(roomId);
  }
};

// updated the code, tested also (latest approch) need review
export const claimPoint = async (player, roomid, pattern, io, socket) => {
  const roomId = roomid;

  try {
    if (!activeRooms.has(roomId)) {
      return "Room not found";
    }

    // check if room is locked
    if (isLocked(roomId)) {
      return "Room is currently busy, try again shortly";
    } else {
      acquireLock(roomId); // acquire lock
    }

    const roomData = activeRooms.get(roomId);

    const playerIndex = roomData.players.findIndex((p) => p.id === player?.id);
    if (playerIndex === -1) {
      return "Player not found in the room";
    }

    const patternMap = {
      1: "early five",
      2: "middle number",
      3: "early seven",
      4: "first line",
      5: "middle line",
      6: "last line",
      7: "corner",
      8: "full house",
    };

    const patternName = patternMap[pattern];
    if (!patternName) {
      return "Invalid pattern";
    }

    const patternObj = roomData.claimTrack.find(
      (p) => p.id === String(pattern)
    );
    if (!patternObj || patternObj.winners <= 0) {
      return "Pattern not available";
    }

    const alreadyClaimed =
      roomData.players[playerIndex].claims.includes(patternName);
    if (alreadyClaimed) {
      return "Pattern already claimed";
    }

    // ✅ Apply claim
    roomData.players[playerIndex].claims.push(patternName);
    roomData.claimData.push({
      player: {
        id: player?.id,
        name: player?.name,
        phone: player?.phone,
      },
      pattern: patternName,
    });

    // 🔻 Decrease pattern count
    const patternIndex = roomData.claimTrack.findIndex(
      (p) => p.id === String(pattern)
    );
    if (patternIndex !== -1) {
      roomData.claimTrack[patternIndex].winners--;
    }

    // 📢 Broadcast claim updates
    io.to(roomId).emit("pattern_claimed", {
      message: `${player?.name} claimed ${patternName}`,
    });
    io.to(roomId).emit("claimedList", roomData.claimTrack);

    // 🎯 Check if all patterns are claimed
    const allClaimed = roomData.claimTrack.every((p) => p.winners === 0);
    if (allClaimed) {
      roomData.isCompleted = true;
      roomData.isOngoing = false;
      const currentTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      });
      const formattedTime = currentTime.replace(/, /g, " | Time : ");
      const finalDate = "Date : " + formattedTime;
      roomData.finishTime = finalDate;

      const exist = await Room.findOne({ roomid: roomId });
      if (exist) {
        await SaveExistingGameInDb(roomId, roomData);
      } else {
        await SaveGameInDb(roomId, roomData);
      }

      io.to(roomId).emit("game_over", { roomid: roomId });

      for (const player of roomData.players) {
        try {
          const user = await User.findById(player?.id);

          if (user) {
            user.invites = user.invites.filter(
              (invite) => invite.id !== roomId
            );
            await user.save();
          }
        } catch (err) {
          console.error(`Error updating player ${player?.id}:`, err);
        }
      }

      if (pendingRoomDeletions.has(roomId)) {
        clearTimeout(pendingRoomDeletions.get(roomId));
        pendingRoomDeletions.delete(roomId);
      }
      if (isLocked(roomId)) {
        releaseLock(roomId);
      }
      activeRooms.delete(roomId);
    }

    return true;
  } catch (err) {
    console.error("Error claiming point:", err);
    return "Error claiming point";
  } finally {
    releaseLock(roomId); // Release lock after operation
  }
};

// dont need an update, not tested yet
export const assignNumbers = (roomid) => {
  try {
    let roomData = activeRooms.get(roomid);
    if (!roomData) {
      return "Room not found";
    }

    if (
      !roomData.players.some((player) => player.assign_numbers.length === 0)
    ) {
      return "Numbers already assigned";
    }

    roomData.players = assignNumbersToPlayers(roomData.players);
    roomData.isOngoing = true;

    return true;
  } catch (err) {
    console.error("Error assigning numbers:", err);
    return "Error assigning numbers";
  }
};

// reconnecting logic
export const reconnectPlayer = async (player, roomid) => {
  try {
    if (!player || !roomid) return "Invalid player data";

    const roomId = roomid;

    const roomInDb = await Room.findOne({ roomid: roomId });
    let roomInMemory = activeRooms.get(roomId);

    if (!roomInDb && !roomInMemory) {
      return "Room not found";
    }

    if (roomInDb?.isCompleted) {
      return "Room is completed, please join a new one.";
    }

    // Load into memory if not already present
    if (!roomInMemory) {
      console.log("Room not found in memory, loading from DB");
      const loadedRoom = {
        host: roomInDb?.host,
        players: roomInDb.players || [],
        patterns: roomInDb.settings?.patterns || [],
        schedule: roomInDb.settings?.schedule || null,
        claimData: roomInDb.claimData || [],
        claimTrack: roomInDb.settings?.patterns || [],
        drawno: roomInDb.drawno || [],
        playersList: roomInDb.players?.map((p) => p.name) || [],
        isOngoing: roomInDb?.isOngoing,
        isCompleted: roomInDb?.isCompleted,
        finishTime: roomInDb?.finishTime,
      };
      activeRooms.set(roomId, loadedRoom);
      roomInMemory = activeRooms.get(roomId);
    }

    // Update socketId in memory
    const found = roomInMemory.players?.find((p) => p.id === player.id);
    if (found) {
      found.socketid = player.socketId;
    } else {
      return "Player not found in room";
    }

    return roomInMemory.isOngoing === true ? true : false;
  } catch (err) {
    console.error("Error reconnecting player:", err);
    return "Server error";
  }
};

// pending
//done with hostpage

export const storeRoom = async (roomid) => {
  try {
    if (!roomid) {
      return "Invalid room data";
    }
    let roomData = activeRooms.get(roomid);
    if (!roomData) {
      return "Room not found";
    }
    roomData.isCompleted = true;
    roomData.isOngoing = false;

    // get current time of india, format it to "YYYY-MM-DD HH:mm:ss"
    const currentTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: false, // 24-hour format
    });
    const formattedTime = currentTime.replace(/, /g, " | Time : ");
    const finalDate = "Date : " + formattedTime;

    roomData.finishTime = finalDate;

    const exist = await Room.findOne({ roomid: roomid });
    if (exist) {
      await SaveExistingGameInDb(roomid, roomData);
    } else {
      await SaveGameInDb(roomid, roomData);
    }

    for (const player of roomData.players) {
      try {
        const user = await User.findById(player.id);

        if (user) {
          user.invites = user.invites.filter((invite) => invite.id !== roomid);
          await user.save();
        }
      } catch (err) {
        console.error(`Error updating player ${player.id}:`, err);
      }
    }

    if (pendingRoomDeletions.has(roomid)) {
      clearTimeout(pendingRoomDeletions.get(roomid));
      pendingRoomDeletions.delete(roomid);
    }
    if (isLocked(roomid)) {
      releaseLock(roomid);
    }
    activeRooms.delete(roomid);

    return 1;
  } catch (err) {
    console.error(`Error saving room ${roomid}:`, err);
    return "Error saving room";
  }
};
