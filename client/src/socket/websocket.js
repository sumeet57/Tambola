import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

// Log connection events
socket.on("connect", () => {
  console.log(`Connected with ID: ${socket.id}`);
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error.message);
});

export default socket;
