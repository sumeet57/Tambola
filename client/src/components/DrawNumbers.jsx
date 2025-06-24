import React, { useContext, useEffect, useState, useRef } from "react";
import { useSpeech } from "react-text-to-speech";
import { GameContext } from "../context/GameContext";

const DrawNumbers = () => {
  const { gameState } = useContext(GameContext);
  const [textToSpeak, setTextToSpeak] = useState("");
  const prevNumberRef = useRef(null);

  const { start, speechStatus, stop } = useSpeech({ text: textToSpeak });

  useEffect(() => {
    const numbers = gameState?.drawnNumbers || [];
    const lastNum = numbers.at(-1);

    if (lastNum && lastNum !== prevNumberRef.current) {
      prevNumberRef.current = lastNum;
      setTextToSpeak(String(lastNum));
    }
  }, [gameState?.drawnNumbers]);

  // fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };
  const AllNumbers = Array.from({ length: 90 }, (_, i) => i + 1); // [1, 2, ..., 90]

  useEffect(() => {
    if (textToSpeak && isVoiceEnabled) start(); // speak new number
  }, [textToSpeak]);

  //voice enable button
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const handleVoiceToggle = () => {
    setIsVoiceEnabled((prev) => !prev);
  };

  return (
    <>
      {gameState?.drawnNumbers.length > 0 && (
        <button
          className={`p-[6px] fixed top-[2%] left-[2%] rounded-full inline-block text-2xl font-medium border ${
            isVoiceEnabled
              ? "bg-green-500 border-green-800"
              : "bg-red-500 border-red-800"
          } text-gray-800 shadow-md`}
          onClick={handleVoiceToggle}
        >
          {isVoiceEnabled ? "🔊" : "🔇"}
        </button>
      )}
      <div
        onClick={toggleFullscreen}
        className="overflow-x-scroll relative flex flex-nowrap bg-red-500 gap-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 p-4 rounded-2xl w-full shadow-lg"
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
          <div className="relative bg-white w-[340px] max-h-[500px] overflow-y-auto rounded-2xl shadow-2xl border border-gray-300">
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
            <div className="p-2 grid grid-cols-6 gap-4">
              {AllNumbers.map((num, index) => (
                <span
                  key={index}
                  className={`w-10 h-10 text-lg font-bold grid place-items-center rounded-full border border-gray-500 shadow transition-all duration-200 ${
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
