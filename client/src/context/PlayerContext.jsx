import React, { useEffect, useState } from "react";
import socket from "../utils/websocket";
import { updateSessionStorage } from "../utils/storageUtils";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const PlayerContext = React.createContext();

export const PlayerProvider = ({ children }) => {
  const location = window.location.pathname;
  const [loading, setLoading] = React.useState(true);
  const [socketId, setSocketId] = React.useState(null);

  const [Player, setPlayer] = React.useState(() => {
    const userData = sessionStorage.getItem("player");
    return userData ? JSON.parse(userData) : {};
  });

  // update or add a new property to the player object
  const updatePlayer = (newUser) => {
    setPlayer((prevUser) => {
      const updatedUser = {
        ...prevUser,
        ...newUser, // <- no filter here, apply directly
      };
      updateSessionStorage("player", updatedUser);
      return updatedUser;
    });
  };

  // delete property from the player object by there name
  const deletePlayerProperty = (propertyName) => {
    setPlayer((prevUser) => {
      const updatedUser = { ...prevUser };
      delete updatedUser[propertyName];
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
      // ✅ In case socket is already connected, ensure it's called
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
  React.useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("player"));
    if (userData && userData.name && userData.phone && userData.id) {
      updatePlayer(userData);
      setLoading(false);
    } else {
      const fetchUser = async () => {
        // setLoading(true);
        try {
          const res = await fetch(`${apiBaseUrl}/api/game/player`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
          // setLoading(false);
          const data = await res.json();

          if (res.status === 200 && data.data) {
            const { name, phone, _id: id, role } = data.data;
            updatePlayer({ name, phone, id, role });
          } else if (res.status === 400) {
            if (location == "/login" || location == "/register") {
              // Redirect to login page if user is not found
            } else {
              window.location.href = "/login";
            }
            console.error("User not found, redirecting to login page.");
          } else {
            console.error("Failed to fetch user:", data.message);
          }
        } catch (error) {
          console.error("Error fetching user:", error.message);
        } finally {
          // setLoading(false);
        }
      };

      fetchUser();
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        Player,
        updatePlayer,
        deletePlayerProperty,
        loading,
        setLoading,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
