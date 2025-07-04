import React, { useEffect, useState, useContext, useRef } from "react";
import { useLocation, Outlet, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import socket from "../utils/websocket";
import Loading from "../components/Loading";
import PatternMenu from "../components/PatternMenu";
import { GameContext } from "../context/GameContext";
import { PlayerContext } from "../context/PlayerContext";
import DrawNumbers from "../components/DrawNumbers";
//import env
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

import { toast } from "react-toastify";

const Hostpage = () => {
  //for context
  const { gameSettings, updateGameSettings, gameState, updateGameState } =
    useContext(GameContext);
  const { Player, updatePlayer, deletePlayerProperty } =
    useContext(PlayerContext);

  //for navigation
  const navigate = useNavigate();

  // for getting the current path
  const location = useLocation();

  const [roomId, setRoomId] = useState("");
  const [ticketCount, setTicketCount] = useState(0);
  const [gameSchedule, setGameSchedule] = useState("");
  const [loading, setLoading] = useState(false);
  const [hostPlay, setHostPlay] = useState(false);

  useEffect(() => {
    if (Player.role !== "host") {
      toast.error(
        "You are not authorized to access this page. Redirecting to home page.",
        {
          autoClose: 3000,
          onClose: () => {
            navigate("/");
          },
        }
      );
    }

    if (location.pathname === "/host") {
      setRoomId("");
      setTicketCount(0);
      setGameSchedule("");
    } else if (location.pathname === `/host/${roomId}`) {
      setRoomId(roomId);
    }
  }, []);

  const handleCreateRoom = () => {
    if (!gameSettings?.roomId || gameSettings?.roomId?.length < 3) {
      toast.warning("Please enter a valid Room ID (at least 3 characters).");
      return;
    }
    // there should be no space in roomId or special characters because it is used in URL
    // use all url friendly characters
    if (/[^a-zA-Z0-9_-]/.test(gameSettings?.roomId)) {
      toast.warning("No spaces or special characters in Room ID.");
      return;
    }
    if (gameSettings?.pattern?.length === 0) {
      toast.warning("Please select at least one pattern.");
      return;
    }
    setLoading(true);
    try {
      socket.emit("create_room", { ...Player }, { ...gameSettings });
    } catch (err) {
      toast.error("Failed to create room. Please try again.");
      setLoading(false);
    }
  };

  const handleRoomJoined = (room) => {
    setRoomId("");
    updateGameSettings({
      roomId: "",
      isScheduled: false,
      schedule: null,
      pattern: [],
    });
    setTicketCount(0);
    setGameSchedule("");
    setHostPlay(false);
    setLoading(false);
    navigate(`/host/room/${room.id}`);
    updateGameState({
      publicId: room.publicId,
    });
  };
  const handleReconnectToRoom = (room) => {
    navigate(`/host/room/${room}`);
    setLoading(false);
  };
  const handleReconnectToGame = (data) => {
    setLoading(false);
    updateGameState({
      roomid: data.roomid,
      patterns: data.patterns || [],
      schedule: data.schedule || null,
      assign_numbers: data.assign_numbers || [],
      claimTracks: data.claimTracks || [],
      DrawNumbers: data.DrawNumbers || [],
      name: Player.name,
    });
    navigate("/game");
  };

  useEffect(() => {
    socket.on("room_created", handleRoomJoined);
    socket.on("room_joined", handleRoomJoined);
    socket.on("reconnectToRoom", handleReconnectToRoom);
    socket.on("reconnectToGame", handleReconnectToGame);

    socket.on("error", (message) => {
      setLoading(false);
      toast.error(message);
    });

    // Cleanup
    return () => {
      socket.off("room_created", handleRoomJoined);
      socket.off("room_joined", handleRoomJoined);
      socket.off("reconnectToRoom", handleReconnectToRoom);
      socket.off("reconnectToGame", handleReconnectToGame);
      socket.off("error");
    };
  }, [ticketCount, navigate]);

  useEffect(() => {
    updatePlayer({
      ticketCount: ticketCount,
    });
  }, [ticketCount]);

  const generateRandomRoomId = () => {
    // Generate a random room ID (6 characters long)
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    updateGameSettings({ roomId: randomId });
  };

  // Handle click on datetime input to open the date/time picker
  const datetimeRef = useRef(null);
  useEffect(() => {
    const container = datetimeRef.current?.parentElement;
    const openPicker = () => {
      datetimeRef.current?.focus();
      datetimeRef.current?.showPicker();
    };
    container?.addEventListener("click", openPicker);
    return () => container?.removeEventListener("click", openPicker);
  }, []);

  // handle the Edit Patterns
  const [editPatterns, setEditPatterns] = useState(false);
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Header />
          {location.pathname === "/host" ||
          location.pathname === `/host/${roomId}` ? (
            <div className="flex flex-col items-center justify-center min-h-screen pt-8 bg-gradient-to-r from-rose-300 via-blue-200 to-purple-300">
              <div className="bg-white relative py-2 px-5 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-extrabold mb-2 p-4 border-b-2 border-black text-center text-blue-600">
                  Create or Join a Room
                </h1>
                <div className="mb-4 flex justify-center items-end">
                  <div className="w-[80%]">
                    <label
                      className="block text-gray-700 text-sm font-semibold mb-2"
                      htmlFor="roomId"
                    >
                      Room ID
                    </label>
                    <input
                      type="text"
                      id="roomId"
                      value={roomId || gameSettings?.roomId || ""}
                      onChange={(e) => {
                        updateGameSettings({ roomId: e.target.value });
                        updateGameState({ roomId: e.target.value });
                      }}
                      className="shadow appearance-none border rounded-s-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <button
                    onClick={generateRandomRoomId}
                    className="py-[7px] h-fit w-[20%] bg-blue-500 text-center text-white rounded-e-lg font-bold shadow-md hover:bg-blue-600 transition-all active:scale-90"
                  >
                    🎲
                  </button>
                </div>
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="hostPlay"
                      checked={hostPlay}
                      onChange={(e) => {
                        setHostPlay(e.target.checked);
                      }}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="hostPlay"
                      className="ml-2 block text-sm font-medium text-gray-900"
                    >
                      Host can also play🎮
                    </label>
                  </div>

                  {hostPlay && (
                    <>
                      <label
                        className="block text-gray-700 text-sm font-semibold mb-2"
                        htmlFor="ticketCount"
                      >
                        Number of Tickets :
                      </label>
                      <select
                        id="ticketCount"
                        value={ticketCount}
                        onChange={(e) => {
                          const selectedValue = Number(e.target.value);
                          setTicketCount(selectedValue);
                        }}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                      </select>
                    </>
                  )}
                </div>

                <div>
                  <button
                    className="relative mr-4 bg-yellow-600 hover:bg-yellow-700 transition-all active:scale-90 text-white font-bold py-2 px-4 rounded focus:outline-none"
                    onClick={() => {
                      setEditPatterns(!editPatterns);
                    }}
                  >
                    <span
                      className="
                      absolute -top-2 -right-2 bg-red-500 text-white font-bold rounded-full text-sm px-1.5

                    "
                    >
                      {gameSettings?.pattern?.length}
                    </span>
                    Edit patterns
                  </button>
                  <button
                    className={`${
                      gameSettings.isScheduled ? "bg-red-500" : "bg-green-500"
                    } hover:bg-${
                      gameSettings.isScheduled ? "red" : "green"
                    }-700 transition-all active:scale-90 text-white font-bold py-2 px-4 rounded focus:outline-none `}
                    onClick={(e) => {
                      const isChecked = gameSettings.isScheduled;
                      updateGameSettings({ isScheduled: !isChecked });
                    }}
                  >
                    Schedule
                  </button>
                </div>

                {editPatterns && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2">
                    {/* Modal Content Container */}
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4">
                      {/* Close Button */}
                      <button
                        type="button" // Important: Prevent form submission if nested in a form
                        onClick={() => setEditPatterns(false)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                        aria-label="Close pattern selection"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>

                      {/* PatternMenu Component */}
                      <PatternMenu />
                    </div>
                  </div>
                )}

                <div className="schedule mt-4 rounded-lg border flex flex-col border-gray-200">
                  <div className="relative w-full">
                    <input
                      ref={datetimeRef}
                      type="datetime-local"
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        updateGameSettings({
                          schedule: date.toLocaleString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }),
                        });
                      }}
                      className={`${
                        gameSettings.isScheduled ? "block" : "hidden"
                      } rounded w-full py-2 px-3 outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer`}
                      required
                    />
                    <span
                      className={`${
                        gameSettings.isScheduled ? "absolute" : "hidden"
                      }
                      ${gameSettings.schedule ? "hidden" : "absolute"}
                      left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 bold  border-2 border-black rounded grid place-items-center pointer-events-none bg-white w-full h-full`}
                    >
                      Click to select date/time 📅
                    </span>
                  </div>
                </div>

                <div className="flex justify-center mt-4 mb-3">
                  <button
                    onClick={handleCreateRoom}
                    className={`${
                      roomId || gameSettings?.pattern?.length > 0
                        ? "bg-blue-500 hover:bg-blue-700 transition-all active:scale-90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2"
                        : "bg-gray-500"
                    }
                    text-white font-bold py-2 px-4 rounded`}
                    // disabled={!roomId || gameSettings?.pattern?.length === 0}
                  >
                    Create Room
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </>
      )}
    </>
  );
};

export default Hostpage;
