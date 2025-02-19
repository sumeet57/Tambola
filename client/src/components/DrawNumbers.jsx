import React, { useEffect, useState } from "react";
import socket from "../utils/websocket";

const DrawNumbers = () => {
  const [drawNumber, setDrawNumber] = useState([]);
  useEffect(() => {
    const handleDrawNumber = (number) => {
      if (drawNumber.length > 90) {
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
      <div className="overflow-x-scroll flex flex-nowrap gap-2 bg-black p-4 rounded-2xl w-full">
        {drawNumber.map((num, index) => (
          <span
            key={num}
            className={`px-3 py-2 inline-block text-lg font-semibold rounded-full border ${
              index === 0 ? "bg-yellow-500" : "bg-gray-500"
            } text-white`}
          >
            {num}
          </span>
        ))}
        {/* {console.log("Draw Number", drawNumber)} */}
      </div>
    </>
  );
};

export default DrawNumbers;
