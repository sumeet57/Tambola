// src/pages/ErrorPage.jsx
import React from "react";
import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  //   console.error("Error caught by router:", error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-lg w-full">
        <h1 className="text-4xl font-extrabold text-red-600 mb-4">
          🚨 Oops! Something Went Wrong
        </h1>
        <p className="text-gray-700 text-lg mb-4">
          We encountered an unexpected error. Please try again.
        </p>
        {error?.status && (
          <p className="text-sm text-gray-500 mb-1">
            <strong>Status Code:</strong> {error.status}
          </p>
        )}
        {error?.statusText && (
          <p className="text-sm text-gray-500 mb-1">
            <strong>Status Text:</strong> {error.statusText}
          </p>
        )}
        {error?.message && (
          <p className="text-sm text-gray-500 mb-4">
            <strong>Error Message:</strong> {error.message}
          </p>
        )}
        <a
          href="/"
          className="inline-block mt-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-800 transition duration-300"
        >
          🔄 Go Back Home
        </a>
      </div>
    </div>
  );
};

export default ErrorPage;
