import room from "./room.js";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";
//internal functions of logic
import { assignNumbersToPlayers } from "./assignNumberLogic.js";

export const createRoom = (roomid, player, socketid, ticket_count) => {
  //validations
  if (room[roomid]) {
    return "Room already exists";
  }

  // Create a new room
  room[roomid] = {
    players: [],
    isCompleted: false,
    playersList: [player.name],
    claimList: [],
  };

  room[roomid].players.push({
    playerid: player._id,
    socketid: socketid,
    name: player.name,
    claims: [],
    assign_numbers: [],
    ticket_count: ticket_count,
  });

  return room;
};

export const joinRoom = (roomId, player, socketid, ticket_count) => {
  // Check if the room exists
  if (!room[roomId]) {
    return "Room not found";
  }
  if (room[roomId].isCompleted === true) {
    return "Room is already started";
  }

  room[roomId].players.push({
    playerid: player._id,
    socketid: socketid,
    name: player.name,
    claims: [],
    assign_numbers: [],
    ticket_count: ticket_count,
  });

  room[roomId].playersList.push(player.name);

  return room;
};

export const claimPoint = (roomid, userid, pattern) => {
  // Find the room
  if (!room[roomid]) {
    return "Room not found";
  }
  // Find the player
  const playerIndex = room[roomid].players.findIndex(
    (p) => p.playerid === userid
  );
  if (playerIndex === -1) {
    return "Player not found";
  }
  // Update the player's points
  if (room[roomid].claimList.includes(pattern)) {
    return "Pattern already claimed";
  }

  room[roomid].claimList.push(pattern);

  switch (pattern) {
    case 1:
      room[roomid].players[playerIndex].claims.push("first line");
      break;
    case 2:
      room[roomid].players[playerIndex].claims.push("second line");
      break;
    case 3:
      room[roomid].players[playerIndex].claims.push("third line");
      break;
    case 4:
      room[roomid].players[playerIndex].claims.push("early five");
      break;
    case 5:
      room[roomid].players[playerIndex].claims.push("corners");
      break;
    case 6:
      room[roomid].players[playerIndex].claims.push("full house");
      break;
    default:
      return "Invalid pattern";
  }

  return room;
};

export const assignNumbers = (roomid) => {
  if (!room[roomid]) {
    return "Room not found";
  }
  //check if players has already assigned numbers
  const playersHasNoNumbers = room[roomid].players.some(
    (player) => player.assign_numbers.length === 0
  );
  if (!playersHasNoNumbers) {
    return "Numbers already assigned";
  }
  // Assign numbers to the player
  const playersWithAssignNumbers = assignNumbersToPlayers(room[roomid].players);
  // Update the room
  room[roomid].players = playersWithAssignNumbers;
  room[roomid].isCompleted = true;

  return room;
};

export const storeRoom = (roomid, roomData) => {
  // console.log("Room data", roomData);
  if (!room[roomid]) {
    return "Room not found";
  }
  if (roomData) {
    const newRoom = new Room({
      roomid: roomid,
      players: roomData.players,
      isCompleted: roomData.isCompleted,
    });
    newRoom.save();

    // Update the user's room
    roomData.players.forEach(async (player) => {
      try {
        const user = await User.findById(player.playerid);
        if (user) {
          // Remove the roomid from invites array
          user.invites = [];
          await user.save();
        }
      } catch (err) {
        console.error(`Error updating user ${player.playerid}:`, err);
      }
    });
    // Delete the room from the memory
    delete room[roomid];
    return "Room saved successfully";
  } else {
    return "Room data not found";
  }
};
