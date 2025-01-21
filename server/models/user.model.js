import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
    // unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  invites: [
    {
      type: String,
      default: [],
    },
  ],
  points: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
