import Host from "../models/host.model.js";
import User from "../models/user.model.js";

// /api/host/register
export const createHost = async (req, res) => {
  let { name, phone, password } = req.body;
  phone = phone.toString().trim();
  name = name.toString().trim();
  password = password.toString().trim();

  //vallidations
  if (!name || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  } else if (phone.length !== 10) {
    return res
      .status(400)
      .json({ message: "Phone number should be 10 digits" });
  } else if (password.length < 6 || password.length > 20) {
    return res
      .status(400)
      .json({ message: "Password should be between 6 to 20 characters" });
  } else if (name.length < 3 || name.length > 20) {
    return res
      .status(400)
      .json({ message: "Name should be between 3 to 20 characters" });
  }

  const hostExists =
    (await Host.findOne({ phone })) || (await User.findOne({ phone }));
  if (hostExists) {
    return res.status(400).json({ message: "Phone is already register" });
  }

  try {
    const host = await Host.create({ name, phone, password });
    const hostid = host._id;
    res
      .status(200)
      .json({ host, hostid, message: "Host created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// /api/host/login
export const loginHost = async (req, res) => {
  let { phone, password } = req.body;
  phone = phone.toString().trim();
  password = password.toString().trim();

  //vallidations
  if (!phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  } else if (phone.length !== 10) {
    return res
      .status(400)
      .json({ message: "Phone number should be 10 digits" });
  } else if (password.length < 6 || password.length > 20) {
    return res
      .status(400)
      .json({ message: "Password should be between 6 to 20 characters" });
  }

  try {
    const host = await Host.findOne({ phone });
    if (!host) {
      return res.status(400).json({ message: "Host not register" });
    }
    let isMatch = host.password === password;
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const hostid = host._id;
    res
      .status(200)
      .json({ host, hostid, message: "Host logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// /api/host/invite
export const inviteUser = async (req, res) => {
  let { phone, roomid, points, id } = req.body;
  phone = phone.toString().trim();

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "player not found" });
    }
    const playerInvited = user.invites.includes(roomid);
    if (playerInvited) {
      return res.status(400).json({ message: "Player already invited" });
    }
    const host = await Host.findById(id);
    if (!host) {
      return res.status(400).json({ message: "Host not found" });
    }
    // console.log(host.points, points);
    if (host.points <= points) {
      return res.status(400).json({ message: "Insufficient points" });
    }

    user.invites = [];
    user.invites.push(roomid);
    user.points += parseInt(points);
    user.save();
    host.points -= parseInt(points);
    host.save();

    res.status(200).json({ message: "User invited successfully", data: host });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
