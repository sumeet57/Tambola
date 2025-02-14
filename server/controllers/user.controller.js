import Host from "../models/host.model.js";
import User from "../models/user.model.js";

// /api/user/register
export const createUser = async (req, res) => {
  let { name, phone, password } = req.body;
  phone = phone.toString().trim();
  password = password.toString().trim();
  name = name.toString().trim();

  //validation
  if (!name || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  } else if (phone.length !== 10) {
    return res.status(400).json({ message: "Phone number must be 10 digits" });
  } else if (password.length < 6 || password.length > 20) {
    return res
      .status(400)
      .json({ message: "Password must be between 6 to 20 characters" });
  } else if (name.length < 3 || name.length > 20) {
    return res
      .status(400)
      .json({ message: "Name must be between 3 to 20 characters" });
  }

  const existingUser =
    (await User.findOne({ phone })) || (await Host.findOne({ phone }));

  if (existingUser) {
    return res.status(400).json({ message: "Phone is already register" });
  }

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
  let { phone, password } = req.body;
  phone = phone.toString().trim();
  password = password.toString().trim();

  //validation
  if (!phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  } else if (phone.length !== 10) {
    return res.status(400).json({ message: "Phone number must be 10 digits" });
  } else if (password.length < 6 || password.length > 20) {
    return res
      .status(400)
      .json({ message: "Password must be between 6 to 20 characters" });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const passwordMatch = user.password === password;
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid password" });
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
  let { userid } = req.body;
  userid = userid.toString().trim();

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
