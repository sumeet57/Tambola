import React, { useState, useEffect } from "react";
import socket from "../socket/websocket";
import { useNavigate } from "react-router-dom";

const Userroom = () => {
  const navigate = useNavigate();

  //for getting players joined list from socket
  const [players, setPlayers] = useState([]);
  useEffect(() => {
    const handleUpdatePlayers = (players) => {
      setPlayers(players);
    };
    socket.on("player_update", handleUpdatePlayers);

    return () => {
      socket.off("update-players", handleUpdatePlayers);
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
