import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  updateLocalStorage,
  updateSessionStorage,
} from "../utils/storageUtils.js";

// import env
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const submitUser = async (e) => {
    e.preventDefault();
    // validate user input
    if (!name || !phone || !password) {
      document.querySelector(".message").innerHTML = "Please fill all fields";
      return;
    } else if (!/^\d{10}$/.test(phone)) {
      document.querySelector(".message").innerHTML =
        "Phone number should be 10 digits and contain only numbers";
      return;
    } else if (password.length < 6 || password.length > 20) {
      document.querySelector(".message").innerHTML =
        "Password should be between 6 to 20 characters";
      return;
    } else if (name.length < 3 || name.length > 20) {
      document.querySelector(".message").innerHTML =
        "Name should be between 3 to 20 characters";
      return;
    }

    // e.preventDefault();
    const res = await fetch(`${apiBaseUrl}/api/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name, phone, password }),
    });
    const data = await res.json();
    if (res.status === 200) {
      // remove host id and host from storage
      localStorage.removeItem("hostid");
      localStorage.removeItem("userid");
      sessionStorage.clear();
      updateLocalStorage("userid", data.userid);
      updateSessionStorage("player", data.user);
      navigate("/");
      document.querySelector(".message").innerHTML = data.message;
    } else {
      document.querySelector(".message").innerHTML = data.message;
    }
  };

  const submitHost = async (e) => {
    e.preventDefault();
    // validate user input
    if (!name || !phone || !password) {
      document.querySelector(".message").innerHTML = "Please fill all fields";
      return;
    } else if (!/^\d{10}$/.test(phone)) {
      document.querySelector(".message").innerHTML =
        "Phone number should be 10 digits and contain only numbers";
      return;
    } else if (password.length < 6 || password.length > 20) {
      document.querySelector(".message").innerHTML =
        "Password should be between 6 to 20 characters";
      return;
    } else if (name.length < 3 || name.length > 20) {
      document.querySelector(".message").innerHTML =
        "Name should be between 3 to 20 characters";
      return;
    }

    const res = await fetch(`${apiBaseUrl}/api/host/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name, phone, password }),
    });
    const data = await res.json();
    if (res.status === 200) {
      // remove user id and user from storage (utils/storageUtils.js)
      localStorage.removeItem("hostid");
      localStorage.removeItem("userid");
      sessionStorage.clear();
      updateLocalStorage("hostid", data.hostid);
      updateSessionStorage("player", data.host);
      navigate("/");
      document.querySelector(".message").innerHTML = data.message;
    } else {
      document.querySelector(".message").innerHTML = data.message;
    }
  };

  return (
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
        </form>
        <div className="message text-red-500 text-center mt-4"></div>
      </div>
    </div>
  );
};

export default Register;
