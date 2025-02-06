import React, { useState, useEffect } from "react";
import AssignNumbers from "../components/AssignNumbers";
import DrawNumbers from "../components/DrawNumbers";
import { useLocation, Outlet } from "react-router-dom";
import socket from "../utils/websocket";

const Game = () => {
  const location = useLocation();
  const assign_no = location.state?.numbers;
  const roomid = location.state?.roomid;
  // const roomid = sessionStorage.getItem("roomid");
  const hostid = localStorage.getItem("hostid");

  const handlePickNumberClick = () => {
    // console.log("Pick Number Clicked");
    if (hostid) {
      socket.emit("pick_number", roomid);
    } else {
      console.log("Host not found");
    }
  };

  useEffect(() => {
    socket.on("error", (message) => {
      console.log(message);
      document.querySelector(".message").innerHTML = message;
    });
  });

  return (
    <>
      {location.pathname === "/game" ? (
        <div className="cont flex flex-col justify-center items-center p-4">
          <div className="flex flex-col justify-center items-center max-w-[21rem] gap-2">
            {hostid && (
              <>
                <div className="message hidden opacity-0"></div>
                <button
                  onClick={handlePickNumberClick}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Pick Number
                </button>
              </>
            )}
            <DrawNumbers />
            <AssignNumbers data={assign_no} />
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default Game;
