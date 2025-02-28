import React, { useState, useEffect } from "react";
import socket from "../utils/websocket";
import { useNavigate } from "react-router-dom";

const Userroom = () => {
  const navigate = useNavigate();

  //for getting socket events
  const [players, setPlayers] = useState([]);

  const userid = localStorage.getItem("userid");
  useEffect(() => {
    if (!userid) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const handleUpdatePlayers = (players) => {
      setPlayers(players);
    };

    const handleNumbersAssigned = (numbers) => {
      // console.log("Numbers assigned", numbers);
      navigate(`/game`, { state: { numbers } });
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
      <div className="p-4 pt-20 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Players
        </h2>
        <div className="border p-6 rounded-lg shadow-lg bg-white flex flex-wrap justify-start">
          {players.length > 0 ? (
            players.map((player, index) => (
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
