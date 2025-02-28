import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GameOver = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const winner = location.state?.name;

  const [gameEnded, setGameEnded] = useState(false);
  useEffect(() => {
    if (winner) {
      if (winner === "Game ended by host") {
        setGameEnded(true);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
        <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
          <div className="text-3xl font-bold text-red-600 mb-4">
            🎉 Game Over 🎉
          </div>
          {winner && (
            <div className="text-xl font-semibold text-yellow-500 mb-4">
              {gameEnded ? "🚫 Game ended by host" : `🏆 Winner : ${winner}!`}
            </div>
          )}
          <p className="text-gray-700 mb-6">
            All your progress is stored in the database.
          </p>
          <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
            <p className="text-gray-600 mb-4">
              You will be redirected to home in 10 seconds.
            </p>
            <p className="text-green-600 mb-4 text-xl font-bold">
              Thanks for playing! 🎮
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300"
            >
              Redirect Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameOver;
