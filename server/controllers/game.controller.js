import User from "../models/user.model.js";
import Host from "../models/host.model.js";

// /api/game/points
export const deductPoints = async (req, res) => {
  const { id, points } = req.body;
  // id = id.trim();

  const user = await User.findById(id);
  const host = await Host.findById(id);
  if (!user && !host) {
    return res.status(400).json({ message: "User not found" });
  }
  if (user) {
    user.points -= parseInt(points);
    await user.save();

    return res
      .status(200)
      .json({ data: user, message: "Points deducted successfully" });
  }
  if (host) {
    host.points -= parseInt(points);
    await host.save();
    return res
      .status(200)
      .json({ data: host, message: "Points deducted successfully" });
  }
};

// /api/game/avaliable
export const isPointsAvailable = async (req, res) => {
  const { id, ticket } = req.body;
  const user = await User.findById(id);
  const host = await Host.findById(id);
  if (!user && !host) {
    return res.status(400).json({ message: "User not found" });
  }
  if (user) {
    if (user.points >= ticket) {
      return res.status(200).json({ message: "Points available" });
    } else {
      return res.status(400).json({ message: "Points not available" });
    }
  }
  if (host) {
    if (host.points >= ticket) {
      return res.status(200).json({ message: "Points available" });
    } else {
      return res.status(400).json({ message: "Points not available" });
    }
  }
};

// /api/game/invited
export const isPlayerInvited = async (req, res) => {
  let { phone, roomid } = req.body;
  phone = phone.toString().trim();

  //validation
  if (!phone || !roomid) {
    return res.status(400).json({ message: "All fields are required" });
  } else if (phone.length !== 10) {
    return res
      .status(400)
      .json({ message: "Phone number must be 10 digits (login back)" });
  }

  // Find the player by name
  const player =
    (await User.findOne({ phone })) || (await Host.findOne({ phone }));
  if (!player) {
    return res.status(400).json({ message: "Player not found" });
  }

  // Check if the player is invited
  const isInvited = player.invites.includes(roomid);

  if (!isInvited) {
    return res.status(400).json({ message: "Player not invited" });
  }

  return res.status(200).json({ message: "Player is Invited" });
};

// /api/game/player
export const getPlayerData = async (req, res) => {
  const { id } = req.body;
  const user = await User.findById(id);
  const host = await Host.findById(id);
  if (!user && !host) {
    return res.status(400).json({ message: "User not found" });
  } else if (user) {
    return res.status(200).json({ data: user, message: "User found" });
  } else if (host) {
    return res.status(200).json({ data: host, message: "Host found" });
  }
};

// for storing room data in databse
// export const storeRoomData = async (req, res) => {};
