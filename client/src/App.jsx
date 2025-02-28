import React, { useEffect, useState } from "react";
import socket from "./utils/websocket.js";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import {
  updateLocalStorage,
  updateSessionStorage,
} from "./utils/storageUtils.js";
import Loading from "./components/Loading.jsx";

//import env
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const App = () => {
  // for navigation
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!socket.connected); // Check initial connection
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const handleConnect = () => {
      console.log(`Connected with ID: ${socket.id}`);
      setLoading(false);
      localStorage.removeItem("socketid");
      updateLocalStorage("socketid", socket.id);
    };

    if (socket.connected) {
      handleConnect(); // If already connected, call it immediately
    } else {
      setLoading(true); // If not connected, wait for the "connect" event
    }

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, []);

  // for getting player from database and storing in sessionstorage
  useEffect(() => {
    const fetchPlayerData = async () => {
      const userid = localStorage.getItem("userid");
      const hostid = localStorage.getItem("hostid");
      const playerid = userid || hostid;

      if (playerid) {
        try {
          const res = await fetch(`${apiBaseUrl}/api/game/player`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: playerid }),
          });

          if (res.status === 200) {
            const data = await res.json();

            if (data.data) {
              updateSessionStorage("player", data.data);
              setPlayer(data.data);
            }
          } else {
            console.error("Failed to fetch player data");
          }
        } catch (error) {
          console.error("Error fetching player data:", error);
        }
      }
    };

    fetchPlayerData();
  }, []);
  // for conditional rendering i use sessionstorage/localstorage
  // u can use context api or redux for state management

  // handle click events
  const handleHostClick = () => {
    navigate("/host");
    // console.log(player);
  };
  const handleJoinClick = () => {
    navigate("/user");
  };

  //to update invitation ,finding user by its id
  const userid = localStorage.getItem("userid");
  const hostid = localStorage.getItem("hostid");
  const [showNotifications, setShowNotifications] = useState(false);
  const handleNotificationCloseClick = () => {
    setShowNotifications(false);
  };
  const handleNotificationClick = async () => {
    if (player) {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/game/player`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userid || hostid,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.status === 200) {
        updateSessionStorage("player", data.data);
      }
      setShowNotifications(true);
    } else {
      navigate("/login");
    }
  };

  //get player from sessionstorage
  useEffect(() => {
    const storedPlayer = sessionStorage.getItem("player");
    if (
      storedPlayer &&
      storedPlayer !== "undefined" &&
      storedPlayer !== "null"
    ) {
      setPlayer(JSON.parse(storedPlayer));
    }
  }, [showNotifications]);

  //handle room join click
  const handleRoomJoinClick = (room) => {
    if (userid) {
      navigate(`/user/${room}`);
      // navigate(`/user/${room}`);
    } else if (hostid) {
      navigate(`/host/${room}`);
    } else {
      navigate("/login");
    }
  };

  //button click events
  const handleRegisterClick = () => {
    navigate("/register");
  };
  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Header />
          <div className="w-full pt-10 h-screen flex flex-col gap-4 items-start justify-center bg-slate-300 p-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-6">
              Welcome,{" "}
              {player?.phone ? (
                <span className="font-bold">{player?.name}</span>
              ) : (
                <span className="font-bold">Guest</span>
              )}{" "}
              👋
            </h1>

            {/* Buttons Container */}
            <div className="flex flex-wrap gap-6">
              {hostid || userid ? (
                <>
                  {hostid && (
                    <button
                      className="bg-green-500 text-white w-44 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                      onClick={handleHostClick}
                    >
                      🎮 Host a Game
                    </button>
                  )}
                  {userid && (
                    <button
                      className="bg-yellow-500 text-white w-44 py-3 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300"
                      onClick={handleJoinClick}
                    >
                      🔗 Join a Game
                    </button>
                  )}
                  <button
                    className="bg-red-400 text-white w-44 py-3 rounded-lg shadow-md hover:bg-red-500 transition duration-300"
                    onClick={handleNotificationClick}
                  >
                    📩 Invitations
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="bg-green-500 text-white w-44 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                    onClick={handleRegisterClick}
                  >
                    📝 Register
                  </button>
                  <button
                    className="bg-yellow-500 text-white w-44 py-3 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300"
                    onClick={handleLoginClick}
                  >
                    🔐 Login
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notifications Modal */}
          {showNotifications && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg relative w-[280px] max-h-[450px] overflow-y-auto">
                <div className="flex justify-between items-center border-b-2 border-black pb-2">
                  <h2 className="text-2xl font-bold">📨 Invites</h2>
                  <button
                    className="text-gray-700 text-3xl"
                    onClick={handleNotificationCloseClick}
                  >
                    &times;
                  </button>
                </div>
                <div className="mt-4">
                  {player?.invites?.length > 0 ? (
                    player.invites.map((invite) => (
                      <div
                        key={invite}
                        className="flex items-center justify-between p-3 border-b"
                      >
                        <div className="text-lg">{invite}</div>
                        <button
                          onClick={() => handleRoomJoinClick(invite)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                        >
                          ✅ Join
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center mt-3">
                      No invitations available 😕
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default App;
