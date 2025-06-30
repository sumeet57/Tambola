import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../utils/websocket";
import Loading from "../components/Loading";
import { PlayerContext } from "../context/PlayerContext";
import { GameContext } from "../context/GameContext";

//import env
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// toastify
import { toast } from "react-toastify";

const Hostroom = () => {
  //for extracting roomid from params if present
  const { Player, updatePlayer } = useContext(PlayerContext);
  const { gameState, updateGameState } = useContext(GameContext);

  const param = useParams();
  const roomid = param.roomid;
  const publicId = gameState.publicId || "";

  //for navigation
  const navigate = useNavigate();

  //for inviting players states
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [playerPhone, setPlayerPhone] = useState("");

  // loading state
  const [loading, setLoading] = useState(false);

  // setting timer value for game
  const [timerValue, setTimerValue] = useState(3); 
  const timerValueRef = useRef(3); 

  const handleTimerChange = (e) => {
    const newValue = parseInt(e.target.value);
    setTimerValue(newValue); 
    timerValueRef.current = newValue; 
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
      toast.error(message);
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
    if (isPopupOpen) {
      setIsPopupOpen(false);
    } else {
      setIsPopupOpen(true);
    }
  };

  //start game button click logic
  const handleStartClick = async () => {
    if (Player?.role !== "host") {
      toast.error("You are not authorized to start the game");
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
      toast.error("You are not authorized to access this page");
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
              <div className="flex justify-center md:justify-start mb-6 space-x-2 sm:space-x-4">
                {/* Request Menu Button */}
                <button
                  className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold
               py-2 px-4 text-base rounded-lg shadow-md
               sm:py-3 sm:px-6 sm:text-lg
               hover:from-yellow-600 hover:to-orange-600 transition-all duration-300
               transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-yellow-300
               capitalize"
                  onClick={() => setRequestMenu(true)}
                >
                  Request Menu
                  <sup
                    className={`
        ${requestTicketsList.length > 0 ? "block" : "hidden"}
        absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold ring-2 ring-white
        sm:-top-2 sm:-right-2 sm:h-6 sm:w-6
      `}
                  >
                    {requestTicketsList.length}
                  </sup>
                </button>

                {/* Invite Button */}
                <button
                  onClick={handleInviteClick}
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold
               py-2 px-4 text-base rounded-lg shadow-md
               sm:py-3 sm:px-6 sm:text-lg
               hover:from-green-600 hover:to-teal-600 transition-all duration-300
               transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-green-300"
                >
                  Invite
                </button>
              </div>
            </>
          )}

          {isPopupOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50 p-4">
              <div className="bg-white p-8 rounded-xl shadow-2xl relative w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-4xl leading-none"
                  onClick={handleInviteClick}
                  aria-label="Close popup"
                >
                  &times;
                </button>
                <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
                  Invite Your Friends!
                </h2>

                <p className="text-gray-700 text-lg mb-6 text-center">
                  Ready to play? Share this link with your friends to invite
                  them to the game!
                </p>

                <div className="flex flex-col space-y-4">
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg">
                    <a
                      className="wp-share flex items-center space-x-2 text-lg"
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `🎉 Hey! Let's play Tambola together! 🎲🔥\n\nClick this link to join the game now:\n👉 https://tambolatesting.vercel.app/user/${publicId}\n\nIt’s fun, easy, and free! 🥳`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.04 2C7.03 2 3 6.03 3 11.04c0 1.74.5 3.38 1.45 4.82L3.08 21.08l5.25-1.38c1.38.7 2.97 1.07 4.16 1.07 5.01 0 9.04-4.02 9.04-9.04S17.05 2 12.04 2zm4.07 13.63c-.15.08-.88.44-1.27.46-.38.01-.66.02-.95-.01-.28-.05-.66-.18-.92-.47-.26-.29-1.28-1.25-1.56-1.63-.29-.38-.24-.31-.05-.6.18-.28.4-.55.59-.74.19-.19.24-.33.35-.55.12-.22.06-.41-.02-.57-.08-.16-.76-1.83-1.04-2.5-.27-.67-.54-.58-.74-.58-.19 0-.41-.02-.6-.02-.19 0-.5.07-.76.33-.26.26-1 1-1 2.41 0 1.41 1.02 2.76 1.17 2.96.15.2.29.45.62.91.32.47.65.6.97.7.32.1.6.08.88.06.28-.02.88.35 1.05.47.17.11.4.19.62.24.22.05.42.02.58-.09.16-.11.48-.61.64-.82.17-.21.28-.35.4-.43.12-.08.73-.34 1.34-.63.6-.29.98-.49 1.16-.58.19-.09.35-.14.54-.18.19-.04.48-.02.7-.01.22 0 .58.11.8.28.22.17.27.32.32.43.05.11.66 1.54.66 1.68 0 .14-.02.26-.06.39-.04.13-.24.3-.47.45z" />
                      </svg>
                      <span>Share on WhatsApp</span>
                    </a>
                  </button>

                  <p className="text-gray-600 text-md text-center  w-full px-6">
                    Copy link & share with friends! 🔗 They just click to join!
                    🎉
                  </p>

                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={`https://tambola-dozn.onrender.com/user/${publicId}`}
                      className="w-full p-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `https://tambola-dozn.onrender.com/user/${publicId}`
                        );
                        toast.success("Link copied to clipboard!");
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-md transition-colors duration-200 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
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
                                  // console.log(requestTicketsList.length);
                                  if (requestTicketsList.length === 1) {
                                    setRequestMenu(false);
                                  }
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
