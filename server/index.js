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
import { activeRooms, pendingRoomDeletions } from "./socketConnections/room.js";
import {
  createRoom,
  joinRoom,
  assignNumbers,
  claimPoint,
  storeRoom,
  reconnectPlayer,
} from "./socketConnections/roomLogic.js";
import Room from "./models/room.model.js";
import { SaveExistingGameInDb } from "./utils/game.utils.js";
io.on("connection", (socket) => {
  try {
    // Creating room
    socket.on("create_room", async (player, setting) => {
      try {
        if (typeof player !== "object" || typeof setting !== "object") {
          socket.emit(
            "error",
            "Invalid input: player and setting must be objects"
          );
          return;
        }

        const res = await createRoom(player, setting);
        if (typeof res === "string") {
          socket.emit("error", res);
          return;
        }
        socket.join(setting.roomId);
        let room = activeRooms.get(setting.roomId);
        if (!room) {
          socket.emit("error", "Room not found in memory");
          return;
        }
        socket.emit(
          "room_created",
          (room = {
            id: setting.roomId,
            publicId: room.publicId,
          })
        );
        setTimeout(() => {
          io.to(setting.roomId).emit("player_update", room?.playersList || []);
        }, 1000);
      } catch (err) {
        console.error("Error in create_room:", err);
        socket.emit("error", "Server error");
      }
    });

    // Joining room
    socket.on("join_room", async (socketid, player, roomid, publicId) => {
      try {
        if (!socketid || !player || !roomid || !publicId) {
          socket.emit("error", "Invalid input");
          return;
        }

        const res = await joinRoom(socketid, player, roomid, publicId);
        if (typeof res === "string") {
          socket.emit("error", res);
          return;
        }
        let room = activeRooms.get(roomid);

        socket.join(roomid);
        if (res === false) {
          socket.emit("room_joined", roomid);
          socket.emit("reconnectToRoom", roomid);
          let hostSocketId = room.players.find(
            (p) => p?.id == room?.host
          ).socketid;
          setTimeout(() => {
            io.to(hostSocketId).emit(
              "requestedTicket",
              room?.requestedTicketCount || []
            );
          }, 1000);
        }
        setTimeout(() => {
          io.to(roomid).emit("player_update", room?.playersList || []);
        }, 1000);
      } catch (err) {
        console.error("Error in join_room:", err);
        socket.emit("error", "Server error");
      }
    });

    // Starting game
    socket.on("start_game", async (roomid, id) => {
      try {
        if (!roomid || !id) {
          socket.emit("error", "Room not found");
          return;
        }
        const room = activeRooms.get(roomid);
        if (!room) {
          socket.emit("error", "Room not found in memory");
          return;
        }

        if (room?.host !== id) {
          socket.emit("error", "You are not authorized to start the game");
          return;
        }

        const players = assignNumbers(roomid);
        if (typeof players === "string") {
          socket.emit("error", players);
          return;
        }
        const roomInDb = await Room.findOne({ roomid: roomid });
        if (roomInDb) {
          roomInDb.isOngoing = true;
          await roomInDb.save();
        }
        room.isOngoing = true;

        room.players?.forEach((player) => {
          io.to(player.socketid).emit("started_game", {
            player,
            setting: {
              roomid: roomid,
              patterns: room?.patterns || [],
              schedule: room?.schedule || null,
              claimTrack: room?.claimTrack || [],
            },
          });
        });
      } catch (err) {
        console.error("Error in start_game:", err);
        socket.emit("error", "Server error");
      }
    });

    // Claiming points
    socket.on("claim", async (player, roomid, pattern) => {
      try {
        if (!player || !roomid || !pattern) {
          socket.emit("error", "Invalid input");
          return;
        }
        let room = activeRooms.get(roomid);
        if (!room) {
          socket.emit("error", "Room not found in memory");
          return;
        }

        const res = claimPoint(player, roomid, pattern, io);
        if (typeof res === "string") {
          socket.emit("error", res);
          return;
        }

        io.to(roomid).emit("claimListUpdate", room?.claimList || []);
        io.to(roomid).emit("claimed", pattern, player?.name);
      } catch (err) {
        console.error("Error in claim:", err);
        socket.emit("error", "Server error");
      }
    });
    // Pick number (working fine)
    socket.on("pick_number", (roomid, id) => {
      try {
        if (!roomid || !id) {
          socket.emit("error", "Invalid room ID");
          return;
        }
        let room = activeRooms.get(roomid);
        if (!room) {
          socket.emit("error", "Room not found");
          return;
        }
        if (room?.host !== id) {
          socket.emit("error", "You are not authorized to pick a number");
          return;
        }

        if (room.drawno.length >= 90) {
          socket.emit("error", "All numbers are drawn");
          return;
        }

        let number;
        do {
          number = Math.floor(Math.random() * 90) + 1;
        } while (room.drawno.includes(number));

        room.drawno.push(number);
        io.to(roomid).emit("number_drawn", room.drawno);
      } catch (err) {
        console.error("Error in pick_number:", err);
        socket.emit("error", "Server error");
      }
    });

    socket.on("requestTicket", (id, roomid, count) => {
      try {
        let roomData = activeRooms.get(roomid);
        if (!roomData) {
          socket.emit("error", "Room not found in memory");
          return;
        }
        if (roomData?.players) {
          let foundIndex = roomData?.players?.findIndex(
            (player) => player.id == id
          );
          if (foundIndex) {
            roomData.players[foundIndex].ticketCount = count;
            roomData.requestedTicketCount =
              roomData.requestedTicketCount.filter(
                (player) => player.id !== id
              );
            socket.emit("requestedTicket", roomData.requestedTicketCount);
          }
        }
      } catch (err) {
        console.error("Error in requestedTicket:", err);
        socket.emit("error", "Server error while requesting ticket");
      }
    });
    //end this game
    socket.on("end_game", async (roomid, id) => {
      try {
        if (!roomid || !activeRooms.has(roomid) || !id) {
          socket.emit("error", "Invalid credentials");
          return;
        }
        let room = activeRooms.get(roomid);
        if (room?.players) {
          let found = room?.host == id;
          if (!found) {
            socket.emit("error", "You are not authorized to end the game");
            return;
          }
        }
        const endRes = await storeRoom(roomid);
        if (typeof endRes === "string") {
          socket.emit("error", endRes);
          return;
        }

        io.to(roomid).emit("room_data_stored", "Game ended by host");
      } catch (err) {
        console.error("Error in end_game:", err);
        socket.emit("error", "Server error");
      }
    });
    // reconnect player
    socket.on("reconnect_player", async (player, roomid) => {
      try {
        if (!player || !roomid) {
          socket.emit("error", "Invalid input");
          return;
        }
        const res = await reconnectPlayer(player, roomid);
        if (typeof res === "string") {
          socket.emit("error", res);
          return;
        }
        let room = activeRooms.get(roomid);
        if (!room) {
          socket.emit("error", "Room not found in memory");
          return;
        }
        socket.join(roomid);
        if (res === false) {
          socket.emit("reconnectToRoom", {
            roomid: roomid,
            publicId: room?.publicId || "",
          });
          // io.to(roomid).emit("player_update", room?.playersList || []);
        } else if (res === true) {
          const assignNumber =
            room.players?.find((p) => p.id === player.id)?.assign_numbers || [];
          socket.emit("reconnectToGame", {
            drawno: room.drawno || 0,
            patterns: room.patterns || [],
            schedule: room.schedule || null,
            claimTrack: room.claimTrack || [],
            assign_numbers: assignNumber || [],
            ticketCount: room?.players?.find((p) => p.id === player.id)
              ?.ticketCount,
            roomid: roomid,
          });
          setTimeout(() => {
            socket.emit("number_drawn", room.drawno || []);
          }, 500);
          setTimeout(() => {
            socket.emit("reconnectedPlayer", room.drawno || []);
          }, 1000);
        }
        setTimeout(() => {
          io.to(roomid).emit("player_update", room?.playersList || []);
        }, 1000);
      } catch (err) {
        console.error("Error in reconnect_player:", err);
        socket.emit("error", "Server error");
      }
    });

    // Handle player disconnection
    socket.on("disconnect", async () => {
      try {
        for (const [roomId, room] of activeRooms.entries()) {
          const players = room?.players || [];
          const playerIndex = players.findIndex(
            (player) => player.socketid === socket.id
          );

          if (playerIndex !== -1) {
            const disconnectedPlayer = players[playerIndex];

            // Remove player from the room if the room is not ongoing
            if (!room.isOngoing) {
              if (room.host !== disconnectedPlayer.id) {
                players.splice(playerIndex, 1);
                room.playersList = players.map((player) => player.name);
                room.players = players;
                io.to(roomId).emit("player_update", room.playersList);
                io.to(roomId).emit("updatePlayers", players);
              }
            } else {
              players[playerIndex].socketid = null; // Set socket ID to null for ongoing games
              room.playersList = players
                .filter((p) => p.socketid !== null)
                .map((player) => player.name);
              io.to(roomId).emit("player_update", room.playersList);
            }

            // If room is empty, schedule deletion
            const actualPlayers = room.players.filter(
              (player) => player.socketid !== null
            ).length;
            if (actualPlayers === 0) {
              const timeout = setTimeout(async () => {
                if (
                  activeRooms
                    .get(roomId)
                    ?.players.filter((player) => player.socketid !== null)
                    .length === 0
                ) {
                  // if room is in db, then save it and then delete it from memory
                  const roomData = activeRooms.get(roomId);
                  const roomInDb = await Room.findOne({ roomid: roomId });
                  if (roomInDb) {
                    SaveExistingGameInDb(roomId, roomData);
                  }

                  activeRooms.delete(roomId);
                  pendingRoomDeletions.delete(roomId);
                }
              }, 5 * 60 * 1000); // 5 minutes

              pendingRoomDeletions.set(roomId, timeout);
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
          socket.emit("error", "Invalid credentials");
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
