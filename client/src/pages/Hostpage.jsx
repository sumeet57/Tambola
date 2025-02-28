import React, { useEffect, useState } from "react";
import { useLocation, Outlet, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import socket from "../utils/websocket";
import { updateSessionStorage } from "../utils/storageUtils";
import Loading from "../components/Loading";
//import env
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Hostpage = () => {
  //for navigation
  const navigate = useNavigate();

  // for getting the current path
  const location = useLocation();

  // for storing the room id and ticket count
  const temproomid = useParams();

  // for getting the socket id from local storage
  const socketid = localStorage.getItem("socketid");
  const hostid = localStorage.getItem("hostid");

  //protecting the route
  useEffect(() => {
    if (!hostid) {
      navigate("/login");
    }
    if (!socketid) {
      navigate("/login");
    }
  }, []);

  const [roomId, setRoomId] = useState(temproomid.roomid || "");
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const [messageStore, setMessageStore] = useState("");
  const [messageToggle, setMessageToggle] = useState(false);

  const messageHandler = (message) => {
    setMessageToggle(false);
    setMessageStore(message);
    setMessageToggle(true);
  };

  // session storage for player
  let player = null;
  const getplayer = sessionStorage.getItem("player");
  if (getplayer && getplayer !== "undefined" && getplayer !== "null") {
    player = JSON.parse(getplayer);
  }

  const handleCreateRoom = () => {
    // Handle room creation logic here
    // setLoading(true);
    if (hostid && player) {
      if (roomId === "") {
        messageHandler("Room ID cannot be empty");
        return;
      }
      handleRoomCreated();
    } else {
      messageHandler("Host not found login again");
    }
  };
  const deductPoints = async () => {
    if (hostid && player) {
      try {
        const res = await fetch(`${apiBaseUrl}/api/game/points`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: hostid,
            points: ticketCount, // Always uses the latest ticketCount
          }),
        });

        const data = await res.json();
        if (res.status === 200) {
          updateSessionStorage("player", data.data); // Update player session data
          setTicketCount(1); // Reset ticket count
        } else {
          messageHandler(data.message);
        }
      } catch (error) {
        messageHandler("Failed to deduct points");
        console.error("Failed to deduct points:", error);
      }
    } else {
      messageHandler("Host not found login again");
    }
  };
  const checkPoints = async () => {
    if (hostid && player) {
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/api/game/available`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: hostid,
            ticket: ticketCount,
          }),
        });
        const pointRes = await res.json();
        setLoading(false);
        if (res.status === 400) {
          messageHandler(pointRes.message);
          return;
        }
        if (res.status === 200) {
          setLoading(true);
          socket.emit("create_room", roomId, ticketCount, player, socketid);
        }
      } catch (error) {
        messageHandler("Failed to check points");
        console.error("Failed to check points:", error);
      }
    } else {
      messageHandler("Host not found login again");
    }
  };

  const handleRoomCreated = () => {
    checkPoints();
  };
  const handleRoomJoin = (room) => {
    setLoading(false);
    if (hostid && player) {
      updateSessionStorage("roomid", parseInt(room));
      deductPoints();
      navigate(`/host/room/${room}`);
    } else {
      messageHandler("Host not found login again");
    }
  };
  const handleJoinedRoom = (room) => {
    setLoading(false);
    updateSessionStorage("roomid", parseInt(room));
    navigate(`/host/room/${room}`);
  };

  const handleJoinRoom = async () => {
    if (hostid && player) {
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/api/game/invited`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: player?.phone,
            roomid: roomId,
          }),
        });

        const data = await res.json();
        setLoading(false);
        if (res.status === 400) {
          messageHandler(data.message);
          return;
        } else if (res.status === 200) {
          setLoading(true);
          socket.emit("join_room", roomId, player, ticketCount);
        }
      } catch (error) {
        messageHandler("Failed to join room");
        console.error("Failed to join room:", error);
      }
    } else {
      messageHandler("Host not found login again");
      // navigate("/login");
    }
  };

  useEffect(() => {
    socket.on("room_created", handleRoomJoin);

    socket.on("room_joined", handleJoinedRoom);

    socket.on("error", (message) => {
      setLoading(false);
      messageHandler(message);
    });

    // Cleanup
    return () => {
      socket.off("room_created", handleRoomJoin);
      socket.off("error");
    };
  }, [ticketCount, hostid, navigate]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Header />
          {location.pathname === "/host" ||
          location.pathname === `/host/${roomId}` ? (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
              <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">
                  Create Room
                </h1>
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
                    onChange={(e) => setRoomId(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="ticketCount"
                  >
                    Number of Tickets
                  </label>
                  <select
                    id="ticketCount"
                    value={ticketCount}
                    onChange={(e) => {
                      const selectedValue = Number(e.target.value);
                      setTicketCount(selectedValue); // Update the state
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </div>
                {messageToggle && (
                  <p className="text-red-500 text-center">{messageStore}</p>
                )}
                <button
                  onClick={handleCreateRoom}
                  className="bg-blue-500 hover:bg-blue-700 transition-all active:scale-90 text-white font-bold mr-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Create Room
                </button>
                <button
                  onClick={handleJoinRoom}
                  className="bg-blue-500 hover:bg-blue-700 transition-all active:scale-90 text-white font-bold mx-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Join Room
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

export default Hostpage;
