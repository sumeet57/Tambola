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
        <div class="border border-gray-200 p-4 rounded-xl bg-white/55 shadow-lg flex flex-col items-center md:p-6 lg:p-8">
          <h2 class="text-2xl font-extrabold text-gray-800 mb-4 pb-1 border-b-4 border-blue-500 block self-start md:self-center">
            Players:
          </h2>
          <div class="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-5 w-full overflow-y-auto max-h-[40vh] ">
            {playersList?.map((player, index) => (
              <span
                key={index}
                className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-base md:text-lg font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center min-w-[100px] text-center"
              >
                {player}
              </span>
            ))}
          </div>
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
