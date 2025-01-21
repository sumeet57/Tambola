import Host from "../models/host.model.js";
import User from "../models/user.model.js";

export const createHost = async (req, res) => {
  const { name, phone, password } = req.body;

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

export const loginHost = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const host = await Host.findOne({ phone, password });
    if (!host) {
      return res.status(400).json({ message: "Host not found" });
    }
    const hostid = host._id;
    res
      .status(200)
      .json({ host, hostid, message: "Host logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const inviteUser = async (req, res) => {
  const { name, roomid, points } = req.body;

  try {
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    user.invites.push(roomid);
    user.points += parseInt(points);
    user.save();

    res.status(200).json({ message: "User invited successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
