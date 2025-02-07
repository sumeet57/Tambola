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
  socket.on("create_room", (roomid, ticket_count, player) => {
    const res = createRoom(roomid, player, socket.id, ticket_count);
    if (res === "Room already exists") {
      socket.emit("error", "Room already exists");
      return;
    }
    socket.join(roomid);
    socket.emit("room_created", roomid);
    io.to(roomid).emit("player_update", room[roomid].playersList);
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
  socket.on("claim", (roomid, userid, pattern) => {
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
      io.to(roomid).emit("claimed", pattern);
      if (room[roomid].claimList.includes(6)) {
        const res = storeRoom(roomid, room[roomid]);
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
    for (let roomId in room) {
      if (room[roomId].players[socket.id]) {
        delete room[roomId].players[socket.id]; // Remove player

        io.to(roomId).emit(
          "updatePlayers",
          Object.values(room[roomId].players)
        );

        if (Object.keys(room[roomId].players).length === 0) {
          delete room[roomId]; // Delete empty rooms
        }
        break;
      }
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
