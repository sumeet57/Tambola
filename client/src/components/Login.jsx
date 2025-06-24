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

const Login = () => {
  // for context
  const { Player, updatePlayer } = useContext(PlayerContext);

  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [messageStore, setMessageStore] = useState("");
  const [messageToggle, setMessageToggle] = useState(false);

  const submitUser = async (e) => {
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
      navigate("/");
    } else {
      toast.error(data?.message || "Login failed");
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
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
                  required
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
                <input
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  type="password"
                  required
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={submitUser}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Login
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    onClick={() => navigate("/register")}
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

export default Login;
