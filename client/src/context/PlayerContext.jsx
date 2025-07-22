import React, { useEffect, useState } from "react";
import socket from "../utils/websocket";
import { updateSessionStorage } from "../utils/storageUtils";
import authApi, {
  getAccessToken,
  setAccessToken,
  markAsLoggedOut,
} from "../utils/authApi";

export const PlayerContext = React.createContext();

export const PlayerProvider = ({ children }) => {
  // Get current path to handle redirects
  const location = window.location.pathname;

  // for loading state and socket ID
  const [loading, setLoading] = React.useState(true);

  // for socket ID state
  const [socketId, setSocketId] = React.useState(null);

  // for player state
  const [Player, setPlayer] = React.useState(() => {
    const userData = sessionStorage.getItem("player");
    return userData ? JSON.parse(userData) : {};
  });

  // update or add a new property to the player object
  const updatePlayer = (newUser) => {
    setPlayer((prevUser) => {
      const updatedUser = {
        ...prevUser,
        ...newUser,
      };
      updateSessionStorage("player", updatedUser);
      return updatedUser;
    });
  };

  // Socket connection handler
  React.useEffect(() => {
    const handleConnect = () => {
      const newId = socket.id;
      // Update localStorage
      localStorage.setItem("socketid", newId);

      // Update context + session storage
      setPlayer((prev) => {
        const updated = { ...prev, socketId: newId };
        updateSessionStorage("player", updated);
        return updated;
      });

      setSocketId(newId);
      setLoading(false);
    };

    const handleDisconnect = () => {
      console.log("❌ Disconnected");
      setLoading(true);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  useEffect(() => {
    const handleConnectError = (err) => {
      setLoading(true); // Still show loading if connection fails
    };

    const handleTimeout = () => {
      setLoading(true); // Timeout indicates that socket is not connected
    };

    socket.on("connect_error", handleConnectError);
    socket.on("connect_timeout", handleTimeout);

    return () => {
      socket.off("connect_error", handleConnectError);
      socket.off("connect_timeout", handleTimeout);
    };
  }, []);

  // Load user from sessionStorage or server
  useEffect(() => {
    setLoading(true);
    const userData = JSON.parse(sessionStorage.getItem("player"));

    if (userData && userData.name && userData.phone && userData.id) {
      updatePlayer(userData);
      setLoading(false);
    }

    // Refresh token and get new access token first
    const tryRestoreSession = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      const sessionId = localStorage.getItem("sessionId");

      if (!refreshToken || !sessionId) {
        setLoading(false);

        setPlayer(null);
        if (location === "/") {
          window.location.href = "/auth";
        }
        return;
      }

      try {
        // Refresh token
        const res = await authApi.post("/tokens", { refreshToken, sessionId });
        const accessToken = res.data.accessToken;

        // Store new access token in memory
        setAccessToken(accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        localStorage.setItem("userid", res.data.id);

        // Then fetch the user
        const { data } = await authApi.get("/me");

        updatePlayer({
          name: data?.name || "",
          phone: data?.phone || "",
          role: data?.role || "user",
          id: data?._id || "",
        });

        sessionStorage.setItem(
          "player",
          JSON.stringify({
            name: data?.name || "",
            phone: data?.phone || "",
            role: data?.role || "user",
            id: data?._id || "",
          })
        );
      } catch (err) {
        console.error("Session invalid, redirecting:", err.message);
        localStorage.clear();
        sessionStorage.clear();

        setPlayer(null);
        window.location.href = "/auth";
      } finally {
        setLoading(false);
      }
    };

    tryRestoreSession();
  }, []);

  // logout handler
  const logout = () => {
    setAccessToken(null);
    markAsLoggedOut();
    localStorage.clear();
    sessionStorage.clear();
    socket.disconnect();
    setPlayer(null);
    window.location.href = "/auth";
  };

  return (
    <PlayerContext.Provider
      value={{
        Player,
        updatePlayer,
        loading,
        setLoading,
        getAccessToken,
        setAccessToken,
        logout,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
