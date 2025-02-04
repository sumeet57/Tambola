import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomid: {
      type: String,
      required: [true, "Room ID is required"],
      unique: true,
    },
    players: [
      {
        playerid: {
          type: String,
          required: [true, "Player ID is required"],
        },
        socketid: {
          type: String,
          required: [true, "Socket ID is required"],
        },
        name: {
          type: String,
          required: [true, "Name is required"],
        },
        claims: {
          type: [String], // Array of strings
          default: [],
        },
        assign_numbers: {
          type: [Number], // Array of numbers
          default: [],
        },
        ticket_count: {
          type: Number,
          default: 1,
        },
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
