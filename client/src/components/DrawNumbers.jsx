import React, { useEffect, useState } from "react";
import socket from "../utils/websocket";
import {
  updateLocalStorage,
  updateSessionStorage,
} from "../utils/storageUtils";

const DrawNumbers = () => {
  // const drawnum = JSON.parse(localStorage.getItem("drawNumber"));
  const [drawNumber, setDrawNumber] = useState([]);
  useEffect(() => {
    const handleDrawNumber = (number) => {
      if (drawNumber.length > 90) {
        return;
      } else {
        setDrawNumber((prevDrawNumber) => [number, ...prevDrawNumber]);
      }
    };

    socket.on("number_drawn", handleDrawNumber);

    return () => {
      socket.off("number_drawn", handleDrawNumber);
    };
  }, []);

  return (
    <>
      <div className="overflow-x-scroll flex flex-nowrap gap-2 bg-gradient-to-r from-purple-500/40 via-pink-600/40 to-red-600/40 p-4 rounded-2xl w-full shadow-lg">
        {drawNumber.map((num, index) => (
          <span
            key={num}
            className={`px-3 py-2 inline-block text-lg font-medium rounded-full border ${
              index === 0
                ? "bg-red-500/80 border-yellow-700 font-bold"
                : "bg-gray-500 border-gray-700"
            } text-white shadow-md`}
          >
            {num}
          </span>
        ))}
      </div>
    </>
  );
};

export default DrawNumbers;
