import React, { useContext, useEffect, useState } from "react";
import { useLocation, useParams, Outlet, useNavigate } from "react-router-dom";

//import centralized socket connection
import socket from "../utils/websocket";

//import utilities functions
import { hashToText } from "../utils/game.js";

//import components
import Header from "../components/Header";
import Loading from "../components/Loading";

//import context
import { PlayerContext } from "../context/PlayerContext";
import { GameContext } from "../context/GameContext";

//import toastify
import { toast } from "react-toastify";

//import environment variables
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Userpage = () => {
  //for extracting roomid from params if present
  const { publicId } = useParams();
  let roomid = hashToText(publicId || ""); //if publicId is present then convert it to roomid else empty string

  //for context
  const { Player, updatePlayer } = useContext(PlayerContext);
  const { gameState, updateGameState } = useContext(GameContext);

  //for loading
  const [loading, setLoading] = useState(false);

  //for message handling
  const [messageStore, setMessageStore] = useState("");
  const [messageToggle, setMessageToggle] = useState(false);
  const messageHandler = (message) => {
    setMessageToggle(false);
    setMessageStore(message);
    setMessageToggle(true);
  };

  //for navigating
  const navigate = useNavigate();

  //geeting path from url for conditional rendering(Oulet is used for nested routing)
  const location = useLocation();

  //for joining room states
  const [roomId, setRoomId] = useState(roomid || ""); //if params is present then set it to roomid else empty string
  const [requestTickets, setRequestTickets] = useState(1);

  //for updating player state when user selects tickets
  useEffect(() => {
    updatePlayer({
      requestedTicketCount: requestTickets,
    });
  }, [requestTickets]);

  //for handling join room
  const handleJoin = async () => {
    if (!roomId || !publicId) {
      toast.warning("Public ID or Room ID is missing");
      return;
    } else if (requestTickets < 1) {
      toast.warning("Please select at least 1 ticket");
      return;
    }
    //for checking if player has enough points
    if (Player) {
      setLoading(true);
      // for checking if player is invited or not
      socket.emit("join_room", Player, roomId, publicId);
    } else {
      toast.warning("Please login to join a room");
      navigate("/login");
    }
  };

  //for listening to socket events
  useEffect(() => {
    const handleRoomJoined = (room) => {
      navigate(`/user/room/${room}`);
      setLoading(false);
      // deductPoints();
    };

    // Set up event listener for room_joined
    socket.on("room_joined", handleRoomJoined);

    // Handle errors
    socket.on("error", (message) => {
      toast.error(message);
      setLoading(false);
    });

    // Cleanup
    return () => {
      socket.off("room_joined", handleRoomJoined);
      socket.off("error");
    };
  }, [requestTickets, Player, navigate]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Header />
          {location.pathname === "/user" ||
          location.pathname === `/user/${publicId}` ? (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-rose-300 via-blue-200 to-purple-300">
              <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4">Join a Room</h2>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="roomId"
                  >
                    Room ID
                  </label>
                  <input
                    type="text"
                    id="roomId"
                    value={roomId}
                    onChange={(e) => {
                      setRoomId(e.target.value);
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="tickets"
                  >
                    Request Tickets
                  </label>
                  <select
                    id="tickets"
                    value={requestTickets}
                    onChange={(e) => {
                      let selectedPoints = parseInt(e.target.value);
                      // console.log("Selected points:", selectedPoints);
                      setRequestTickets(selectedPoints);
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                  </select>
                </div>
                {messageToggle && (
                  <p className="text-red-500 text-center">{messageStore}</p>
                )}
                <button
                  onClick={handleJoin}
                  className="bg-blue-500 hover:bg-blue-700 transition-all active:scale-90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Join
                </button>
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

export default Userpage;
