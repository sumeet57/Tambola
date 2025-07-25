import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { PlayerContext } from "../context/PlayerContext";
import authApi from "../utils/authApi.js";

import { toast } from "react-toastify";

const Header = () => {
  //for context
  const { Player, updatePlayer, logout } = useContext(PlayerContext);

  // for navigation
  const navigate = useNavigate();

  //loading
  const [loading, setLoading] = useState(false);

  // toggle menu state and handler
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // logout handler
  const logoutClick = async () => {
    try {
      setLoading(true);
      const res = await authApi.post("/logout", {
        sessionId: localStorage.getItem("sessionId"),
      });
      if (res.status === 200) {
        toast.success("Logged out successfully", {
          autoClose: 2000,
        });
        logout();
      } else {
        console.log("Error logging out:", data.message);
        navigate("/auth");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // switching between host and user roles state and handler
  const [changeClick, setChangeClick] = useState(false);
  const changeClickHandler = () => {
    setChangeClick(!changeClick);
  };
  const handleRoleChange = async () => {
    let newRole;
    if (Player) {
      newRole = Player.role === "host" ? "user" : "host";
    }
    setLoading(true);
    const res = await authApi.post("/change-role", { role: newRole });
    if (res.status === 200) {
      toast.success(`Role changed to ${newRole}`);
      updatePlayer(res.data.user);
      toggleMenu();
    } else {
      console.error("Error changing role:", res.data.message);
      alert("Error changing role. Please try again.");
    }
    setLoading(false);
    changeClickHandler();
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <nav className="w-full py-3 flex justify-between items-center p-4 bg-zinc-700 fixed shadow-md">
            <div
              onClick={() => {
                navigate("/");
                window.location.reload(); // Refresh the page
              }}
              className="text-2xl sm:text-3xl font-bold font-sans text-white"
            >
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
                      <div className="flex items-center justify-start mb-2">
                        {Player?.role === "host" && (
                          <p className="text-red-500 font-semibold uppercase text-xl">
                            Host
                          </p>
                        )}
                        {Player?.role === "user" && (
                          <p className="text-blue-500 font-semibold uppercase text-xl">
                            User
                          </p>
                        )}
                        <button
                          onClick={changeClickHandler}
                          className="px-2 py-[2px] ml-2 text-sm bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition duration-300"
                        >
                          Change
                        </button>
                      </div>

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
          {changeClick && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-end">
              <div className="bg-white relative w-64 h-full shadow-lg p-6">
                {/* Close Button */}
                <div
                  onClick={changeClickHandler}
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
                      />
                    </svg>
                  </button>
                </div>

                {/* Role Switch Message */}
                <ul className="space-y-6">
                  <li>
                    {Player?.role === "host" ? (
                      <p className="text-gray-800 text-lg">
                        Do you want to change role to{" "}
                        <span className="font-semibold">User</span>?
                      </p>
                    ) : (
                      <p className="text-gray-800 text-lg">
                        Do you want to change role to{" "}
                        <span className="font-semibold">Host</span>?
                      </p>
                    )}
                  </li>

                  {/* Confirm Button */}
                  <li>
                    <button
                      onClick={handleRoleChange}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
                    >
                      Confirm
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Header;
