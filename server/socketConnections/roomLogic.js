import room from "./room.js";

//internal functions of logic
import { assignNumbersToPlayers } from "./assignNumberLogic.js";

export const createRoom = (roomid, player, socketid, ticket_count) => {
  //validations
  if (room[roomid]) {
    return "Room already exists";
  }

  // Create a new room
  room[roomid] = {
    players: [
      {
        userid: player._id,
        socketid: socketid,
        name: player.name,
        claims: [],
        points: 0,
        assign_numbers: [],
        ticket_count: ticket_count,
      },
    ],
    isCompleted: false,
    playersList: [player.name],
  };
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
    userid: player._id,
    socketid: socketid,
    name: player.name,
    claims: [],
    points: 0,
    assign_numbers: [],
    ticket_count: ticket_count,
  });

  room[roomId].playersList.push(player.name);

  return room;
};

export const claimPoint = (roomid, player, points, claim) => {
  // Find the room
  if (!room[roomid]) {
    return "Room not found";
  }
  // Find the player
  const playerIndex = room[roomid].players.findIndex(
    (p) => p.userid === player._id
  );
  if (playerIndex === -1) {
    return "Player not found";
  }
  // Update the player's points
  room[roomid].players[playerIndex].points += points;
  room[roomid].players[playerIndex].claims.push(claim);

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
