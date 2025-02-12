import React, { useState, useEffect } from "react";
import AssignNumbers from "../components/AssignNumbers";
import DrawNumbers from "../components/DrawNumbers";
import { useLocation, Outlet } from "react-router-dom";
import socket from "../utils/websocket";
import Message from "../components/Message";

const Game = () => {
  const [drawNumber, setDrawNumber] = useState([]);
  const location = useLocation();
  const assign_no = location.state?.numbers;
  const roomid = location.state?.roomid;
  // const roomid = sessionStorage.getItem("roomid");
  const hostid = localStorage.getItem("hostid");

  const handlePickNumberClick = () => {
    if (drawNumber.length >= 90) {
      console.log(drawNumber);
      document.querySelector(".message").innerHTML = "All numbers are drawn!";
      return;
    }
    socket.emit("pick_number", roomid);
  };

  useEffect(() => {
    socket.on("error", (message) => {
      document.querySelector(".message").innerHTML = message;
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

  return (
    <>
      {location.pathname === "/game" ? (
        <div className="cont flex flex-col items-center p-4 w-full min-h-screen bg-gray-100">
          <div className="w-full max-w-sm flex flex-col items-center gap-4">
            {hostid && (
              <div className="w-full flex flex-col items-center">
                <div className="message hidden opacity-0"></div>
                <button
                  onClick={
                    drawNumber.length >= 90 ? null : handlePickNumberClick
                  }
                  className={`w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md transition-all ${
                    drawNumber.length >= 90
                      ? "cursor-not-allowed"
                      : "cursor-pointer hover:bg-blue-400 active:scale-[0.9]"
                  }`}
                >
                  {drawNumber.length >= 90
                    ? "All numbers are drawn!"
                    : "Pick Number"}
                </button>
              </div>
            )}

            {/* Drawn Numbers Section */}
            <div className="w-full flex flex-col items-center bg-white p-4 rounded-lg shadow-md">
              <DrawNumbers />
            </div>
            {/* message section */}
            <div className="w-full flex flex-col items-center bg-white p-4 rounded-lg shadow-md">
              <Message />
            </div>

            {/* Tickets Section */}
            <div className="w-full bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 text-center mb-2">
                Your Tickets
              </h3>
              <AssignNumbers data={assign_no} />
            </div>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default Game;
