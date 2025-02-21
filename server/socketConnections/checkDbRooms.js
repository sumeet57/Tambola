import Room from "../models/room.model.js";

let roomInDb = [];

const initializeRooms = async () => {
  try {
    const res = await Room.find();
    res.forEach((room) => {
      if (room.roomid) {
        roomInDb.push(room.roomid);
      }
    });
  } catch (error) {
    console.error("Error fetching rooms from database:", error);
  }
  //   console.log("Rooms in db:", roomInDb);
};

initializeRooms();

export default roomInDb;
