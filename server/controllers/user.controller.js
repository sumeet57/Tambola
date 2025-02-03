import User from "../models/user.model.js";

// /api/user/register
export const createUser = async (req, res) => {
  const { name, phone, password } = req.body;
  console.log(req.body);
  try {
    const user = await User.create({ name, phone, password });
    const userid = user._id;
    res
      .status(200)
      .json({ user, userid, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// /api/user/login
export const loginUser = async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ name, password });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const userid = user._id;
    res
      .status(200)
      .json({ user, userid, message: "User logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// /api/user/find
export const findUser = async (req, res) => {
  const { userid } = req.body;

  try {
    const user = await User.findById(userid);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ user, message: "User found successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
