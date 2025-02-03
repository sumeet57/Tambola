import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../utils/websocket";
import { updateSessionStorage } from "../utils/storageUtils";

const Hostroom = () => {
  //for extracting roomid from params if present
  const param = useParams();
  const id = param.roomid;

  //for navigation
  const navigate = useNavigate();

  //for inviting players states
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerPoints, setPlayerPoints] = useState(1);

  //for getting players from socket
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

    socket.on("error", (message) => {
      console.log(message);
    });

    return () => {
      socket.off("player_update", handleUpdatePlayers);
      socket.off("started_game", handleNumbersAssigned);
      socket.off("error");
    };
  }, [navigate]);

  //invite button click popup toggle logic
  const handleInviteClick = () => {
    setIsPopupOpen(true);
  };
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  //invite player and deduct points of host logic
  const handleInvitePlayer = async () => {
    const hostid = localStorage.getItem("hostid");
    if (playerName) {
      if (players.includes(playerName)) {
        alert("Player already invited");
        return;
      }
      if (hostid) {
        const resPlayer = await fetch("http://localhost:3000/api/host/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: playerName,
            roomid: id,
            points: playerPoints,
          }),
        });

        //deducting points from host
        const resPoints = await fetch("http://localhost:3000/api/game/points", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            id: hostid,
            points: playerPoints,
          }),
        });

        if (resPlayer.status === 404 || resPoints.status === 404) {
          console.log("Resource not found");
        } else {
          const dataPoints = await resPoints.json();
          const dataPlayer = await resPlayer.json();
          if (resPlayer.status === 200 && resPoints.status === 200) {
            sessionStorage.clear();
            updateSessionStorage("player", dataPoints.data);
            handleClosePopup();
          } else {
            console.log(dataPlayer.message || dataPoints.message);
          }
          setPlayerName("");
        }
      }
    }
  };

  //start game button click logic
  const handleStartClick = async () => {
    socket.emit("start_game", id);
  };

  return (
    <div className="p-4 pt-20">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleInviteClick}
      >
        Invite Player
      </button>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={handleClosePopup}
            >
              &times;
            </button>
            <h2 className="text-lg mb-2">Invite Player</h2>
            <input
              type="text"
              className="border p-2 w-full mb-2"
              placeholder="Enter player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            Points :{" "}
            <select
              className="border p-2 mb-4 w-full"
              onChange={(e) => setPlayerPoints(e.target.value)}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={handleInvitePlayer}
            >
              Invite
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-xl mb-2">Players</h2>
        <div className="border p-4 rounded">
          {players.map((player, index) => (
            <span key={index} className="m-2 border-2 p-2 rounded">
              {player}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={handleStartClick}
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        Start Game
      </button>
    </div>
  );
};

export default Hostroom;
