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
      // get the id from localstorage and stored available id in playerid
      const userid = localStorage.getItem("userid");
      const hostid = localStorage.getItem("hostid");
      const playerid = userid || hostid;

      // if playerid is available then fetch the player data from database
      if (playerid) {
        const res = await fetch(`${apiBaseUrl}/api/game/player`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: playerid,
          }),
        });
        const data = await res.json();
        if (res.status === 200) {
          updateSessionStorage("player", data.data);
        } else {
          console.log("Failed to fetch player data");
        }
      } else {
        console.log("No player data available");
        // navigate("/login");
      }
    };

    fetchPlayerData();
  }, []);

  // for conditional rendering i use sessionstorage/localstorage
  // u can use context api or redux for state management

  // handle click events
  const handleHostClick = () => {
    navigate("/host");
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
  };

  //get player from sessionstorage
  const [player, setPlayer] = useState(null);
  useEffect(() => {
    const storedPlayer = JSON.parse(sessionStorage.getItem("player"));
    if (storedPlayer) {
      setPlayer(storedPlayer);
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
          <div className="w-full pt-10 h-screen flex flex-col md:flex-row gap-6 items-center justify-center bg-slate-300 p-4">
            {hostid || userid ? (
              <>
                {hostid && (
                  <button
                    className="bg-green-500 text-white w-40 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                    onClick={handleHostClick}
                  >
                    Host a Game
                  </button>
                )}
                {userid && (
                  <>
                    <button
                      className="bg-yellow-500 text-white w-40 py-3 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300"
                      onClick={handleJoinClick}
                    >
                      Join a Game
                    </button>
                  </>
                )}
                <button
                  className="bg-red-400 text-white w-40 py-3 rounded-lg shadow-md hover:bg-red-500 transition duration-300"
                  onClick={handleNotificationClick}
                >
                  Invitations
                </button>
              </>
            ) : (
              <>
                <button
                  className="bg-green-500 text-white w-40 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                  onClick={handleRegisterClick}
                >
                  Register
                </button>
                <button
                  className="bg-yellow-500 text-white w-40 py-3 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300"
                  onClick={handleLoginClick}
                >
                  Login
                </button>
              </>
            )}
          </div>
          {showNotifications && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded shadow-lg relative overflow-y-scroll w-[200px] max-h-[400px]">
                <div className="inviteTextCont border-b-2 border-black absolute top-0 left-0 w-full p-2 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Invites</h2>
                  <button
                    className=" text-gray-700 text-3xl"
                    onClick={handleNotificationCloseClick}
                  >
                    &times;
                  </button>
                </div>
                <div className="pt-8">
                  {player?.invites?.length > 0 ? (
                    player.invites.map((invite) => {
                      return (
                        <div
                          key={invite}
                          className="flex items-center justify-between p-2 border-b"
                        >
                          <div className="text-lg">{invite}</div>
                          <div>
                            <button
                              onClick={() => handleRoomJoinClick(invite)}
                              className="bg-green-500 text-white ml-3 px-5 py-2 rounded"
                            >
                              Join
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div>No invitations available</div>
                  )}
                </div>
                <div className="msg text-red-500"></div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default App;
