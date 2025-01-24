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
    origin: "http://localhost:5173",
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
} from "./socketConnections/roomLogic.js";

// Handle WebSocket connections
io.on("connection", (socket) => {
  //creating room
  socket.on("create_room", (roomid, ticket_count, player, socketid) => {
    const res = createRoom(roomid, player, socketid, ticket_count);
    if (res === "Room already exists") {
      socket.emit("error", "Room already exists");
      return;
    }
    socket.join(roomid);
    socket.emit("room_created", roomid);
    io.to(roomid).emit("player_update", room[roomid].playersList);
  });
  //joining room
  socket.on("join_room", (roomid, user, socketid, ticket_count) => {
    const res = joinRoom(roomid, user, socketid, ticket_count);
    if (res === "Room not found") {
      socket.emit("error", "Room not found");
      return;
    } else if (res === "Room is already started") {
      socket.emit("error", "Room is already started");
      return;
    } else {
      socket.join(roomid);
      socket.emit("room_joined", roomid);
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

    for (let i = 0; i < room[roomid].players.length; i++) {
      io.to(room[roomid].players[i].socketid).emit(
        "numbers_assigned",
        room[roomid].players[i].assign_numbers
      );
    }
    //this drawNumber array to track the numbers which are already drawn
    const drawNumbers = [];
    let i = 1;
    const interval = setInterval(() => {
      if (i > 90) {
        clearInterval(interval);
        return;
      }
      const random = Math.floor(Math.random() * 90) + 1;
      if (drawNumbers.includes(random)) {
        return;
      } else {
        drawNumbers.push(random);
        io.to(roomid).emit("draw_number", random);
        i++;
      }
    }, 5000); // Adjust the interval time as needed
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
