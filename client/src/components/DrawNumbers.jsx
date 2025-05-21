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
      <div className="overflow-x-scroll relative flex flex-nowrap gap-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 p-4 rounded-2xl w-full shadow-lg">
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
      </div>
    </>
  );
};

export default DrawNumbers;
