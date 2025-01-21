import React, { useEffect, useState } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import socket from "../socket/websocket";
import { use } from "react";
const Hostpage = () => {
  //for navigation
  const navigate = useNavigate();

  // for getting the current path
  const location = useLocation();

  // for storing the room id and ticket count
  const [roomId, setRoomId] = useState("");
  const [ticketCount, setTicketCount] = useState(1);

  // for getting the socket id from local storage
  const socketid = localStorage.getItem("socketid");

  const handleCreateRoom = () => {
    // Handle room creation logic here
    const host = localStorage.getItem("hostid");
    const deductPoints = async () => {
      const res = await fetch("http://localhost:3000/api/game/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: host,
          points: ticketCount,
        }),
      });
      const data = await res.json();
      if (res.status === 200) {
        sessionStorage.removeItem("player");
        sessionStorage.setItem("player", JSON.stringify(data.data));
        const player = JSON.parse(sessionStorage.getItem("player"));
        socket.emit("create_room", roomId, player, socketid, ticketCount);
      } else {
        document.querySelector(".message").innerHTML = data.message;
      }
    };
    deductPoints();
  };

  //listening to socket events
  useEffect(() => {
    socket.on("room_created", (room) => {
      navigate(`/host/room/${room}`);
    });

    return () => {
      socket.off("room_created");
    };
  }, []);
  return (
    <>
      <Header />
      {location.pathname === "/host" ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Create Room</h1>
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
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="ticketCount"
              >
                Number of Tickets
              </label>
              <select
                id="ticketCount"
                value={ticketCount}
                onChange={(e) => setTicketCount(Number(e.target.value))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
            <p className="message text-red-500"></p>
            <button
              onClick={handleCreateRoom}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Room
            </button>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default Hostpage;
