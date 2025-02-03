import React, { useEffect, useState } from "react";
import socket from "../utils/websocket";

const DrawNumbers = () => {
  const [drawNumber, setDrawNumber] = useState([]);
  useEffect(() => {
    const handleDrawNumber = (number) => {
      setDrawNumber((prevDrawNumber) => [...prevDrawNumber, number]);
    };

    socket.on("draw_number", handleDrawNumber);

    return () => {
      socket.off("draw_number", handleDrawNumber);
    };
  }, []);

  return (
    <>
      <div className="overflow-x-scroll flex flex-row-reverse flex-nowrap gap-2 bg-black p-4 rounded-2xl w-[400px]">
        {drawNumber.map((num) => (
          <span
            key={num}
            className="px-4 py-3 inline-block text-lg font-semibold rounded-full border bg-gray-500 text-white"
          >
            {num}
          </span>
        ))}
      </div>
    </>
  );
};

export default DrawNumbers;
