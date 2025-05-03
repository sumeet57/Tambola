import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  updateLocalStorage,
  updateSessionStorage,
} from "../utils/storageUtils.js";
import Loading from "./Loading.jsx";
import { PlayerContext } from "../context/PlayerContext.jsx";

// import env
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const { Player, updatePlayer } = useContext(PlayerContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [messageStore, setMessageStore] = useState("");
  const [messageToggle, setMessageToggle] = useState(false);

  const submitUser = async (e) => {
    e.preventDefault();
    // validate user input
    if (!name || !phone || !password) {
      setMessageToggle(false);
      setMessageStore("Please fill all fields");
      setMessageToggle(true);
      return;
    } else if (!/^\d{10}$/.test(phone)) {
      setMessageToggle(false);
      setMessageStore(
        "Phone number should be 10 digits and contain only numbers"
      );
      setMessageToggle(true);
      return;
    } else if (password.length < 6) {
      setMessageToggle(false);
      setMessageStore("Password should be between 6 to 20 characters");
      setMessageToggle(true);
      return;
    } else if (name.length < 3 || name.length > 20) {
      setMessageToggle(false);
      setMessageStore("Name should be between 3 to 20 characters");
      setMessageToggle(true);
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
      navigate("/");
    } else {
      setMessageToggle(false);
      setMessageStore(data.message || "Failed to register as user");
      setMessageToggle(true);
    }
  };

  const submitHost = async (e) => {
    e.preventDefault();
    // validate user input
    if (!name || !phone || !password) {
      setMessageToggle(false);
      setMessageStore("Please fill all fields");
      setMessageToggle(true);
      return;
    } else if (!/^\d{10}$/.test(phone)) {
      setMessageToggle(false);
      setMessageStore(
        "Phone number should be 10 digits and contain only numbers"
      );
      setMessageToggle(true);
      return;
    } else if (password.length < 6) {
      setMessageToggle(false);
      setMessageStore("Password should be between 6 to 20 characters");
      setMessageToggle(true);
      return;
    } else if (name.length < 3 || name.length > 20) {
      setMessageToggle(false);
      setMessageStore("Name should be between 3 to 20 characters");
      setMessageToggle(true);
      return;
    }

    setLoading(true);
    const res = await fetch(`${apiBaseUrl}/api/host/register`, {
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
      // remove user id and user from storage (utils/storageUtils.js)
      localStorage.clear();
      sessionStorage.clear();
      updateLocalStorage("id", data.hostid);
      updatePlayer({
        name: data?.user?.name,
        phone: data?.user?.phone,
        id: data?.id,
        role: data?.user?.role,
      });
      navigate("/");
    } else {
      setMessageToggle(false);
      setMessageStore(data.message || "Failed to register as host");
      setMessageToggle(true);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
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
              {messageToggle && (
                <div className="message text-red-500 text-center mt-4">
                  {messageStore}
                </div>
              )}
              <div className="flex justify-between">
                <button
                  onClick={submitUser}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Register as User
                </button>
                <button
                  onClick={submitHost}
                  className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200 ml-4"
                >
                  Register as Host
                </button>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      navigate("/login");
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
      )}
    </>
  );
};

export default Register;
