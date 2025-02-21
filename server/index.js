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

io.on("connection", (socket) => {
  try {
    // Creating room
    socket.on("create_room", async (roomid, ticket_count, player) => {
      try {
        if (!roomid || !ticket_count || !player) {
          socket.emit("error", "Invalid input");
          return;
        }

        const res = await createRoom(roomid, player, socket.id, ticket_count);
        if (res === "Room already exists") {
          socket.emit("error", "Room already exists");
          return;
        }
        socket.join(roomid);
        socket.emit("room_created", roomid);
        io.to(roomid).emit("player_update", room[roomid]?.playersList || []);
      } catch (err) {
        console.error("Error in create_room:", err);
        socket.emit("error", "Server error");
      }
    });

    // Joining room
    socket.on("join_room", (roomid, user, ticket_count) => {
      try {
        if (!roomid || !user || !ticket_count) {
          socket.emit("error", "Invalid input");
          return;
        }

        const res = joinRoom(roomid, user, socket.id, ticket_count);
        if (typeof res === "string") {
          socket.emit("error", res);
          return;
        }

        socket.join(roomid);
        socket.emit("room_joined", roomid);
        io.to(roomid).emit("player_update", room[roomid]?.playersList || []);
      } catch (err) {
        console.error("Error in join_room:", err);
        socket.emit("error", "Server error");
      }
    });

    // Starting game
    socket.on("start_game", (roomid) => {
      try {
        if (!roomid || !room[roomid]) {
          socket.emit("error", "Room not found");
          return;
        }

        const players = assignNumbers(roomid);
        if (typeof players === "string") {
          socket.emit("error", players);
          return;
        }

        setTimeout(() => {
          room[roomid].players?.forEach((player) => {
            io.to(player.socketid).emit("started_game", player.assign_numbers);
          });
        }, 1000);
      } catch (err) {
        console.error("Error in start_game:", err);
        socket.emit("error", "Server error");
      }
    });

    let drawno = [];
    // Claiming points
    socket.on("claim", async (roomid, userid, pattern, name) => {
      try {
        if (!roomid || !userid || !pattern || !name || !room[roomid]) {
          socket.emit("error", "Invalid claim request");
          return;
        }

        const res = claimPoint(roomid, userid, pattern);
        if (typeof res === "string") {
          socket.emit("error", res);
          return;
        }

        io.to(roomid).emit("claim_update", room[roomid]?.claimList || []);
        io.to(roomid).emit("claimed", pattern, name);

        if (room[roomid]?.claimList.includes(6)) {
          const winner = room[roomid]?.winner?.name;
          const saveRes = await storeRoom(roomid, room[roomid]);
          if (typeof saveRes === "string") {
            socket.emit("error", saveRes);
            return;
          }

          io.to(roomid).emit("room_data_stored", winner);
          drawno = [];
          io.to(roomid).emit("game_over");
        }
      } catch (err) {
        console.error("Error in claim:", err);
        socket.emit("error", "Server error");
      }
    });

    // Pick number
    socket.on("pick_number", (roomid) => {
      try {
        if (!roomid || !room[roomid]) {
          socket.emit("error", "Invalid room ID");
          return;
        }

        if (drawno.length >= 90) {
          socket.emit("error", "All numbers are drawn");
          return;
        }

        let number;
        do {
          number = Math.floor(Math.random() * 90) + 1;
        } while (drawno.includes(number));

        drawno.push(number);
        io.to(roomid).emit("number_drawn", number);
      } catch (err) {
        console.error("Error in pick_number:", err);
        socket.emit("error", "Server error");
      }
    });

    // Handle player disconnect
    socket.on("disconnect", () => {
      try {
        for (let roomId in room) {
          const playerIndex = room[roomId]?.players?.findIndex(
            (player) => player.socketid === socket.id
          );

          if (playerIndex !== -1) {
            room[roomId].players.splice(playerIndex, 1);
            room[roomId].playersList =
              room[roomId]?.players?.map((p) => p.name) || [];

            io.to(roomId).emit("player_update", room[roomId]?.playersList);
            io.to(roomId).emit("updatePlayers", room[roomId]?.players || []);

            if (room[roomId]?.players?.length === 0) {
              delete room[roomId];
            }
            break;
          }
        }
      } catch (err) {
        console.error("Error in disconnect:", err);
      }
    });

    // Handle messages
    socket.on("message", (message, roomid, playerName) => {
      try {
        if (!roomid || !message || !playerName) {
          socket.emit("error", "Invalid message");
          return;
        }
        io.to(roomid).emit("messageReceived", message, playerName);
      } catch (err) {
        console.error("Error in message:", err);
        socket.emit("error", "Server error");
      }
    });
  } catch (err) {
    console.error("Critical error in connection:", err);
  }
});

// Start the server safely
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Global error handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
