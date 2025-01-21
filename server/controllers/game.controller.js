import User from "../models/user.model.js";
import Host from "../models/host.model.js";

export const deductPoints = async (req, res) => {
  const { id, points } = req.body;

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
    host.points -= points;
    await host.save();
    return res
      .status(200)
      .json({ data: host, message: "Points deducted successfully" });
  }
};

export const isPlayerInvited = async (req, res) => {
  const { name, roomid, ticket } = req.body;
  const player = await User.findOne({ name });
  if (!player) {
    return res.status(404).json({ message: "Player not found" });
  }
  const isInvited = player.invites.includes(roomid);
  const points = player.points - parseInt(ticket);
  if (isInvited && points >= 0) {
    player.points = points;
    await player.save();
    return res.status(200).json({ data: player, message: "Player invited" });
  } else {
    return res.status(404).json({ message: "Player not invited" });
  }
};

export const getPlayerData = async (req, res) => {
  const { id } = req.body;
  const user = await User.findById(id);
  const host = await Host.findById(id);
  if (!user && !host) {
    return res.status(404).json({ message: "User not found" });
  } else if (user) {
    return res.status(200).json({ data: user, message: "User found" });
  } else if (host) {
    return res.status(200).json({ data: host, message: "Host found" });
  }
};
