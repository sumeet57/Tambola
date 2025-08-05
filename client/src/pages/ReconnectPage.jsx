import React, { useEffect, useState, useContext } from "react";
import { useLocation, Outlet, useNavigate, useParams } from "react-router-dom";

// import components
import Header from "../components/Header";
import socket from "../utils/websocket";
import Loading from "../components/Loading";

// import context
import { GameContext } from "../context/GameContext";
import { PlayerContext } from "../context/PlayerContext";

// import toastify (for notifications)
import { toast } from "react-toastify";

const ReconnectPage = () => {
  // for importing environment variables
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // for context
  const { gameSettings, updateGameSettings, updateGameState } =
    useContext(GameContext);
  const { Player, updatePlayer } = useContext(PlayerContext);

  //for navigation
  const navigate = useNavigate();

  // for getting the current path
  const location = useLocation();

  // for storing the room id and ticket count
  const temproomid = useParams();

  // for storing room id and ticket count
  const [roomId, setRoomId] = useState(temproomid.roomid || "");
  const [ticketCount, setTicketCount] = useState(1);

  // for loading state
  const [loading, setLoading] = useState(false);

  // handle room joined event
  const handleRoomJoined = (room) => {
    navigate(`/host/room/${room}`);
    setLoading(false);
  };

  // handle reconnecting to room and game
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

  // handle socket events
  useEffect(() => {
    socket.on("room_joined", handleRoomJoined);
    socket.on("reconnectToRoom", handleReconnectToRoom);
    socket.on("reconnectToGame", handleReconnectToGame);

    socket.on("error", (message) => {
      setLoading(false);
      toast.error(message, {
        autoClose: 2000,
      });
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

  // handle join room button click
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
      setLoading(false);
      toast.error(message || "You are not joined the room", {
        autoClose: 2000,
      });
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
