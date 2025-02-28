import React, { useEffect, useState, useRef } from "react";
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
  const roomid = param.roomid;

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

  const [timerValue, setTimerValue] = useState(3); // State for UI updates
  const timerValueRef = useRef(3); // Ref for instant access

  const handleTimerChange = (e) => {
    const newValue = parseInt(e.target.value);
    setTimerValue(newValue); // Update state for UI
    timerValueRef.current = newValue; // Update ref for instant access
  };

  //for getting hostid from localstorage

  const hostid = localStorage.getItem("hostid");

  useEffect(() => {
    if (!hostid) {
      navigate("/login");
    }
  }, []);

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
    const handleNumbersAssigned = (numbers) => {
      // console.log("Numbers assigned", numbers);
      setLoading(false);
      // console.log("sending time value", timerValue);
      navigate(`/game`, {
        state: { numbers, roomid: roomid, timerValue: timerValueRef.current },
      });
    };

    socket.on("player_update", handleUpdatePlayers);
    socket.on("started_game", handleNumbersAssigned);

    socket.on("error", (message) => {
      console.log(message);
      messageHandler(message);
      setLoading(false);
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
  const handleInvitePlayer = async (e) => {
    if (playerPhone) {
      if (playerPhone.length !== 10) {
        messageHandler("Enter valid phone number");
        return;
      }
      if (hostid) {
        setLoading(true);
        // console.log("Inviting player", playerPhone, playerPoints);

        const resPlayer = await fetch(`${apiBaseUrl}/api/host/invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            phone: playerPhone,
            roomid: roomid,
            points: playerPoints,
            id: hostid,
          }),
        });

        const dataPlayer = await resPlayer.json();
        setLoading(false);
        if (resPlayer.status === 200) {
          updateSessionStorage("player", dataPlayer.data);
          messageHandler(dataPlayer.message);
          setIsPopupOpen(false);
          setPlayerPhone("");
          setPlayerPoints(1);
        } else {
          messageHandler(dataPlayer.message);
        }
      } else {
        messageHandler("Host not found");
      }
    }
  };

  //start game button click logic
  const handleStartClick = async () => {
    if (hostid) {
      // console.log(hostid);
      socket.emit("start_game", roomid, hostid);
      setLoading(true);
    }
  };

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
      {loading ? (
        <Loading />
      ) : (
        <div className="p-4 pt-20 bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen">
          {hostid && (
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all active:scale-95"
              onClick={hostid ? handleInviteClick : null}
            >
              Invite Player
            </button>
          )}

          {isPopupOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <div className="bg-white p-6 rounded-lg shadow-lg relative w-96">
                <button
                  className="absolute top-2 right-2 text-gray-600 text-4xl hover:text-gray-800"
                  onClick={handleClosePopup}
                >
                  &times;
                </button>
                <h2 className="text-2xl font-semibold mb-4">Invite Player</h2>
                <input
                  type="tel"
                  className="border p-3 w-full mb-4 rounded-lg"
                  placeholder="Enter player PhoneNo"
                  required
                  pattern="[0-9]{10}"
                  value={playerPhone}
                  onChange={(e) => setPlayerPhone(e.target.value)}
                />
                <label className="block mb-2 text-gray-700">Points:</label>
                <select
                  className="border p-3 mb-4 w-full rounded-lg"
                  value={playerPoints}
                  onChange={(e) => {
                    let selectedPoints = parseInt(e.target.value);
                    setPlayerPoints(selectedPoints);
                  }}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
                {messageToggle && (
                  <p className="text-red-500 text-center mb-4">
                    {messageStore}
                  </p>
                )}
                <button
                  className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-all active:scale-95 w-full"
                  onClick={handleInvitePlayer}
                >
                  Invite
                </button>
              </div>
            </div>
          )}

          <h2 className="text-3xl font-bold my-6 text-gray-800">Players</h2>
          <div className="border p-4 rounded-lg bg-white shadow-md flex flex-wrap justify-center">
            {players?.map((player, index) => (
              <span
                key={index}
                className="m-2 border-2 p-2 rounded-lg bg-gray-200"
              >
                {player}
              </span>
            ))}
          </div>
          <div className="mt-6 flex items-center space-x-3 bg-white border border-gray-300 rounded-lg px-4 py-3 shadow-sm w-fit">
            <label
              htmlFor="drawn-interval"
              className="text-gray-600 font-medium text-lg"
            >
              🎯 Drawn Interval:
            </label>
            <select
              id="drawn-interval"
              className="bg-transparent focus:outline-none text-gray-900 w-[50px] text-lg font-bold cursor-pointer"
              value={timerValue} // This controls the selection
              onChange={handleTimerChange}
            >
              <option value="2">2s</option>
              <option value="3">3s</option>
              <option value="5">5s</option>
            </select>
          </div>

          <div className=" mt-8">
            <button
              onClick={hostid ? handleStartClick : null}
              className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition-all active:scale-95"
            >
              Start Game
            </button>
          </div>

          {messageToggle && (
            <p className="text-red-500 text-center mt-4">{messageStore}</p>
          )}
        </div>
      )}
    </>
  );
};

export default Hostroom;
