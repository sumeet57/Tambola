import React, { useState, useEffect, useContext } from "react";
import socket from "../utils/websocket";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";

const Userroom = () => {
  const navigate = useNavigate();

  // for context
  const { gameState, updateGameState } = useContext(GameContext);

  const [playersList, setPLayersList] = useState([]);

  useEffect(() => {
    const handleUpdatePlayers = (players) => {
      setPLayersList(players);
    };

    const handleNumbersAssigned = (data) => {
      console.log("data", data);
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
    </>
  );
};

export default Userroom;
