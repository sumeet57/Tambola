import User from "../models/user.model.js";
import Room from "../models/room.model.js";
import { SaveGameInDb, textToHash, hashToText } from "../utils/game.utils.js";
import { activeRooms, pendingRoomDeletions, roomLocks } from "./room.js";

export const createRoomLogic = async (roomId, player, setting) => {
  // The function body is now the 'try' block
  try {
    // check if the room already exists
    const exist = await Room.findOne({ roomid: roomId });
    if (activeRooms.has(roomId) || exist) {
      throw new Error("Room already exists with this ID");
    }

    // Check if the player is a host
    const user = await User.findById(player.id);
    if (!user || user.role !== "host") {
      throw new Error("Only hosts can create rooms");
    }

    // check if the player has already been invited to this room
    const alreadyInvited = user.invites.some((invite) => invite?.id === roomId);
    if (!alreadyInvited) {
      user.invites.push({
        id: roomId,
        schedule: setting?.schedule || null,
      });
      await user.save();
    }

    // generate a public ID for the room
    const publicId = textToHash(roomId);

    // Create a new room object
    const newRoom = {
      // ... (all properties of newRoom are the same)
      publicId: publicId,
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

    // Add the player to the new room (Simplified)
    const newPlayer = {
      id: player?.id,
      socketid: player?.socketId,
      name: player?.name,
      phone: player?.phone,
      ticketCount: player.ticketCount || 0,
    };
    if (newPlayer.ticketCount > 0) {
      newPlayer.claims = [];
      newPlayer.assign_numbers = [];
    }
    newRoom.players.push(newPlayer);

    newRoom.playersList.push(player?.name);
    activeRooms.set(roomId, newRoom);

    if (setting.schedule) {
      const saveRes = await SaveGameInDb(roomId, newRoom);
      if (typeof saveRes === "string") {
        activeRooms.delete(roomId);
        // Throw the error string to be caught below
        throw new Error(saveRes);
      }
    }

    // On success, return a consistent object. This is better than just a string.
    return { success: true, message: "Room created successfully" };
  } catch (error) {
    throw error;
  }
};

export const joinRoomLogic = async (socketid, player, roomId, publicId) => {
  try {
    let room = activeRooms.get(roomId);
    const dbRoom = await Room.findOne({ roomid: roomId });

    if (!room && !dbRoom) {
      throw new Error("Room not found");
    }

    const isCompleted =
      (room && room.isCompleted) || (dbRoom && dbRoom.isCompleted);
    if (isCompleted) {
      throw new Error("Room is completed, please join a new one.");
    }

    const isOngoing = (room && room.isOngoing) || (dbRoom && dbRoom.isOngoing);
    if (isOngoing) {
      throw new Error(
        "Room is ongoing, please wait for it to finish or reconnect."
      );
    }

    const isPublicIdMatch =
      (room && room.publicId) || (dbRoom && dbRoom.publicId);
    if (isPublicIdMatch === publicId) {
      let isValid = hashToText(publicId);
      if (!isValid || isValid !== roomId) {
        throw new Error("Invalid room ID or public ID");
      }
    } else {
      throw new Error("Public ID does not match room ID");
    }

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
        requestedTicketCount: dbRoom.requestedTicketCount || [],
        isOngoing: dbRoom.isOngoing,
        isCompleted: dbRoom.isCompleted,
        finishTime: dbRoom.finishTime,
      };
      activeRooms.set(roomId, room);
      room = activeRooms.get(roomId);
    }

    if (pendingRoomDeletions?.has(roomId)) {
      clearTimeout(pendingRoomDeletions.get(roomId));
      pendingRoomDeletions.delete(roomId);
    }

    const roomData = activeRooms.get(roomId);
    const alreadyExists = roomData.players.some((p) => p.id === player.id);
    const playerIndex = roomData.players.findIndex((p) => p.id === player.id);
    let isNotHost = roomData.host != player.id;
    if (!isNotHost) {
      throw new Error("You are already the host of this room");
    }
    if (alreadyExists) {
      roomData.players[playerIndex].socketid = socketid;
      return false;
    }

    const newPlayer = {
      id: player.id,
      socketid: socketid,
      name: player.name,
      phone: player.phone,
      claims: [],
      assign_numbers: [],
      requestedTicketCount: player.requestedTicketCount || 1,
      ticketCount: 1,
    };

    const user = await User.findById(player.id);
    if (!user) {
      throw new Error("User not found");
    } else {
      const alreadyInvited = user.invites.some(
        (invite) => invite?.id === roomId
      );
      if (!alreadyInvited) {
        user.invites.push({
          id: roomId,
          schedule: roomData.schedule || null,
        });
        await user.save();
      }
    }

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

    return {
      success: true,
      message: "Player joined successfully",
    };
  } catch (error) {
    throw error;
  }
};

export const claimPatternLogic = async (
  player,
  roomId,
  pattern,
  ticketIndex
) => {
  try {
    const roomData = activeRooms.get(roomId);
    const playerIndex = roomData.players.findIndex((p) => p.id === player?.id);
    if (playerIndex === -1) {
      throw new Error("Player not found in room");
    }

    const patternMap = {
      1: "Early Five",
      2: "Middle Number",
      3: "Early Seven",
      4: "First Line",
      5: "Second Line",
      6: "Third Line",
      7: "Corner",
      8: "Full House",
    };

    const patternName = patternMap[pattern];
    if (!patternName) {
      throw new Error("Invalid pattern");
    }

    const patternObj = roomData.claimTrack.find(
      (p) => p.id === String(pattern)
    );
    if (!patternObj || patternObj.winners <= 0) {
      throw new Error("Pattern not available for claiming");
    }

    const alreadyClaimedByAllTickets = roomData.players[
      playerIndex
    ].claims.some((claim) => {
      if (claim?.name === patternName) {
        if (claim?.ticketNo?.includes(ticketIndex)) {
          return true;
        } else {
          return false;
        }
      }
    });
    if (alreadyClaimedByAllTickets) {
      throw new Error(
        `You have already claimed ${patternName} for this ticket.`
      );
    } else if (alreadyClaimedByAllTickets === false) {
      const claim = roomData.players[playerIndex].claims.find(
        (claim) => claim.name === patternName
      );
      if (claim) {
        claim.ticketNo.push(ticketIndex);
      } else {
        roomData.players[playerIndex].claims.push({
          name: patternName,
          ticketNo: [ticketIndex],
        });
      }
    }

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

    return {
      success: true,
      message: `${patternName} Claimed by ${player?.name}, Approve by the System 🎉`,
    };
  } catch (error) {
    throw error;
  }
};
