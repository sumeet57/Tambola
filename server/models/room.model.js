import mongoose from "mongoose";
import moment from "moment-timezone"; // Import moment-timezone for formatting

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
    finishTime: {
      type: String, // Store as a formatted string
      default: function () {
        return moment()
          .tz("Asia/Kolkata") // Convert to IST
          .format("DD-MM-YYYY | hh:mm A"); // Readable format
      },
    },
  },
  { timestamps: false } // Disable default timestamps
);

// Middleware to update the `finishTime` field in IST before saving
roomSchema.pre("save", function (next) {
  this.finishTime = moment().tz("Asia/Kolkata").format("DD-MM-YYYY | hh:mm A"); // Format: Date-Month-Year | Time
  next();
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
