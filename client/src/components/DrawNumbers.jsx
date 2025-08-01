import React, { useContext, useEffect, useState, useRef } from "react";
import { useSpeech } from "react-text-to-speech";
import { GameContext } from "../context/GameContext";

const DrawNumbers = () => {
  // context for game state
  const { gameState } = useContext(GameContext);

  // state and handler for text-to-speech package
  const [textToSpeak, setTextToSpeak] = useState("");
  const prevNumberRef = useRef(null);
  const { start } = useSpeech({ text: textToSpeak });
  useEffect(() => {
    const numbers = gameState?.drawnNumbers || [];
    const lastNum = numbers.at(-1);

    if (lastNum && lastNum !== prevNumberRef.current) {
      prevNumberRef.current = lastNum;
      setTextToSpeak(String(lastNum));
    }
  }, [gameState?.drawnNumbers]);
  useEffect(() => {
    if (textToSpeak) start(); // speak new number
  }, [textToSpeak]);

  // fullscreen mode state and handler
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };
  const AllNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

  return (
    <>
      <div
        onClick={toggleFullscreen}
        className="overflow-x-scroll relative flex flex-nowrap bg-red-500 gap-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 p-3 rounded-2xl w-full shadow-lg"
      >
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
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-white w-[340px] h-[500px] max-h-screen overflow-y-auto scroll rounded-2xl shadow-2xl border border-gray-300">
            {/* Sticky Close Button */}
            <div className="sticky top-0 z-10 bg-white px-1 py-2 border-b border-gray-700 rounded-t-2xl flex justify-end">
              <h2 className="flex-1 text-left mt-1">
                <span className="text-lg capitalize font-bold text-zinc-800">
                  Drawn Numbers
                </span>
              </h2>

              <button
                className="px-3 py-1.5 text-base font-semibold text-white bg-red-500 hover:bg-red-600 rounded-full transition duration-200 shadow"
                onClick={toggleFullscreen}
              >
                ✕
              </button>
            </div>

            {/* Grid of Numbers */}
            <div className="p-2 grid grid-cols-5 gap-2">
              {AllNumbers.map((num, index) => (
                <span
                  key={index}
                  className={`w-12 h-12 text-xl font-bold grid place-items-center rounded-full border border-gray-500 shadow transition-all duration-200 ${
                    gameState.drawnNumbers.includes(num)
                      ? "bg-gradient-to-tr from-pink-400 to-purple-500 border-purple-600 text-white scale-110"
                      : "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DrawNumbers;
