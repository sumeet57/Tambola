import React, { useEffect, useState } from "react";
import socket from "../socket/websocket";

const DrawNumbers = () => {
  const [drawNumber, setDrawNumber] = useState([]);
  useEffect(() => {
    const handleDrawNumber = (number) => {
      console.log(number);
      setDrawNumber((prevDrawNumber) => [...prevDrawNumber, number]);
    };

    socket.on("draw_number", handleDrawNumber);

    return () => {
      socket.off("draw_number", handleDrawNumber);
    };
  }, []);

  return (
    <>
      <h1>the number will draw every 5 sec</h1>
      <ul>
        {drawNumber.map((number, index) => (
          <li key={index}>{number}</li>
        ))}
      </ul>
    </>
  );
};

export default DrawNumbers;
