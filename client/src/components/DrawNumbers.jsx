import React, { useEffect, useState, useContext } from "react";
import socket from "../utils/websocket";
import {
  updateLocalStorage,
  updateSessionStorage,
} from "../utils/storageUtils";
import { PlayerContext } from "../context/PlayerContext";
import { GameContext } from "../context/GameContext";

const DrawNumbers = () => {
  //for context
  const { Player } = useContext(PlayerContext);
  const { gameState, updateGameState } = useContext(GameContext);

  // const [drawNumber, setDrawNumber] = useState(gameState.drawNumber || []);

  return (
    <>
      <div className="overflow-x-scroll flex flex-nowrap gap-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 p-4 rounded-2xl w-full shadow-lg">
        {[...gameState.drawnNumbers].reverse().map((num, index) => (
          <span
            key={num}
            className={`px-3 py-2 inline-block text-lg font-medium rounded-full border ${
              index === 0
                ? "bg-pink-300 border-purple-500 font-bold"
                : "bg-gray-200 border-gray-400"
            } text-gray-800 shadow-md`}
          >
            {num}
          </span>
        ))}
      </div>
    </>
  );
};

export default DrawNumbers;
