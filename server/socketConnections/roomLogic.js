import { activeRooms, pendingRoomDeletions } from "./room.js";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";
import { assignNumbersToPlayers, assignTickets } from "./assignNumberLogic.js";
import { SaveExistingGameInDb, SaveGameInDb } from "../utils/game.utils.js";
import { withRoomLock } from "../utils/mutexManager.js";

import { textToHash, hashToText } from "../utils/game.utils.js";

export const createRoom = async (player, setting) => {
  const roomId = setting?.roomId;
  if (!player?.id || !roomId) return "Invalid player or setting data";

  return await withRoomLock(
    roomId,
    async () => {
      const exist = await Room.findOne({ roomid: roomId });

      if (activeRooms.has(roomId) || exist) {
        return "Room exists, choose another ID or reconnect.";
      }

      const user = await User.findById(player.id);
      if (!user || user.role !== "host") {
        return "You are not a host";
      }

      const alreadyInvited = user.invites.some(
        (invite) => invite?.id === roomId
      );
      if (!alreadyInvited) {
        user.invites.push({
          id: roomId,
          schedule: setting?.schedule || null,
        });
        await user.save();
      }

      const publicId = textToHash(roomId);

      const newRoom = {
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

      if (player?.ticketCount == 0) {
        newRoom.players.push({
          id: player?.id,
          socketid: player?.socketId,
          name: player?.name,
          phone: player?.phone,
          ticketCount: player?.ticketCount || 0,
        });
      } else {
        newRoom.players.push({
          id: player?.id,
          socketid: player?.socketId,
          name: player?.name,
          phone: player?.phone,
          claims: [],
          assign_numbers: [],
          ticketCount: player.ticketCount || 1,
        });
      }

      newRoom.playersList.push(player?.name);
      activeRooms.set(roomId, newRoom);

      if (setting.schedule) {
        const saveRes = await SaveGameInDb(roomId, newRoom);
        if (typeof saveRes === "string") {
          activeRooms.delete(roomId);
          return saveRes;
        }
      }

      return true;
    },
    { rejectIfBusy: true }
  );
};

// updated the code, tested (latest approch)
export const joinRoom = async (socketid, player, roomid, publicId) => {
  if (!socketid || !player || !roomid || !publicId) {
    return "Invalid player data";
  }

  const roomId = roomid;

  return await withRoomLock(
    roomId,
    async () => {
      try {
        let room = activeRooms.get(roomId);
        const dbRoom = await Room.findOne({ roomid: roomId });

        if (!room && !dbRoom) {
          return "Room not found";
        }

        const isCompleted =
          (room && room.isCompleted) || (dbRoom && dbRoom.isCompleted);
        if (isCompleted) {
          return "Room is completed, please join a new one.";
        }

        const isOngoing =
          (room && room.isOngoing) || (dbRoom && dbRoom.isOngoing);
        if (isOngoing) {
          return "Room is ongoing, please reconnect.";
        }

        const isPublicIdMatch =
          (room && room.publicId) || (dbRoom && dbRoom.publicId);
        if (isPublicIdMatch === publicId) {
          let isValid = hashToText(publicId);
          if (!isValid || isValid !== roomId) {
            return "Invalid public ID";
          }
        } else {
          return "Public ID does not match the room Public ID";
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
        const playerIndex = roomData.players.findIndex(
          (p) => p.id === player.id
        );
        let isNotHost = roomData.host != player.id;
        if (!isNotHost) {
          return "You are Host of this room, you cannot join as a player";
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
          return "User not found, please login again";
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

        return false;
      } catch (err) {
        console.error("Error joining room:", err);
        return "Internal error while joining room";
      }
    },
    { rejectIfBusy: true }
  );
};

// updated the code, tested also (latest approch) need review

export const claimPoint = async (player, roomid, pattern, ticketIndex, io) => {
  return await withRoomLock(
    roomid,
    async () => {
      const roomId = roomid;

      if (!activeRooms.has(roomId)) {
        return "Room not found";
      }

      const roomData = activeRooms.get(roomId);
      const playerIndex = roomData.players.findIndex(
        (p) => p.id === player?.id
      );
      if (playerIndex === -1) {
        return "Player not found in the room";
      }

      const patternMap = {
        1: "Early Five",
        2: "Middle Number",
        3: "Early Seven",
        4: "First Line",
        5: "Middle Line",
        6: "Last Line",
        7: "Corner",
        8: "Full House",
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

      // players - player - claims : [{name: "Early Five", ticketNo: [2,5....]}, ...]
      // check if player ticket(ticketNo is there) has already claimed this pattern

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
        return "You have already claimed this pattern for this ticket";
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

      // 📢 Broadcast claim updates
      io.to(roomId).emit("pattern_claimed", {
        message: `${patternName} Claimed by ${player?.name}, Approved by the System 🎉`,
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

        activeRooms.delete(roomId);
      }

      return true;
    },
    { rejectIfBusy: true }
  );
};

// dont need an update, not tested yet
export const assignNumbers = async (roomid) => {
  return await withRoomLock(
    roomid,
    async () => {
      const roomData = activeRooms.get(roomid);
      if (!roomData) {
        return "Room not found";
      }

      const allAssigned = !roomData.players
        .filter((player) => player?.assign_numbers !== undefined)
        .some(
          (playerWithNumbers) => playerWithNumbers.assign_numbers.length === 0
        );

      if (allAssigned) {
        return "Numbers already assigned";
      }

      // roomData.players = assignNumbersToPlayers(roomData.players);
      roomData.players = assignTickets(roomData.players);
      let isarr = Array.isArray(roomData.players);
      if (!isarr) {
        return "Error assigning numbers";
      }
      roomData.isOngoing = true;

      return true;
    },
    { rejectIfBusy: true }
  );
};

// reconnecting logic
export const reconnectPlayer = async (player, roomid) => {
  return await withRoomLock(
    roomid,
    async () => {
      try {
        if (!player || !roomid) return "Invalid player data";

        const roomId = roomid;

        const roomInDb = await Room.findOne({ roomid: roomId });
        let roomInMemory = activeRooms.get(roomId);

        if (!roomInDb && !roomInMemory) {
          return "Room not found";
        }

        if (roomInDb?.isCompleted || roomInMemory?.isCompleted) {
          return "Room is completed, please join a new one.";
        }

        // Load into memory if not already present
        if (!roomInMemory) {
          const loadedRoom = {
            host: roomInDb?.host,
            publicId: roomInDb?.publicId || null,

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
            requestedTicketCount: roomInDb?.requestedTicketCount || [],
          };
          activeRooms.set(roomId, loadedRoom);
          roomInMemory = activeRooms.get(roomId);
        }

        // Update socketId in memory
        const found = roomInMemory.players?.find((p) => p.id === player.id);
        if (found) {
          found.socketid = player.socketId;
        } else {
          return "Player not found in room, please join again";
        }

        return roomInMemory.isOngoing === true ? true : false;
      } catch (err) {
        console.error("Error reconnecting player:", err);
        return "Server error";
      }
    },
    { rejectIfBusy: true }
  );
};

// updated the code, tested (latest approch)
export const storeRoom = async (roomid) => {
  return await withRoomLock(
    roomid,
    async () => {
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
          hour12: false,
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
              user.invites = user.invites.filter(
                (invite) => invite.id !== roomid
              );
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

        activeRooms.delete(roomid);

        return 1;
      } catch (err) {
        console.error(`Error saving room ${roomid}:`, err);
        return "Error saving room";
      }
    },
    { rejectIfBusy: true }
  );
};
