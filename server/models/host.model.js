import mongoose from "mongoose";

const hostSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  points: {
    type: Number,
    default: 100,
  },
});

const Host = mongoose.model("Host", hostSchema);

export default Host;
