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
        socketid: {
          type: String,
          required: [true, "Socket ID is required"],
        },
        name: {
          type: String,
          required: [true, "Name is required"],
        },
        claims: [
          {
            type: String,
            default: [],
          },
        ],
        assign_numbers: {
          type: Array,
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
