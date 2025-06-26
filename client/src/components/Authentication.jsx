import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  updateLocalStorage,
  updateSessionStorage,
} from "../utils/storageUtils.js";
import Loading from "./Loading.jsx";

//import env
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

//toastify
import { toast } from "react-toastify";

//context
import { PlayerContext } from "../context/PlayerContext.jsx";

const Authentication = () => {
  // for context
  const { Player, updatePlayer } = useContext(PlayerContext);

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // switch to register components
  const [switchToRegister, setSwitchToRegister] = useState(false);

  // url path
  const location = useLocation();
  const path = location.pathname;

  const loginUser = async (e) => {
    // validate user input
    e.preventDefault();
    // validate user input
    if (!phone || !password) {
      toast.warning("Please fill all the fields", {
        autoClose: 2000,
      });
      return;
    } else if (!/^\d{10}$/.test(phone)) {
      toast.warning("Please enter a valid 10-digit phone number", {
        autoClose: 2000,
      });
      return;
    } else if (password.length < 6 || password.length > 20) {
      toast.warning("Password should be between 6 and 20 characters long", {
        autoClose: 2000,
      });
      return;
    }
    setLoading(true);
    const res = await fetch(`${apiBaseUrl}/api/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.status === 200) {
      localStorage.clear();
      sessionStorage.clear();
      updatePlayer({
        name: data?.user?.name,
        phone: data?.user?.phone,
        id: data?.id,
        role: data?.user?.role,
      });
      updateLocalStorage("userid", data.userid);
      toast.success("Login successful");
      if (path === "/auth") {
        navigate("/");
      }
    } else {
      toast.error(data?.message || "Login failed");
    }
  };
  const registerUser = async (e) => {
    e.preventDefault();
    // validate user input
    if (!name || !phone || !password) {
      toast.warning("Please fill all the fields", {
        autoClose: 2000,
      });
      return;
    } else if (!/^\d{10}$/.test(phone)) {
      toast.warning("Please enter a valid 10-digit phone number", {
        autoClose: 2000,
      });
      return;
    } else if (password.length < 6) {
      toast.warning("Password should be at least 6 characters long", {
        autoClose: 2000,
      });
      return;
    } else if (
      name.length < 3 ||
      name.length > 20 ||
      !/^[a-zA-Z ]+$/.test(name)
    ) {
      toast.warning("Name: 3-20 characters, no special chars or numbers.", {
        autoClose: 2000,
      });
      return;
    }

    // e.preventDefault();

    setLoading(true);
    const res = await fetch(`${apiBaseUrl}/api/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name, phone, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.status === 200) {
      // remove host id and host from storage
      localStorage.clear();
      sessionStorage.clear();
      updateLocalStorage("id", data?.id);

      updatePlayer({
        name: data?.user?.name,
        phone: data?.user?.phone,
        id: data?.id,
        role: data?.user?.role,
      });
      toast.success("Registered successfully");
      if (path === "/auth") {
        navigate("/");
      }

      // navigate("/");
    } else {
      toast.error(data?.message || "Registration failed");
    }
  };

  // password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    const passwordInput = document.getElementById("password");
    if (passwordInput) {
      passwordInput.type = showPassword ? "password" : "text";
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : switchToRegister ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-3xl font-bold text-center mb-6">Register</h1>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  type="text"
                  required
                  name="name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <input
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  name="phone"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="flex space-y-1 items-center">
                  <input
                    className="passwordCommon mt-1 block w-full border border-gray-300 rounded-s-md p-2"
                    type="password"
                    required
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div
                    onClick={togglePasswordVisibility}
                    className="flex items-center justify-center w-[50px] border border-gray-300 rounded-e-md p-2"
                  >
                    <button type="button">
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M2 2L22 22"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8174 18.2734 17.2711 17.2884M11 5.05822C11.3254 5.02013 11.6588 5 12 5C18.3636 5 22 12 22 12C22 12 21.3082 13.3317 20 14.8335"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M14 14.2362C13.4692 14.7112 12.7684 15.0001 12 15.0001C10.3431 15.0001 9 13.657 9 12.0001C9 11.1764 9.33193 10.4303 9.86932 9.88818"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={registerUser}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Register
                </button>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setSwitchToRegister(false);
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    Login
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <input
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  type="tel"
                  name="phone"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="flex space-y-1 items-center">
                  <input
                    className="passwordCommon mt-1 block w-full border border-gray-300 rounded-s-md p-2"
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div
                    onClick={togglePasswordVisibility}
                    className="flex items-center justify-center w-[50px] border border-gray-300 rounded-e-md p-2"
                  >
                    <button type="button">
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M2 2L22 22"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8174 18.2734 17.2711 17.2884M11 5.05822C11.3254 5.02013 11.6588 5 12 5C18.3636 5 22 12 22 12C22 12 21.3082 13.3317 20 14.8335"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M14 14.2362C13.4692 14.7112 12.7684 15.0001 12 15.0001C10.3431 15.0001 9 13.657 9 12.0001C9 11.1764 9.33193 10.4303 9.86932 9.88818"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={loginUser}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Login
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      console.log("Switching to register");
                      setSwitchToRegister(true);
                      console.log(switchToRegister);
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    Register
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Authentication;
