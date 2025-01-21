import React, { useState, useEffect } from "react";
import socket from "../socket/websocket";

const Game = () => {
  const [announceNumber, setAnnounceNumber] = useState([]);
  const [announce, setAnnounce] = useState(0);

  useEffect(() => {
    socket.on("announce", (num) => {
      setAnnounce(num);
      setAnnounceNumber((prev) => {
        return [...prev, num];
      });
    });
  }, []);
  return (
    <>
      <h1>game</h1>
      {announceNumber.map((num, index) => (
        <div key={index}>{num}</div>
      ))}
    </>
  );
};

export default Game;
