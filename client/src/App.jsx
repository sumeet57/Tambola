import React, { useEffect, useState } from "react";
import socket from "./utils/websocket.js";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import {
  updateLocalStorage,
  updateSessionStorage,
} from "./utils/storageUtils.js";

const App = () => {
  // for navigation
  const navigate = useNavigate();

  // eastablishing connection with socket
  useEffect(() => {
    socket.on("connect", () => {
      console.log(`Connected with ID: ${socket.id}`);
      localStorage.removeItem("socketid");
      updateLocalStorage("socketid", socket.id);
    });

    return () => {
      socket.off("connect");
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
        const res = await fetch("http://localhost:3000/api/game/player", {
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
        navigate("/login");
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
  const [showNotifications, setShowNotifications] = useState(false);
  const handleNotificationCloseClick = () => {
    setShowNotifications(false);
  };
  const handleNotificationClick = async () => {
    const res = await fetch("http://localhost:3000/api/user/find", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userid,
      }),
    });
    const data = await res.json();
    if (res.status === 200) {
      updateSessionStorage("player", data.user);
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
    navigate(`/user/${room}`);
  };

  return (
    <>
      <Header />
      <div className="w-full pt-10 h-screen flex flex-col md:flex-row gap-6 items-center justify-center bg-slate-300 p-4">
        <button
          className="bg-green-500 text-white w-40 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
          onClick={handleHostClick}
        >
          Host a Game
        </button>
        <button
          className="bg-yellow-500 text-white w-40 py-3 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300"
          onClick={handleJoinClick}
        >
          Join a Game
        </button>
        <button
          className="bg-red-400 text-white w-40 py-3 rounded-lg shadow-md hover:bg-red-500 transition duration-300"
          onClick={handleNotificationClick}
        >
          Invitations
        </button>
      </div>
      {showNotifications && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-x-scroll">
          <div className="bg-white p-6 rounded shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={handleNotificationCloseClick}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
            {player?.invites?.length > 0 ? (
              player.invites.map((invite) => {
                return (
                  <div
                    key={invite}
                    className="flex items-center justify-between p-2 border-b"
                  >
                    <div>{invite}</div>
                    <div>
                      <button
                        onClick={() => handleRoomJoinClick(invite)}
                        className="bg-green-500 text-white ml-3 px-4 py-2 rounded"
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
            <div className="msg text-red-500"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
