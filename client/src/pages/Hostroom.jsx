import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../utils/websocket";
import {
  updateLocalStorage,
  updateSessionStorage,
} from "../utils/storageUtils";
import Loading from "../components/Loading";
import { PlayerContext } from "../context/PlayerContext";
import { GameContext } from "../context/GameContext";

//import env
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Hostroom = () => {
  //for extracting roomid from params if present
  const param = useParams();
  const roomid = param.roomid;

  const { Player, updatePlayer } = useContext(PlayerContext);
  const { gameState, updateGameState } = useContext(GameContext);

  //for navigation
  const navigate = useNavigate();

  //for inviting players states
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [playerPhone, setPlayerPhone] = useState("");

  // loading state
  const [loading, setLoading] = useState(false);

  //message state
  const [messageStore, setMessageStore] = useState("");
  const [messageToggle, setMessageToggle] = useState(false);

  const messageHandler = (message) => {
    setMessageToggle(false);
    setMessageStore(message);
    setMessageToggle(true);
  };

  // setting timer value for game
  const [timerValue, setTimerValue] = useState(3); // State for UI updates
  const timerValueRef = useRef(3); // Ref for instant access

  const handleTimerChange = (e) => {
    const newValue = parseInt(e.target.value);
    setTimerValue(newValue); // Update state for UI
    timerValueRef.current = newValue; // Update ref for instant access
  };

  //socket event handlers, functions and states
  const [playerlist, setPlayerList] = useState([]);

  useEffect(() => {
    const handleUpdatePlayers = (players) => {
      setPlayerList(players);
    };
    const handleNumbersAssigned = (data) => {
      const setting = data?.setting || {};
      const player = data?.player || {};
      updateGameState({
        name: player?.name || "Guest",
        roomid: roomid,
        ticketCount: player?.ticketCount || 0,
        assign_numbers: player?.assign_numbers || [],
        patterns: setting?.patterns || [],
        schedule: setting?.schedule || null,
        claimTrack: setting?.claimTrack || [],
        timer: timerValueRef.current || 3,
      });

      setTimeout(() => {
        setLoading(false);
        navigate(`/game`);
      }, 1000);
    };

    socket.on("player_update", handleUpdatePlayers);
    socket.on("started_game", handleNumbersAssigned);
    socket.on("requestedTicket", (data) => {
      setRequestTicketsList(data);
    });

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

  // handle requestTicket approvals
  const [requestMenu, setRequestMenu] = useState(false);
  const [requestTicketsList, setRequestTicketsList] = useState([]);
  const [count, setCount] = useState(0);
  const [warningPopup, setWarningPopup] = useState(false);

  //invite button click popup toggle logic
  const handleInviteClick = () => {
    setIsPopupOpen(true);
  };
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleInvitePlayer = async () => {
    if (Player?.role !== "host") {
      messageHandler("You are not authorized to invite players");
      return;
    }
    if (playerPhone.length !== 10 || isNaN(playerPhone)) {
      messageHandler("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      const inviteRes = await fetch(`${apiBaseUrl}/api/game/invite`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: playerPhone,
          room: {
            roomid: roomid,
            schedule: gameState.schedule,
          },
          id: Player?.id,
        }),
      });
      const inviteData = await inviteRes.json();
      setLoading(false);
      if (inviteRes.status === 200) {
        messageHandler("Player invited successfully");
        setIsPopupOpen(false);
        setPlayerPhone("");
      } else {
        messageHandler(inviteData.message);
      }
    } catch (error) {
      setLoading(false);
      messageHandler("Error inviting player. Please try again.");
    }
  };

  //start game button click logic
  const handleStartClick = async () => {
    if (Player?.role !== "host") {
      messageHandler("You are not authorized to start the game");
      return;
    }
    socket.emit("start_game", roomid, Player.id);
    sessionStorage.setItem("roomid", roomid);
    setLoading(true);
  };

  // connection and disconnection handling
  // const [isConnected, setIsConnected] = useState(false);

  const [isConnected, setIsConnected] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (!Player || !Player.id || Player.role !== "host") {
      messageHandler("You are not authorized to start the game");
      navigate("/");
      return;
    }
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

  // refreshing the page
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
        <div className="p-4 pt-20 bg-gradient-to-r from-rose-300 via-blue-200 to-purple-300 min-h-screen">
          {Player?.role === "host" && (
            <>
              <div className="flex justify-start mb-4 capitalize font-medium">
                <button
                  className="bg-blue-600 text-white px-2 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all active:scale-95 "
                  onClick={Player?.role === "host" ? handleInviteClick : null}
                >
                  Invite Player
                </button>
                <button
                  className="bg-yellow-600 text-white relative py-3 px-2 rounded-lg shadow-md hover:bg-yellow-700 transition-all active:scale-95 ml-4"
                  onClick={() => setRequestMenu(true)}
                >
                  Request Menu{" "}
                  <sup
                    className={`
                    ${requestTicketsList.length > 0 ? "block" : "hidden"}
                absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold
                `}
                  >
                    {requestTicketsList.length}
                  </sup>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://tambolatesting.vercel.app/user/${roomid}`
                    );
                    messageHandler("Link copied to clipboard");
                  }}
                  className="bg-green-600 text-white px-2 py-3 rounded-lg shadow-md hover:bg-green-700 transition-all active:scale-95 ml-4"
                >
                  copy link
                </button>
              </div>
            </>
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
            {playerlist?.map((player, index) => (
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
              onClick={Player.role === "host" ? handleStartClick : null}
              className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition-all active:scale-95"
            >
              Start Game
            </button>
          </div>

          {messageToggle && (
            <p className="text-red-500 text-center mt-4">{messageStore}</p>
          )}

          {requestMenu && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
              <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in">
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
                  onClick={() => setRequestMenu(false)}
                >
                  &times;
                </button>

                <h2 className="text-2xl font-bold text-center mb-6">
                  Request Tickets
                </h2>

                <div className="space-y-1 max-h-72 overflow-y-scroll">
                  {requestTicketsList.map((data, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 bg-gray-100 p-2 rounded-lg"
                    >
                      <span className="text-base font-medium truncate w-1/3">
                        {data.name}
                      </span>

                      <input
                        type="number"
                        min="1"
                        max="6"
                        className="w-16 text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={data.count}
                        onChange={(e) => {
                          const newCount = parseInt(e.target.value) || 0;
                          if (newCount > 6) {
                            alert("Please enter a number between 1 and 6");
                            return;
                          }
                          setRequestTicketsList((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, count: newCount } : item
                            )
                          );
                        }}
                      />

                      <button
                        onClick={() => {
                          setSelectedRequest(data);
                          setWarningPopup(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded-md transition-all active:scale-95"
                      >
                        Approve
                      </button>
                      {warningPopup && selectedRequest && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm transition-all">
                          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 animate-fadeIn">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                              {selectedRequest.phone} - {selectedRequest.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                              Requesting{" "}
                              <span className="font-semibold text-black">
                                {selectedRequest.count}
                              </span>{" "}
                              ticket{selectedRequest.count > 1 ? "s" : ""}.
                              <br />
                              Are you sure you want to approve this request?
                            </p>
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => {
                                  setWarningPopup(false);
                                  setSelectedRequest(null);
                                }}
                                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all active:scale-95"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    selectedRequest.count > 6 ||
                                    selectedRequest.count < 1
                                  ) {
                                    alert(
                                      "Please enter a number between 1 and 6"
                                    );
                                    setWarningPopup(false);
                                    setSelectedRequest(null);
                                    return;
                                  }
                                  socket.emit(
                                    "requestTicket",
                                    selectedRequest.id,
                                    roomid,
                                    selectedRequest.count
                                  );

                                  setWarningPopup(false);
                                  setSelectedRequest(null);
                                }}
                                className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all active:scale-95"
                              >
                                Approve
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* connection lose warning */}
          {isConnected && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
              <div className="bg-white text-red-600 border border-red-200 shadow-xl rounded-2xl p-6 w-full max-w-md text-center animate-fade-in-down">
                <h2 className="text-xl font-bold mb-2">⚠️ Connection Lost</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Your connection was lost. Please reconnect to continue the
                  game.
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
        </div>
      )}
    </>
  );
};

export default Hostroom;
