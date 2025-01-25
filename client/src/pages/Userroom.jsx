import React, { useState, useEffect } from "react";
import socket from "../utils/websocket";
import { useNavigate } from "react-router-dom";

const Userroom = () => {
  const navigate = useNavigate();

  //for getting socket events
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const handleUpdatePlayers = (players) => {
      setPlayers(players);
    };

    const handleNumbersAssigned = (numbers) => {
      navigate(`/game`, { state: { numbers } });
    };

    socket.on("player_update", handleUpdatePlayers);
    socket.on("started_game", handleNumbersAssigned);

    return () => {
      socket.off("player_update", handleUpdatePlayers);
      socket.off("started_game", handleNumbersAssigned);
    };
  }, [navigate]);

  return (
    <>
      <div className="mt-4 pt-20">
        <h2 className="text-xl mb-2">Players</h2>
        <div className="border p-4 rounded flex flex-wrap">
          {players.length > 0 ? (
            players.map((player, index) => (
              <div key={index} className="m-2 border-2 p-2 rounded">
                {player}
              </div>
            ))
          ) : (
            <div>No players joined yet.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Userroom;
