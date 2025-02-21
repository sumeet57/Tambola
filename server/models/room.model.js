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
    createdAt: {
      type: Date,
      default: () => new Date(Date.now() + 5.5 * 60 * 60 * 1000), // Store in IST
    },
    updatedAt: {
      type: Date,
      default: () => new Date(Date.now() + 5.5 * 60 * 60 * 1000), // Store in IST
    },
  },
  { timestamps: false } // Disable default timestamps since we are handling them manually
);

// Middleware to update the `updatedAt` field in IST before saving
roomSchema.pre("save", function (next) {
  this.updatedAt = new Date(Date.now() + 5.5 * 60 * 60 * 1000); // Update `updatedAt` in IST
  next();
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
