// import Host from "../models/host.model.js";
import User from "../models/user.model.js";

// /api/user/register
export const createUser = async (req, res) => {
  try {
    let { name, phone, password } = req.body;
    phone = phone.toString().trim();
    password = password.toString().trim();
    name = name.toString().trim();

    //validation
    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    } else if (phone.length !== 10) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits" });
    } else if (password.length < 6 || password.length > 20) {
      return res
        .status(400)
        .json({ message: "Password must be between 6 to 20 characters" });
    } else if (name.length < 3 || name.length > 20) {
      return res
        .status(400)
        .json({ message: "Name must be between 3 to 20 characters" });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "Phone is already register" });
    }

    const user = await User.create({ name, phone, password });
    const id = user._id;
    res
      .cookie("id", id, {
        httpOnly: true,
        secure: true, // make sure it's only sent over HTTPS
        sameSite: "None", // needed for cross-origin cookies
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
      .status(200)
      .json({ user, id, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// /api/user/login
export const loginUser = async (req, res) => {
  try {
    let { phone, password } = req.body;
    phone = phone.toString().trim();
    password = password.toString().trim();

    //validation
    if (!phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    } else if (phone.length !== 10) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits" });
    } else if (password.length < 6 || password.length > 20) {
      return res
        .status(400)
        .json({ message: "Password must be between 6 to 20 characters" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not registered" });
    }
    const passwordMatch = user.password === password;
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const id = user._id;
    res
      .cookie("id", id, {
        httpOnly: true,
        secure: true, // make sure it's only sent over HTTPS
        sameSite: "None", // needed for cross-origin cookies
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
      .status(200)
      .json({ user, id, message: "User logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// /api/host/register
export const createHost = async (req, res) => {
  try {
    let { name, phone, password } = req.body;

    // Trim and convert to strings
    name = name?.toString().trim();
    phone = phone?.toString().trim();
    password = password?.toString().trim();

    // Validation
    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits" });
    }
    if (password.length < 6 || password.length > 20) {
      return res
        .status(400)
        .json({ message: "Password must be between 6 to 20 characters" });
    }
    if (name.length < 3 || name.length > 20) {
      return res
        .status(400)
        .json({ message: "Name must be between 3 to 20 characters" });
    }

    // Check if host already exists
    const existingHost = await User.findOne({ phone });
    if (existingHost) {
      return res.status(400).json({ message: "Phone is already registered" });
    }

    // Create user
    const user = await User.create({ name, phone, password, role: "host" });
    const id = user._id;

    // Set cookie and send response
    res
      .cookie("id", id, {
        httpOnly: true,
        secure: true, // make sure it's only sent over HTTPS
        sameSite: "None", // needed for cross-origin cookies
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
      .status(200)
      .json({ user, message: "Host created successfully" });
  } catch (error) {
    console.error("Error in createHost:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// /api/host/login
export const loginHost = async (req, res) => {
  try {
    let { phone, password } = req.body;
    phone = phone.toString().trim();
    password = password.toString().trim();

    //validation
    if (!phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    } else if (phone.length !== 10) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits" });
    } else if (password.length < 6 || password.length > 20) {
      return res
        .status(400)
        .json({ message: "Password must be between 6 to 20 characters" });
    }

    const user = await User.findOne({ phone }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Host not found" });
    }
    const passwordMatch = user.password === password;
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const id = user._id;
    res
      .cookie("id", id, {
        httpOnly: true,
        secure: true, // make sure it's only sent over HTTPS
        sameSite: "None", // needed for cross-origin cookies
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
      .status(200)
      .json({ user, id, message: "Host logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// /api/user/find
export const findUser = async (req, res) => {
  try {
    let { userid } = req.body;
    userid = userid.toString().trim();

    const user = await User.findById(userid);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ user, message: "User found successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// /api/user/get

export const getUser = async (req, res) => {
  try {
    const id = req.cookies.id;
    if (!id) {
      return res.status(400).json({ message: "Id is not found" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ data, message: "User found successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// /api/user/invite

export const inviteUser = async (req, res) => {
  try {
    let { phone, invite } = req.body;
    const { id } = req.cookies;
    phone = phone.toString().trim();
    if (!phone || !invite) {
      return res.status(400).json({ message: "All fields are required" });
    } else if (phone.length !== 10) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits" });
    }

    // dont take password from user
    const isHost = User.findById(id).select("-password");
    if (!isHost) {
      return res.status(400).json({ message: "User not found" });
    } else if (isHost.role !== "host") {
      return res.status(400).json({ message: "You are not a host" });
    }

    const user = User.findById({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // invite is [{}, {}]
    const isInvited = user.invites.find((invite) => invite.roomid === roomid);
    if (isInvited) {
      return res.status(400).json({ message: "User already invited" });
    }
    user.invites.push({
      roomid: invite?.roomid,
      schedule: invite?.schedule || "",
    });
    await user.save();
    res.status(200).json({ message: "User invited successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("id", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changeRole = async (req, res) => {
  // console.log("Change role called");
  try {
    const id = req.cookies.id;
    // console.log("ID from cookies:", id);

    if (!id) {
      return res.status(400).json({ message: "Id is not found" });
    }
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // console.log("User found:", user.role);
    if (user.role === "host") {
      user.role = "user";
    } else if (user.role === "user") {
      user.role = "host";
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }
    await user.save();
    res.status(200).json({ user, message: "User role changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
