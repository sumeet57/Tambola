import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
//import components and utils
import AssignNumbers from "../components/AssignNumbers";
import DrawNumbers from "../components/DrawNumbers";
import Loading from "../components/Loading";
import socket from "../utils/websocket";
//import context
import { GameContext } from "../context/GameContext";
import { PlayerContext } from "../context/PlayerContext";

// import toastify
import { toast } from "react-toastify";

const Game = () => {
  //for context
  const { gameState, updateGameState } = useContext(GameContext);
  const { Player } = useContext(PlayerContext);

  //for navigation and getting current path
  const navigate = useNavigate();
  const location = useLocation();

  //for storing drawn numbers and timer
  const [drawNumber, setDrawNumber] = useState([]);
  const timervalue = gameState.timer || 3;
  const [timerToggled, setTimerToggled] = useState(false);
  const timeoutRef = useRef(null);

  // for getting roomid from gameState
  const roomid = gameState.roomid || "";

  // for loading state
  const [loading, setLoading] = useState(false);

  // for game state
  const [recentClaim, setRecentClaim] = useState(false);

  // for handle the pick number button click
  const handlePickNumberClick = () => {
    if (Player.role === "host") {
      if (timerToggled || recentClaim) {
        toast.warning("Please wait for the timer to finish or claim to reset!");
        return;
      }
      setTimerToggled(!timerToggled);
      handleTimer();
      if (drawNumber.length >= 90) {
        toast.warning("All numbers are drawn!");
        socket.emit("end_game", roomid, Player.id);
        return;
      } else if (drawNumber.length < 90) {
        socket.emit("pick_number", roomid, Player.id);
      }
    } else {
      toast.warning("Only the host can pick numbers!");
    }
  };

  // for handle end game click(for warning before ending the game)
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
      toast.error(message);
      setLoading(false);
    });
    const pickedNumber = (number) => {
      if (number.length === 90) {
        setTimerToggled(false);
        toast.success("All numbers are drawn!");
        toast.info("Game will over in 5 seconds", {
          autoClose: 5000,
          onClose: () => {
            socket.emit("end_game", roomid, Player.id);
          },
        });
      }
      setDrawNumber(number);
    };

    const handleClaim = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setRecentClaim(true);

      timeoutRef.current = setTimeout(() => {
        setRecentClaim(false);
      }, 5000);
    };
    socket.on("number_drawn", pickedNumber);
    socket.on("pattern_claimed", handleClaim);

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
        <div className="container flex flex-col items-center p-2 min-w-full min-h-screen bg-gradient-to-r from-rose-200 via-blue-200 to-purple-200">
          <div className="relative w-full max-w-lg md:max-w-2xl max-h-screen flex flex-col items-center gap-2">
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
                    drawNumber.length >= 90 || timerToggled || recentClaim
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

                <button
                  onClick={endGameClick}
                  className="w-[50%] bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-red-600 transition-transform transform active:scale-95"
                >
                  End Game
                </button>
              </div>
            )}

            {/* Drawn Numbers Section */}
            <div className="w-full top-0 flex flex-col bg-white p-1 rounded-lg items-center shadow-lg">
              <DrawNumbers />
            </div>

            {/* Tickets Section */}
            <div className="w-full bg-white p-2 rounded-lg shadow-lg h-full overflow-y-auto">
              {/* {console.log("nearest", gameState.assignedNumbers)} */}
              <AssignNumbers data={gameState.assign_numbers} />
            </div>

            {endMenu && (
              <div className="w-[400px] flex flex-col items-center gap-6 absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-zinc-900 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white text-center">
                  ⚠️ Are you sure you want to end the game? All your progress
                  will be stored in the database.
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
