import React, { useEffect, useState } from "react";
import socket from "../utils/websocket";
import { useLocation, useParams, Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  updateLocalStorage,
  updateSessionStorage,
} from "../utils/storageUtils";

const Userpage = () => {
  //for extracting roomid from params if present
  const { roomid } = useParams();

  //for navigating
  const navigate = useNavigate();

  //geeting path from url for conditional rendering(Oulet is used for nested routing)
  const location = useLocation();

  //for getting socketid from localstorage
  const socketid = localStorage.getItem("socketid");

  //for getting player from sessionstorage and id from localstorage
  const player = JSON.parse(sessionStorage.getItem("player"));
  const playerid =
    localStorage.getItem("userid") || localStorage.getItem("hostid");

  //for joining room states
  const [roomId, setRoomId] = useState(roomid || ""); //if params is present then set it to roomid else empty string
  const [tickets, setTickets] = useState(1);

  //for handling join room
  const handleJoin = async () => {
    //for checking if player has enough points
    const pointsRes = await fetch("http://localhost:3000/api/game/available", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: playerid,
        ticket: tickets,
      }),
    });
    // for checking if player is invited or not
    const invitedRes = await fetch("http://localhost:3000/api/game/invited", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: player?.name,
        roomid: roomId,
      }),
    });
    const invitedData = await invitedRes.json();
    const pointsData = await pointsRes.json();

    if (invitedRes.status === 404) {
      document.querySelector(".message").innerHTML = invitedData.message;
      return;
    }
    if (pointsRes.status === 404) {
      document.querySelector(".message").innerHTML = pointsData.message;
      return;
    }
    if (pointsRes.status === 200 && invitedRes.status === 200) {
      //connecting to room with roomid, player data, socketid and tickets
      socket.emit("join_room", roomId, player, socketid, tickets);
      updateLocalStorage("roomid", roomId);
    } else {
      document.querySelector(".message").innerHTML =
        invitedData.message || pointsData.message;
    }
  };

  //for listening to socket events
  useEffect(() => {
    const handleRoomJoined = (room) => {
      console.log("Room joined successfully");

      const deductPoints = async () => {
        try {
          const res = await fetch("http://localhost:3000/api/game/points", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: playerid, // Use the latest player ID
              points: tickets, // Use the latest ticket count
            }),
          });

          const data = await res.json();
          if (res.status === 200) {
            updateSessionStorage("player", data.data); // Update player session data
            navigate(`/user/room/${room}`); // Navigate to the room
          } else {
            document.querySelector(".message").innerHTML = data.message;
          }
        } catch (error) {
          console.error("Failed to deduct points:", error);
          document.querySelector(".message").innerHTML =
            "Failed to deduct points.";
        }
      };

      deductPoints();
    };

    // Set up event listener for room_joined
    socket.on("room_joined", handleRoomJoined);

    // Handle errors
    socket.on("error", (message) => {
      document.querySelector(".message").innerHTML = message;
    });

    // Cleanup
    return () => {
      socket.off("room_joined", handleRoomJoined);
      socket.off("error");
    };
  }, [tickets, playerid, navigate]);

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
