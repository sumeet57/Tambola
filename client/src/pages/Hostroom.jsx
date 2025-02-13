import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../utils/websocket";
import {
  updateLocalStorage,
  updateSessionStorage,
} from "../utils/storageUtils";
import Loading from "../components/Loading";

//import env
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Hostroom = () => {
  //for extracting roomid from params if present
  const param = useParams();
  const id = param.roomid;

  //for navigation
  const navigate = useNavigate();

  //for inviting players states
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [playerPhone, setPlayerPhone] = useState("");
  // const [playerName, setPlayerName] = useState("");
  const [playerPoints, setPlayerPoints] = useState(1);
  const [loading, setLoading] = useState(false);

  const [messageStore, setMessageStore] = useState("");
  const [messageToggle, setMessageToggle] = useState(false);

  const messageHandler = (message) => {
    setMessageToggle(false);
    setMessageStore(message);
    setMessageToggle(true);
  };

  //for getting players from socket
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const handleUpdatePlayers = (players) => {
      setPlayers(players);
    };

    const roomid = sessionStorage.getItem("roomid");
    const handleNumbersAssigned = (numbers) => {
      // console.log("Numbers assigned", numbers);
      setLoading(false);
      navigate(`/game`, { state: { numbers, roomid } });
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
    if (playerPhone) {
      if (hostid) {
        setLoading(true);
        const resPlayer = await fetch(`${apiBaseUrl}/api/host/invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            phone: playerPhone,
            roomid: id,
            points: playerPoints,
          }),
        });
        // console.log(resPlayer, "resPlayer received");

        //deducting points from host
        const resPoints = await fetch(`${apiBaseUrl}/api/game/points`, {
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
        const dataPoints = await resPoints.json();
        const dataPlayer = await resPlayer.json();
        setLoading(false);

        if (resPlayer.status === 400 || resPoints.status === 400) {
          let message = dataPlayer.message || dataPoints.message;
          messageHandler(message);
        } else {
          // const dataPoints = await resPoints.json();
          if (resPlayer.status === 200 && resPoints.status === 200) {
            updateSessionStorage("player", dataPoints.data);
            handleClosePopup();
          } else {
            let message = dataPlayer.message || dataPoints.message;
            messageHandler(message);
          }
          setPlayerPhone("");
        }
      } else {
        messageHandler("Host not found");
      }
    }
  };

  //start game button click logic
  const handleStartClick = async () => {
    socket.emit("start_game", id);
    setLoading(true);
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="p-4 pt-20">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded transition-all active:scale-90"
              onClick={handleInviteClick}
            >
              Invite Player
            </button>

            {isPopupOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="bg-white p-4 rounded shadow-lg relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 text-3xl"
                    onClick={handleClosePopup}
                  >
                    &times;
                  </button>
                  <h2 className="text-lg mb-2">Invite Player</h2>
                  <input
                    type="text"
                    className="border p-2 w-full mb-2"
                    placeholder="Enter player phone no"
                    value={playerPhone}
                    onChange={(e) => setPlayerPhone(e.target.value)}
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
                  {messageToggle && (
                    <p className="text-red-500 text-center">{messageStore}</p>
                  )}
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded transition-all active:scale-90"
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
                {players?.map((player, index) => (
                  <span key={index} className="m-2 border-2 p-2 rounded">
                    {player}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartClick}
              className="bg-red-500 text-white px-4 py-2 rounded mt-4 transition-all active:scale-90"
            >
              Start Game
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Hostroom;
