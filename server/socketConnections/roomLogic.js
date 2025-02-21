import room from "./room.js";
import roomInDb from "./checkDbRooms.js";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";
import Host from "../models/host.model.js";
import { assignNumbersToPlayers } from "./assignNumberLogic.js";

export const createRoom = async (roomid, player, socketid, ticket_count) => {
  try {
    if (!roomid || !player || !socketid || !ticket_count) {
      return "Invalid room parameters";
    }

    if (room[roomid] || roomInDb.includes(roomid)) {
      return "Room already exists";
    }

    room[roomid] = {
      players: [
        {
          playerid: player._id,
          socketid,
          name: player.name,
          phone: player.phone,
          claims: [],
          assign_numbers: [],
          ticket_count,
        },
      ],
      playersList: [player.name],
      claimList: [],
      isCompleted: false,
      winner: {},
    };

    const host = await Host.findById(player._id);
    if (host) {
      if (!host.invites.includes(roomid)) {
        host.invites.push(roomid);
        await host.save();
      }
    }

    return room;
  } catch (err) {
    console.error("Error creating room:", err);
    return "Error creating room";
  }
};

export const joinRoom = (roomId, player, socketid, ticket_count) => {
  try {
    if (!roomId || !player || !socketid || !ticket_count) {
      return "Invalid join parameters";
    }

    if (!room[roomId]) {
      return "Room not found";
    }

    if (room[roomId].isCompleted) {
      return "Room has already started";
    }

    room[roomId].players = room[roomId].players.filter(
      (p) => p.playerid !== player._id
    );

    room[roomId].players.push({
      playerid: player._id,
      socketid,
      name: player.name,
      phone: player.phone,
      claims: [],
      assign_numbers: [],
      ticket_count,
    });

    room[roomId].playersList = room[roomId].players.map((p) => p.name);

    return room;
  } catch (err) {
    console.error("Error joining room:", err);
    return "Error joining room";
  }
};

export const claimPoint = (roomid, userid, pattern) => {
  try {
    if (!room[roomid]) {
      return "Room not found";
    }

    const player = room[roomid].players.find((p) => p.playerid === userid);
    if (!player) {
      return "Player not found";
    }

    if (room[roomid].claimList.includes(pattern)) {
      return "Pattern already claimed";
    }

    room[roomid].claimList.push(pattern);

    const claimNames = [
      "first line",
      "second line",
      "third line",
      "early five",
      "corners",
      "full house",
    ];

    if (pattern >= 1 && pattern <= 6) {
      player.claims.push(claimNames[pattern - 1]);
      if (pattern === 6) {
        room[roomid].winner = {
          id: userid,
          name: player.name,
          phone: player.phone,
          claims: player.claims,
        };
      }
      return room;
    }

    return "Invalid pattern";
  } catch (err) {
    console.error("Error claiming point:", err);
    return "Error claiming point";
  }
};

export const assignNumbers = (roomid) => {
  try {
    if (!room[roomid]) {
      return "Room not found";
    }

    if (
      !room[roomid].players.some((player) => player.assign_numbers.length === 0)
    ) {
      return "Numbers already assigned";
    }

    room[roomid].players = assignNumbersToPlayers(room[roomid].players);
    room[roomid].isCompleted = true;

    return room;
  } catch (err) {
    console.error("Error assigning numbers:", err);
    return "Error assigning numbers";
  }
};

export const storeRoom = async (roomid, roomData) => {
  try {
    if (!roomid || !roomData) {
      return "Invalid room data";
    }

    if (!room[roomid]) {
      return "Room not found";
    }

    const newRoom = new Room({
      roomid,
      players: roomData.players,
      isCompleted: roomData.isCompleted,
      winner: roomData.winner,
    });

    await newRoom.save();
    roomInDb.push(roomid);

    for (const player of roomData.players) {
      try {
        const user = await User.findById(player.playerid);
        const host = await Host.findById(player.playerid);

        if (user) {
          user.invites = [];
          await user.save();
        }
        if (host) {
          host.invites = [];
          await host.save();
        }
      } catch (err) {
        console.error(`Error updating player ${player.playerid}:`, err);
      }
    }

    delete room[roomid];

    return 1;
  } catch (err) {
    console.error(`Error saving room ${roomid}:`, err);
    return "Error saving room";
  }
};
