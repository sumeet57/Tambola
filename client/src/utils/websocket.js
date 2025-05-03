import { io } from "socket.io-client";

//import env
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const socket = io(apiBaseUrl, {
  // reconnection: true,
  // reconnectionAttempts: 5,
  // reconnectionDelay: 1000,
  // autoConnect: true,
});

// Log connection events
socket.on("connect", () => {
  console.log(`Connected with ID: ${socket.id}`);
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error.message);
});

export default socket;
