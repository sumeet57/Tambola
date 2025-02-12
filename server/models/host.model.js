import mongoose from "mongoose";

const hostSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  invites: {
    type: Array,
    default: [],
  },
  points: {
    type: Number,
    default: 100,
  },
});

const Host = mongoose.model("Host", hostSchema);

export default Host;
