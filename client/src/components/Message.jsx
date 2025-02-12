import React from "react";
import { useState, useEffect } from "react";
import socket from "../utils/websocket";

const Message = () => {
  const [roomid, setRoomid] = useState("");
  const [playerName, setPlayerName] = useState("");
  useEffect(() => {
    const id = sessionStorage.getItem("roomid");
    const player = JSON.parse(sessionStorage.getItem("player"));
    setRoomid(id);
    setPlayerName(player?.name);
  }, []);
  const [messages, setMessages] = useState("");
  const [boxToggle, setBoxToggle] = useState(false);
  const msg = [
    "hello 😊",
    "all the best 👍",
    "how are you 🤔",
    "good 😃",
    "bad 😞",
    "bye 👋",
    "lucky 🍀",
    "angry 😠",
  ];

  const lastClickTimeRef = React.useRef(0);
  const timerRef = React.useRef(null);

  const clickHandler = (e) => {
    const currentTime = Date.now();
    if (currentTime - lastClickTimeRef.current < 5000) {
      return;
    }
    lastClickTimeRef.current = currentTime;

    const message = e.target.innerHTML;
    socket.emit("message", message, roomid, playerName);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      lastClickTimeRef.current = 0;
    }, 5000);
  };

  const handleMsgReceived = (message, playerName) => {
    setMessages(`${playerName} : ${message}`);
    document.querySelector(".msgcont").style.display = "none";
    setBoxToggle(true);
    setTimeout(() => {
      document.querySelector(".msgcont").style.display = "flex";
      setBoxToggle(false);
    }, 2000);
  };

  useEffect(() => {
    socket.on("messageReceived", handleMsgReceived);
    return () => {
      socket.off("messageReceived", handleMsgReceived);
    };
  }, []);

  return (
    <>
      <div className="msgcont overflow-x-scroll relative flex justify-start items-center gap-2 w-full py-2">
        {msg.map((message, index) => (
          <span
            key={index}
            onClick={clickHandler}
            className="text-lg shrink-0 select-none capitalize bg-white rounded-lg border-2 border-gray-200 p-2"
          >
            {message}
          </span>
        ))}
      </div>
      {boxToggle && (
        <div className="w-full h-full capitalize flex justify-center items-center bg-zinc-800 text-white border-2 border-gray-200 py-5 rounded-lg">
          {messages}
        </div>
      )}
      <p className="text-red-500 text-center">there will be 5 sec timeout</p>
    </>
  );
};

export default Message;
