import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GameOver = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const winner = location.state?.name;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-2xl font-bold text-red-600 mb-4">Game Over</div>
          {winner && (
            <div className="text-xl font-semibold text-yellow-400 mb-4">
              Congratulations {winner}!
            </div>
          )}
          <p className="text-gray-700 mb-6">
            All your progress is stored in the database.
          </p>
          <div className="bg-gray-200 p-4 rounded-lg">
            <p className="text-gray-600 mb-4">
              You will be redirected to home in 10 seconds.
            </p>
            <p className="text-green-600 mb-4 text-xl font-bold">
              Winner: {winner}
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
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
