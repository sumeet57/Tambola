import room from "./room.js";

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
  const currentRoom = room.find((r) => r.roomid === roomid);

  // Find the player
  const currentPlayer = currentRoom.players.find(
    (p) => p.userid === player.userid
  );
  currentPlayer.claims.push(claim);
  currentPlayer.points += parseInt(points);

  return room;
};
