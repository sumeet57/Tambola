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
import { createRoom, joinRoom } from "./socketConnections/roomLogic.js";

// Handle WebSocket connections
io.on("connection", (socket) => {
  //creating room
  socket.on("create_room", (roomid, player, socketid, ticket_count) => {
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
    } else {
      socket.join(roomid);
      socket.emit("room_joined", roomid);
      io.to(roomid).emit("player_update", room[roomid].playersList);
    }
  });
  //starting game
  socket.on("start_game", (roomid) => {
    io.to(roomid).emit("game_started");
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
