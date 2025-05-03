import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { PlayerContext } from "../context/PlayerContext";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Header = () => {
  //for context
  const { Player, updatePlayer } = useContext(PlayerContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  //loading
  const [loading, setLoading] = useState(false);

  // const host = localStorage.getItem("hostid");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const logoutClick = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/user/logout`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      setLoading(false);
      const data = await res.json();
      if (res.status === 200) {
        // Clear local storage and session storage
        localStorage.clear();
        sessionStorage.clear();
        toggleMenu();
        setLoading(false);
        navigate("/"); // Navigate to home
        window.location.reload(); // Refresh the page
      } else {
        console.log("Error logging out:", data.message);
        navigate("/login");
        window.location.reload(); // Refresh the page
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <nav className="w-full py-3 flex justify-between items-center p-4 bg-zinc-700 fixed shadow-md">
            <div className="text-2xl sm:text-3xl font-bold font-sans text-white">
              Tambola
            </div>
            <div className="flex items-center gap-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition duration-300"
                onClick={() => {
                  navigate("/");
                  window.location.reload(); // Refresh the page
                }}
              >
                Home
              </button>
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
              <div
                className={`bg-white relative w-64 h-full shadow-lg p-6 ${
                  window.innerHeight < 350 ? "overflow-y-auto" : ""
                }`}
              >
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
                    <div className="w-full p-6 bg-white rounded-lg shadow-lg text-gray-800">
                      {Player?.role == "host" && (
                        <p className="text-red-500">Host</p>
                      )}
                      <div className="flex flex-col">
                        {Player?.name && (
                          <h2 className="text-2xl font-semibold mb-2">
                            {Player.name}
                          </h2>
                        )}
                        {Player?.phone && (
                          <div className="flex items-center">
                            <p className="text-gray-800 text-lg">
                              {Player.phone}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        navigate("/");
                        toggleMenu();
                      }}
                      className="text-gray-800 bg-blue-200 hover:bg-gray-200 w-full text-left px-4 py-2 rounded-full shadow transition duration-300"
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    {Player ? (
                      <>
                        <button
                          onClick={logoutClick}
                          className="text-gray-800 bg-blue-200 hover:bg-gray-200 w-full text-left px-4 py-2 rounded-full shadow transition duration-300"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <></>
                    )}
                  </li>
                </ul>
                <p className="text-sm mt-10 text-center text-gray-900 py-4 opacity-55">
                  Developed by{" "}
                  <a
                    href="https://github.com/sumeet57"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-600 hover:underline hover:text-orange-500 transition-all duration-300"
                  >
                    Sumeet
                  </a>
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Header;
