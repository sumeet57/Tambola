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
          default: "",
        },
        socketid: {
          type: String,
          default: "",
        },
        name: {
          type: String,
          default: "",
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
    winner: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
