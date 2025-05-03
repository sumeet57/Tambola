import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
  invites: [
    {
      type: Object,
      default: {},
    },
  ],
  role: {
    type: String,
    enum: ["user", "host"],
    required: true,
    default: "user",
  },
});

const User = mongoose.model("User", userSchema);

export default User;
