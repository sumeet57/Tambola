import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext.jsx";


// currentRole is a fallback if currentUserRole prop is not provided

const UnAuthorizePage = () => {
  const { Player } = useContext(PlayerContext);
  const [displayRole, setDisplayRole] = useState(Player?.role || "guest");

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-4 sm:p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center max-w-lg w-full transform transition-all duration-500 ease-in-out scale-95 hover:scale-100">
          <svg
            className="w-32 h-32 mx-auto text-red-500 mb-6 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            ></path>
          </svg>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-red-600 mb-4 drop-shadow-md">
            403 Forbidden
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-700 font-medium leading-relaxed">
            You are currently logged in as a{" "}
            <span className="font-bold text-indigo-700">
              {displayRole.toUpperCase()}
            </span>
            .
          </p>
          <p className="text-md sm:text-lg text-gray-800 font-extrabold mt-2">
            This page requires{displayRole == "host" ? " USER " : " HOST "}role for access.
          </p>
          <p className="text-md sm:text-lg text-gray-600 mt-2">
            To change your role, please navigate to the home page.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnAuthorizePage;
