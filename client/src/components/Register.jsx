import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  updateLocalStorage,
  updateSessionStorage,
} from "../utils/storageUtils.js";
const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const submitUser = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name, phone, password }),
    });
    const data = await res.json();
    if (res.status === 200) {
      // remove host id and host from storage (utils/storageUtils.js)
      localStorage.clear();
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
    const res = await fetch("http://localhost:3000/api/host/register", {
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
      localStorage.clear();
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
    <>
      <h1 className="text-2xl font-semibold">Register page</h1>
      <form action="">
        name :{" "}
        <input
          className="border-2 border-black p-2"
          type="text"
          name="name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />{" "}
        <br />
        phone :{" "}
        <input
          className="border-2 border-black p-2"
          type="text"
          name="phone"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />{" "}
        <br />
        password :{" "}
        <input
          className="border-2 border-black p-2"
          type="password"
          name="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />{" "}
        <br />
        <button onClick={submitUser} className="px-6 py-3 bg-yellow-200 m-4">
          Register as User
        </button>
        <button onClick={submitHost} className="px-6 py-3 bg-yellow-200 m-4">
          Register as Host
        </button>
      </form>
      <div className="message text-red-500"></div>
    </>
  );
};

export default Register;
