import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleStorageUpdate = () => {
      const playerData = JSON.parse(sessionStorage.getItem("player"));
      setPlayer(playerData);
    };
    // Listen for custom event
    window.addEventListener("sessionStorageUpdated", handleStorageUpdate);

    // Initial fetch from sessionStorage
    handleStorageUpdate();
    return () => {
      window.removeEventListener("sessionStorageUpdated", handleStorageUpdate);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="w-full py-3 flex justify-between items-center p-4 bg-gray-100 fixed shadow-md">
        <div className="text-2xl font-bold text-blue-600">Tambola</div>
        <div className="flex items-center gap-2">
          {player ? (
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow">
              Points: {player?.points || 0}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition duration-300"
            >
              Login
            </button>
          )}
          <button
            onClick={toggleMenu}
            className="bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition duration-300"
          >
            Menu
          </button>
        </div>
      </nav>
      {isMenuOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-end">
          <div className="bg-white w-64 h-full shadow-lg p-6">
            <div
              onClick={toggleMenu}
              className="text-lg mb-4 w-full text-right"
            >
              <button className="bg-red-600 text-white p-2 rounded-full shadow hover:bg-red-700 transition duration-300">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.293 4.293a1 1 0 011.414 0L10 10.586l5.293-5.293a1 1 0 111.414 1.414L11.414 12l5.293 5.293a1 1 0 01-1.414 1.414L10 13.414 4.707 18.707a1 1 0 01-1.414-1.414L8.586 12 3.293 6.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
            <ul className="space-y-6">
              <li>
                <button
                  onClick={() => {
                    navigate("/");
                    toggleMenu();
                  }}
                  className="text-gray-800 hover:bg-gray-200 w-full text-left px-4 py-2 rounded-full shadow transition duration-300"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    sessionStorage.removeItem("player");
                    localStorage.removeItem("hostid");
                    localStorage.removeItem("userid");
                    setPlayer(null);
                    navigate("/");
                    toggleMenu();
                  }}
                  className="text-gray-800 hover:bg-gray-200 w-full text-left px-4 py-2 rounded-full shadow transition duration-300"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
