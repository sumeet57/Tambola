import React, { useState, useEffect, useContext, useRef } from "react";
import AssignNumbers from "../components/AssignNumbers";
import DrawNumbers from "../components/DrawNumbers";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import socket from "../utils/websocket";
import Message from "../components/Message";
import { GameContext } from "../context/GameContext";
import { PlayerContext } from "../context/PlayerContext";
import Loading from "../components/Loading";

const Game = () => {
  //for context
  const { gameState, updateGameState } = useContext(GameContext);
  const { Player } = useContext(PlayerContext);

  const isFirstLoad = useRef(true);

  const [drawNumber, setDrawNumber] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const timervalue = gameState.timer || 3; // Default timer value

  let roomId = sessionStorage.getItem("roomid");

  const roomid = gameState.roomid || roomId || ""; // Default room ID
  const [messageBox, setMessageBox] = useState("");

  // for loading state
  const [loading, setLoading] = useState(false);

  const handleMessageBox = (message) => {
    setMessageBox(message);
    setTimeout(() => {
      setMessageBox("");
    }, 2000);
  };

  const [timerToggled, setTimerToggled] = useState(false);

  const handlePickNumberClick = () => {
    if (Player.role === "host") {
      if (timerToggled) {
        return;
      }
      setTimerToggled(!timerToggled);
      handleTimer();
      if (drawNumber.length >= 90) {
        handleMessageBox("All numbers are drawn");
        return;
      } else if (drawNumber.length < 90) {
        socket.emit("pick_number", roomid, Player.id);
      }
    } else {
      handleMessageBox("Only host can pick the number");
    }
  };

  const [endMenu, setEndMenu] = useState(false);

  const endGameClick = () => {
    if (Player.role === "host") {
      setEndMenu(true);
    }
  };

  const endGame = () => {
    if (Player.role === "host") {
      socket.emit("end_game", roomid, Player.id);
    }
    setEndMenu(false);
  };

  const saveGame = () => {
    if (Player.role === "host") {
      socket.emit("save_game", roomid, Player.id);
    }
  };

  //for development
  // const [timer, setTimer] = useState(0);

  // for production
  const [timer, setTimer] = useState(timervalue);

  const handleTimer = () => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setTimerToggled(false);
          // for production
          return timervalue;

          // for development
          // return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    updateGameState({ drawnNumbers: drawNumber });
  }, [drawNumber]);

  // socket event handlers, functions and states (drawn numbers, error messages)
  useEffect(() => {
    socket.on("error", (message) => {
      handleMessageBox(message);
      setLoading(false);
    });
    const pickedNumber = (number) => {
      setDrawNumber(number);
    };
    socket.on("number_drawn", pickedNumber);

    return () => {
      socket.off("number_drawn", pickedNumber);
      socket.off("error");
    };
  }, []);

  // connection and disconnection handling
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
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

  // avoid refreshing the page on reload
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
      ) : location.pathname === "/game" ? (
        <div className="container flex flex-col items-center justify-center p-4 min-w-full min-h-screen bg-gradient-to-r from-rose-300 via-blue-200 to-purple-300">
          <div className="relative w-full max-w-md flex flex-col items-center gap-2">
            {Player?.role === "host" && (
              <div className="w-full flex gap-2 items-center bg-white p-2 rounded-lg shadow-lg">
                <div className="message hidden opacity-0"></div>
                <button
                  onClick={
                    drawNumber.length >= 90 || timerToggled
                      ? null
                      : handlePickNumberClick
                  }
                  className={`w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg transition-transform transform ${
                    drawNumber.length >= 90 || timerToggled
                      ? "cursor-not-allowed bg-gray-500"
                      : "cursor-pointer hover:bg-blue-500 active:scale-95"
                  }`}
                >
                  {drawNumber.length >= 90
                    ? "All numbers are drawn!"
                    : `Pick Number${
                        timerToggled ? ` (${timer} sec left)` : ""
                      }`}
                </button>
                <button className="w-[50%] bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-green-600 transition-transform transform active:scale-95">
                  Save Game
                </button>
                <button
                  onClick={endGameClick}
                  className="w-[50%] bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-red-600 transition-transform transform active:scale-95"
                >
                  End Game
                </button>
              </div>
            )}

            {/* Drawn Numbers Section */}
            <div className="w-full flex flex-col items-center bg-white p-2 rounded-lg shadow-lg">
              <DrawNumbers />
            </div>
            {/* Message Section */}
            <div className="w-full flex flex-col items-center bg-white p-2 rounded-lg shadow-lg">
              <Message />
            </div>

            {/* Tickets Section */}
            <div className="w-full bg-white p-2 rounded-lg shadow-lg overflow-y-auto max-h-[400px]">
              <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
                Your Tickets
              </h3>
              {/* {console.log("nearest", gameState.assignedNumbers)} */}
              <AssignNumbers data={gameState.assign_numbers} />
            </div>

            {endMenu && (
              <div className="w-[400px] flex flex-col items-center gap-6 absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-zinc-900 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white text-center">
                  Are you sure you want to end the game? All your progress will
                  be stored in the database, but the winner will not be
                  declared.
                </h2>
                <button
                  onClick={endGame}
                  className="w-full bg-red-500 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-red-600 transition-transform transform active:scale-95"
                >
                  Confirm End Game
                </button>
                <button
                  onClick={() => setEndMenu(false)}
                  className="w-full bg-gray-500 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-gray-600 transition-transform transform active:scale-95"
                >
                  Cancel
                </button>
              </div>
            )}

            {messageBox.length > 0 && (
              <div className="messageBox fixed top-40 left-1/2 transform -translate-x-1/2 p-4 px-4 py-3 bg-red-500 text-white font-medium rounded-3xl shadow-md">
                😔 {messageBox}
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
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default Game;
