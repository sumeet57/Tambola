import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

// import centralized socket connection
import socket from "../utils/websocket";

//import context
import { GameContext } from "../context/GameContext";

const Userroom = () => {
  //for navigation
  const navigate = useNavigate();

  //context state
  const { gameState, updateGameState } = useContext(GameContext);

  //joined players list state
  const [playersList, setPLayersList] = useState([]);

  //socket event listeners for player updates and game start
  useEffect(() => {
    const handleUpdatePlayers = (players) => {
      setPLayersList(players);
    };

    const handleNumbersAssigned = (data) => {
      const setting = data?.setting || {};
      const player = data?.player || {};
      updateGameState({
        name: player?.name || "Guest",
        roomid: setting?.roomid,
        ticketCount: player?.ticketCount || 1,
        assign_numbers: player?.assign_numbers || [],
        patterns: setting?.patterns || [],
        schedule: setting?.schedule || null,
        claimTrack: setting?.claimTrack || [],
      });

      navigate(`/game`);
    };

    socket.on("player_update", handleUpdatePlayers);
    socket.on("started_game", handleNumbersAssigned);

    return () => {
      socket.off("player_update", handleUpdatePlayers);
      socket.off("started_game", handleNumbersAssigned);
    };
  }, [navigate]);

  //socket event listeners for disconnection check
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Emit socket connection when the component mounts
    socket.connect();

    // Check if already connected on initial mount
    if (socket.connected) {
      setIsConnected(false);
    }

    // Handle connection establishment
    const handleConnect = () => {
      setIsConnected(true); // Update connection state
    };

    // Listen to socket events
    socket.on("connect", handleConnect);

    return () => {
      // Clean up socket event listeners on component unmount
      socket.off("connect", handleConnect);
    };
  }, []);

  //warning before leaving the page
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <div className="p-4 pt-20 bg-gradient-to-r from-rose-300 via-blue-200 to-purple-300 min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Players
        </h2>
        <div className="border p-6 rounded-lg shadow-lg bg-white flex flex-wrap justify-start">
          {playersList.length > 0 ? (
            playersList.map((player, index) => (
              <div
                key={index}
                className="m-2 border-2 p-2 rounded-lg bg-gray-200"
              >
                {player}
              </div>
            ))
          ) : (
            <div className="text-gray-500">No players joined yet.</div>
          )}
        </div>
      </div>
      {isConnected && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white text-red-600 border border-red-200 shadow-xl rounded-2xl p-6 w-full max-w-md text-center animate-fade-in-down">
            <h2 className="text-xl font-bold mb-2">⚠️ Connection Lost</h2>
            <p className="text-sm text-gray-600 mb-6">
              Your connection was lost. Please reconnect to continue the game.
            </p>

            <button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-xl shadow-md hover:from-blue-500 hover:to-blue-400 transition-all duration-200"
            >
              🔄 Reconnect to Game
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Userroom;
