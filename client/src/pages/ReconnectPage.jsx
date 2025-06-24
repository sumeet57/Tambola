import React, { useEffect, useState, useContext } from "react";
import { useLocation, Outlet, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import socket from "../utils/websocket";
import Loading from "../components/Loading";
import { GameContext } from "../context/GameContext";
import { PlayerContext } from "../context/PlayerContext";

import { toast } from "react-toastify";

const ReconnectPage = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const { gameSettings, updateGameSettings, gameState, updateGameState } =
    useContext(GameContext);
  const { Player, updatePlayer, deletePlayerProperty } =
    useContext(PlayerContext);

  //for navigation
  const navigate = useNavigate();

  // for getting the current path
  const location = useLocation();

  // for storing the room id and ticket count
  const temproomid = useParams();

  const [roomId, setRoomId] = useState(temproomid.roomid || "");
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const [messageStore, setMessageStore] = useState("");
  const [messageToggle, setMessageToggle] = useState(false);

  const messageHandler = (message) => {
    setMessageToggle(false);
    setMessageStore(message);
    setMessageToggle(true);
  };

  const handleRoomJoined = (room) => {
    navigate(`/host/room/${room}`);
    setLoading(false);
  };
  const handleReconnectToRoom = (room) => {
    navigate(`/host/room/${room.roomid}`);
    updateGameState({
      publicId: room.publicId || "",
    });
    setLoading(false);
  };
  const handleReconnectToGame = (data) => {
    setLoading(false);

    updateGameState({
      roomid: data.roomid,
      patterns: data.patterns || [],
      schedule: data.schedule || null,
      assign_numbers: data.assign_numbers || [],
      ticketCount: data.ticketCount || 0,
      claimTrack: data.claimTrack || [],
      DrawNumbers: data.DrawNumbers || [],
      name: Player?.name || "Guest",
    });
    navigate("/game");
  };

  useEffect(() => {
    socket.on("room_joined", handleRoomJoined);
    socket.on("reconnectToRoom", handleReconnectToRoom);
    socket.on("reconnectToGame", handleReconnectToGame);

    socket.on("error", (message) => {
      setLoading(false);
      messageHandler(message);
    });

    // Cleanup
    return () => {
      socket.off("room_joined", handleRoomJoined);
      socket.off("reconnectToRoom", handleReconnectToRoom);
      socket.off("reconnectToGame", handleReconnectToGame);
      socket.off("error");
    };
  }, [ticketCount, navigate]);

  useEffect(() => {
    updatePlayer({
      ticketCount: ticketCount,
    });
  }, [ticketCount]);

  const handleJoinRoom = async () => {
    setLoading(true);
    // for checking if player is invited or not
    const invitedRes = await fetch(`${apiBaseUrl}/api/game/invited`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: Player?.phone,
        roomid: roomId,
      }),
    });
    const invitedData = await invitedRes.json();
    setLoading(false);
    if (invitedRes.status === 200) {
      // console.log("the player is invited");
      socket.emit("reconnect_player", Player, roomId);
      setLoading(true);
    } else {
      const message = invitedData?.message;
      messageHandler(message);
    }
  };
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Header />
          {location.pathname === "reconnect" ||
          location.pathname === `/reconnect/${roomId}` ? (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-rose-300 via-blue-200 to-purple-300">
              <div className="bg-white p-5 rounded-xl shadow-2xl w-full max-w-lg">
                <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800">
                  Reconnect to Room
                </h1>
                <div className="mb-6">
                  <label
                    className="block text-gray-600 text-md font-medium mb-2"
                    htmlFor="roomId"
                  >
                    Room ID
                  </label>
                  <input
                    type="text"
                    id="roomId"
                    value={roomId || gameSettings?.roomId}
                    onChange={(e) => {
                      updateGameSettings({ roomId: e.target.value });
                      updateGameState({ roomId: e.target.value });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>

                {messageToggle && (
                  <p className="text-red-500 text-center font-medium mt-4">
                    {messageStore}
                  </p>
                )}
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleJoinRoom}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Reconnect
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </>
      )}
    </>
  );
};

export default ReconnectPage;
