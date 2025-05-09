import React from "react";

const UnAuthorizePage = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-50 to-gray-100">
        <h1 className="text-6xl font-extrabold text-red-500 drop-shadow-lg">
          403 Forbidden
        </h1>
        <p className="mt-4 text-xl text-gray-800 font-medium text-center">
          Oops! You don't have permission to access this page. If you believe
          this is a mistake, please contact the administrator.
        </p>
        <div className="mt-8 flex flex-col items-center space-y-4">
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Return to Home
          </button>
        </div>
      </div>
    </>
  );
};

export default UnAuthorizePage;
