import room from "./room.js";
import roomInDb from "./checkDbRooms.js";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";
import Host from "../models/host.model.js";
//internal functions of logic
import { assignNumbersToPlayers } from "./assignNumberLogic.js";

export const createRoom = async (roomid, player, socketid, ticket_count) => {
  //validations

  const roomExists = room[roomid] || roomInDb.includes(roomid);
  if (roomExists) {
    return "Room already exists";
  }

  // Create a new room
  room[roomid] = {
    players: [
      {
        playerid: player._id,
        socketid: socketid,
        name: player.name,
        phone: player.phone,
        claims: [],
        assign_numbers: [],
        ticket_count: ticket_count,
      },
    ],
    playersList: [player.name],
    claimList: [],
    isCompleted: false,
    winner: {},
  };

  try {
    // console.log("Player", player._id);
    const host = await Host.findById(player._id);

    if (host) {
      host.invites = [];
      let roomIdExists = host.invites.includes(roomid);
      if (!roomIdExists) {
        host.invites.push(roomid);
      }
    }
    await host.save();
  } catch (err) {
    console.error(`Error updating host ${player._id}:`, err);
  }
  // console.log("Room created", room[roomid].players);
  return room;
};

export const joinRoom = (roomId, player, socketid, ticket_count) => {
  // console.log("Joining room", roomId, player, socketid, ticket_count);
  // Check if the room exists
  if (!room[roomId]) {
    return "Room not found";
  }
  if (room[roomId].isCompleted === true) {
    return "Room is already started";
  }
  // serach for the player in the room
  const playerExists = room[roomId].players.some(
    (p) => p.playerid === player._id
  );
  if (playerExists) {
    room[roomId].players = room[roomId].players.filter(
      (p) => p.playerid !== player._id
    );
    room[roomId].playersList = room[roomId].playersList.filter(
      (name) => name !== player.name
    );
  }

  room[roomId].players.push({
    playerid: player._id,
    socketid: socketid,
    name: player.name,
    phone: player.phone,
    claims: [],
    assign_numbers: [],
    ticket_count: ticket_count,
  });

  room[roomId].playersList.push(player.name);
  // console.log("Room joined", room[roomId].players);

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
      room[roomid].winner = {
        id: userid,
        name: room[roomid].players[playerIndex].name,
        phone: room[roomid].players[playerIndex].phone,
        claims: room[roomid].players[playerIndex].claims,
      };
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
  // console.log("Assigning numbers to players", room[roomid].players);
  const playersWithAssignNumbers = assignNumbersToPlayers(room[roomid].players);
  // Update the room
  room[roomid].players = playersWithAssignNumbers;
  room[roomid].isCompleted = true;

  return room;
};

export const storeRoom = async (roomid, roomData) => {
  // console.log("Room data", roomData);
  if (!room[roomid]) {
    return "Room not found";
  }
  if (roomData) {
    try {
      const newRoom = new Room({
        roomid: roomid,
        players: roomData.players,
        isCompleted: roomData.isCompleted,
        winner: roomData.winner,
      });
      await newRoom.save();

      roomInDb.push(roomid);

      // Update the user's room
      for (const player of roomData.players) {
        try {
          const user = await User.findById(player.playerid);
          const host = await Host.findById(player.playerid);
          if (user) {
            // Remove the roomid from invites array
            user.invites = [];
            await user.save();
          }
          if (host) {
            // Remove the roomid from invites array
            host.invites = [];
            await host.save();
          }
        } catch (err) {
          console.error(`Error updating user ${player.playerid}:`, err);
        }
      }
      // Delete the room from the memory
      delete room[roomid];
      return "Room saved successfully";
    } catch (err) {
      console.error(`Error saving room ${roomid}:`, err);
      return "Error saving room";
    }
  } else {
    return "Room data not found";
  }
};
