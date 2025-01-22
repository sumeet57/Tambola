import React, { useEffect, useState } from "react";
import socket from "../socket/websocket";
import { useLocation, useParams, Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { updateSessionStorage } from "../utils/storageUtils";

const Userpage = () => {
  //for extracting roomid from params if present
  const { roomid } = useParams();

  //for navigating
  const navigate = useNavigate();

  //geeting path from url
  const location = useLocation();

  //for getting socketid from localstorage
  const socketid = localStorage.getItem("socketid");

  //for
  const [player, setPlayer] = useState(null);
  useEffect(() => {
    setPlayer(JSON.parse(sessionStorage.getItem("player")));
  }, [navigate]);

  //for joining room states
  const [roomId, setRoomId] = useState(roomid || "");
  const [tickets, setTickets] = useState(1);

  //for joining room logic/ points deduction
  const handleJoin = async () => {
    // Handle join logic here
    const res = await fetch("http://localhost:3000/api/game/invited", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: player?.name,
        roomid: roomId,
        ticket: tickets,
      }),
    });
    const data = await res.json();
    if (res.status === 200) {
      sessionStorage.removeItem("player");
      updateSessionStorage("player", data.data);

      //connecting to room
      const newData = JSON.parse(sessionStorage.getItem("player"));
      socket.emit("join_room", roomId, newData, socketid, tickets);
    } else {
      document.querySelector(".message").innerHTML = data.message;
    }
  };

  //for listening to socket events
  useEffect(() => {
    socket.on("room_joined", (room) => {
      navigate(`/user/room/${room}`);
    });
    socket.on("error", (message) => {
      document.querySelector(".message").innerHTML = message;
    });

    return () => {
      socket.off("room_joined");
    };
  }, [navigate]);

  return (
    <>
      <Header />
      {location.pathname === "/user" ||
      location.pathname === `/user/${roomid}` ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-4">Join a Room</h2>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="roomId"
              >
                Room ID
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="tickets"
              >
                Number of Tickets
              </label>
              <select
                id="tickets"
                value={tickets}
                onChange={(e) => setTickets(Number(e.target.value))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
            <p className="message text-red-500"></p>
            <button
              onClick={handleJoin}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Join
            </button>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default Userpage;
