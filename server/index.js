import http from "http";
import { Server } from "socket.io";

//importing database connection and connecting to database
import connectDB from "./database/main.js";
connectDB();

//import app and create server
import app from "./app.js";
const server = http.createServer(app);

// Initialize socket.io with client
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//importing socket connection logic
import room from "./socketConnections/room.js";
import {
  createRoom,
  joinRoom,
  assignNumbers,
  claimPoint,
  storeRoom,
} from "./socketConnections/roomLogic.js";

// Handle WebSocket connections
io.on("connection", (socket) => {
  //creating room
  socket.on("create_room", async (roomid, ticket_count, player) => {
    const res = await createRoom(roomid, player, socket.id, ticket_count);
    // console.log("res", res);
    if (res === "Room already exists") {
      socket.emit("error", "Room already exists");
      return;
    }
    socket.join(roomid);
    socket.emit("room_created", roomid);
    io.to(roomid).emit("player_update", room[roomid]?.playersList);
  });
  //joining room
  socket.on("join_room", (roomid, user, ticket_count) => {
    // console.log("Joining room", roomid, user, socket.id, ticket_count);
    const res = joinRoom(roomid, user, socket.id, ticket_count);
    if (res === "Room not found") {
      socket.emit("error", "Room not found");
      return;
    } else if (res === "Room is already started") {
      socket.emit("error", "Room is already started");
      return;
    } else if (res === "Player already exists") {
      socket.emit("error", "Player already exists");
      return;
    } else {
      socket.join(roomid);
      socket.emit("room_joined", roomid);
      // console.log("Room joined", room[roomid].playersList);
      io.to(roomid).emit("player_update", room[roomid].playersList);
    }
  });
  //starting game
  //assigning numbers to players
  socket.on("start_game", (roomid) => {
    const players = assignNumbers(roomid);
    if (players === "Room not found") {
      socket.emit("error", "Room not found");
      return;
    } else if (players === "Numbers already assigned") {
      socket.emit("error", "Numbers already assigned");
      return;
    }

    setTimeout(() => {
      for (let i = 0; i < room[roomid].players.length; i++) {
        io.to(room[roomid].players[i].socketid).emit(
          "started_game",
          room[roomid].players[i].assign_numbers
        );
      }
    }, 1000);

    // Listen for game over event to stop the interval
    socket.on("game_over", () => {
      // console.log("entered and cleared interval");
      io.to(roomid).emit("game_over");
    });
  });
  //claiming points
  socket.on("claim", async (roomid, userid, pattern, name) => {
    const res = claimPoint(roomid, userid, pattern);
    if (res === "Room not found") {
      socket.emit("error", "Room not found");
      return;
    } else if (res === "Player not found") {
      socket.emit("error", "Player not found");
      return;
    } else if (res === "Pattern already claimed") {
      socket.emit("error", "Pattern already claimed");
      return;
    } else {
      io.to(roomid).emit("claim_update", room[roomid].claimList);
      io.to(roomid).emit("claimed", pattern, name);
      if (room[roomid].claimList.includes(6)) {
        const res = await storeRoom(roomid, room[roomid]);
        if (res === "Room not found") {
          socket.emit("error", "Room not found while storing room data");
          return;
        }
        if (res === "Room data not found") {
          socket.emit("error", "Room data not found while storing room data");
          return;
        }
        if (res === "Room saved successfully") {
          // console.log("Room saved successfully");
          io.to(roomid).emit("room_data_stored");
        }
        io.to(roomid).emit("game_over");
        socket.emit("game_over");
      }
    }
  });
  //pick number
  let drawno = [];
  socket.on("pick_number", (roomid) => {
    if (drawno.length === 90) {
      socket.emit("error", "All numbers are drawn");
      drawno = [];
    } else if (drawno.length < 90) {
      let number = Math.floor(Math.random() * 90) + 1;
      while (drawno.includes(number)) {
        number = Math.floor(Math.random() * 90) + 1;
      }
      drawno.push(number);
      io.to(roomid).emit("number_drawn", number);
    }
  });
  //remove player from room on disconnect
  socket.on("disconnect", () => {
    // console.log("User disconnected", socket.id);
    for (let roomId in room) {
      const playerIndex = room[roomId].players.findIndex(
        (player) => player.socketid === socket.id
      );
      if (playerIndex !== -1) {
        room[roomId].players.splice(playerIndex, 1); // Remove player
        // console.log("Player removed", room[roomId].players);
        room[roomId].playersList = room[roomId].players.map(
          (player) => player.name
        );
        // console.log("Players list", room[roomId].playersList);
        io.to(roomId).emit("player_update", room[roomId].playersList);

        io.to(roomId).emit("updatePlayers", room[roomId].players);

        if (room[roomId].players.length === 0) {
          delete room[roomId]; // Delete empty rooms
        }
        break;
      }
    }
  });
  //message socket
  socket.on("message", (message, roomid, playerName) => {
    io.to(roomid).emit("messageReceived", message, playerName);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
