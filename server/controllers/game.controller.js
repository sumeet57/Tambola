import User from "../models/user.model.js";
// import Host from "../models/host.model.js";
import Room from "../models/room.model.js";

// /api/game/invited
export const isPlayerInvited = async (req, res) => {
  try {
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

    // Find the player by phone
    const player = await User.findOne({ phone });
    if (!player) {
      return res.status(400).json({ message: "Player not found" });
    }

    // Check if the player is invited
    const isInvited = player.invites.some((invite) => invite.id === roomid);

    if (!isInvited) {
      return res.status(400).json({ message: "Player not invited" });
    }

    return res.status(200).json({ message: "Player is Invited" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// /api/game/player
export const getPlayerData = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const user = await User.findById(id);
    const host = await Host.findById(id);
    if (!user && !host) {
      return res.status(400).json({ message: "User not found" });
    } else if (user) {
      return res.status(200).json({ data: user, message: "User found" });
    } else if (host) {
      return res.status(200).json({ data: host, message: "Host found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// /api/game/invites
export const getInvites = async (req, res) => {
  try {
    const id = req.cookies.id;
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }
    const data = await User.findById(id).select("invites");
    if (!data) {
      return res.status(400).json({ message: "No invites found" });
    }
    return res
      .status(200)
      .json({ invites: data.invites, message: "Invites found" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching `invites`",
      error: error.message,
    });
  }
};

// /api/game/player
export const getPlayer = async (req, res) => {
  try {
    const id = req.cookies.id;
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "Player not found" });
    } else if (user) {
      return res.status(200).json({ data: user, message: "Player found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error while fetching `player`", error });
  }
};

// /api/game/invite
export const inviteUser = async (req, res) => {
  try {
    let { phone, room, id } = req.body;
    phone = phone.toString().trim();
    if (!phone || !id) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!room.roomid) {
      return res.status(400).json({ message: "Room id is required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "Player not found" });
    }
    const playerInvited = user.invites.some(
      (invite) => invite.roomid === room.roomid
    );
    if (playerInvited) {
      return res.status(400).json({ message: "Player already invited" });
    }
    const host = await User.findById(id);
    if (!host) {
      return res.status(400).json({ message: "Host not found" });
    }

    user.invites = [];
    user.invites.push({
      id: room.roomid,
      schedule: room.schedule,
    });
    await user.save();

    res.status(200).json({ message: "User invited successfully", data: host });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// /api/game/invite/:id
export const deleteInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const id = req.cookies.id;

    if (!inviteId || !id) {
      return res
        .status(400)
        .json({ message: "Invite ID and User ID are required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out the invite with the given ID
    const originalLength = user.invites.length;
    user.invites = user.invites.filter((invite) => invite.id !== inviteId);

    if (user.invites.length === originalLength) {
      return res.status(404).json({ message: "Invite not found" });
    }

    await user.save();

    return res
      .status(200)
      .json({ invites: user.invites, message: "Invite removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// /api/game/rooms
export const getRooms = async (req, res) => {
  try {
    const id = req.cookies.id;
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }
    const user = await User.findById(id).select("role");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.role !== "host") {
      return res.status(400).json({ message: "User is not a host" });
    }
    const rooms = await Room.find();
    if (!rooms || rooms.length === 0) {
      return res.status(400).json({ message: "No rooms found" });
    }
    return res.status(200).json({ rooms: rooms, message: "Rooms found" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching `rooms`",
      error: error.message,
    });
  }
};
