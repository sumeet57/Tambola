import React from "react";

const Loading = () => {
  return (
    <div className="fixed top-0 left-0 z-50 w-full h-screen bg-gray-200 bg-opacity-50">
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex justify-center flex-col items-center space-x-1 text-2xl text-gray-700">
          <svg
            fill="none"
            className="w-20 h-20 animate-spin"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
          <div>Loading...</div>

          <div
          className="w-9/12 "
          >

            <p
            className="text-center text-lg text-red-400 mt-4"
            >
              Currently in testing phase. It may take a few seconds to load the game. Please wait.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
