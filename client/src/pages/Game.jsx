import React, { useState, useEffect } from "react";
import AssignNumbers from "../components/AssignNumbers";
import DrawNumbers from "../components/DrawNumbers";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import socket from "../utils/websocket";
import Message from "../components/Message";

const Game = () => {
  const [drawNumber, setDrawNumber] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const assign_no = location.state?.numbers;
  // console.log("Assign No", assign_no);
  const roomid = location.state?.roomid || sessionStorage.getItem("roomid");
  const timervalue = location.state?.timerValue || 3;
  // const roomid = sessionStorage.getItem("roomid");
  const hostid = localStorage.getItem("hostid");
  const [messageBox, setMessageBox] = useState("");

  const handleMessageBox = (message) => {
    setMessageBox(message);
    setTimeout(() => {
      setMessageBox("");
    }, 2000);
  };

  const [timerToggled, setTimerToggled] = useState(false);

  const handlePickNumberClick = () => {
    if (timerToggled) {
      return;
    }

    setTimerToggled(!timerToggled);
    handleTimer();
    if (drawNumber.length >= 90) {
      handleMessageBox("All numbers are drawn");
      return;
    } else if (drawNumber.length < 90) {
      socket.emit("pick_number", roomid, hostid);
    }
  };

  const [endMenu, setEndMenu] = useState(false);

  const endGameClick = () => {
    if (hostid) {
      setEndMenu(true);
    }
  };

  const endGame = () => {
    if (hostid) {
      socket.emit("end_game", roomid, hostid);
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
    socket.on("error", (message) => {
      handleMessageBox(message);
    });
    const pickedNumber = (number) => {
      setDrawNumber((prevDrawNumber) => [number, ...prevDrawNumber]);
    };
    socket.on("number_drawn", pickedNumber);

    return () => {
      socket.off("number_drawn", pickedNumber);
      socket.off("error");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      navigate(1); // Move forward in history (block going back)
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  return (
    <>
      {location.pathname === "/game" ? (
        <div className="container flex flex-col items-center justify-center p-4 min-w-full min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
          <div className="relative w-full max-w-md flex flex-col items-center gap-2">
            {hostid && (
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
            <div className="w-full bg-white p-2 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
                Your Tickets
              </h3>
              <AssignNumbers data={assign_no} />
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
              <div className="messageBox fixed top-10 left-1/2 transform -translate-x-1/2 p-4 bg-red-500 text-white rounded-lg shadow-md">
                {messageBox}
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
