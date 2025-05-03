import mongoose from "mongoose";
import moment from "moment-timezone"; // Import moment-timezone for formatting

const roomSchema = new mongoose.Schema(
  {
    roomid: {
      type: String,
      required: [true, "Room ID is required"],
      unique: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    players: [
      {
        id: String,
        name: String,
        phone: String,
        socketid: String,
        assign_numbers: [Number],
        requestedTicketCount: Number,
        ticketCount: Number,
        claims: [String],
      },
    ],
    settings: {
      type: Object,
      default: {},
    },
    claimData: [
      {
        player: {
          name: String,
          phone: String,
        },
        pattern: String,
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isOngoing: {
      type: Boolean,
      default: false,
    },
    finishTime: {
      type: String,
      default: "",
    },
  },
  { timestamps: false }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
