import React from "react";
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
        ...Object.fromEntries(
          Object.entries(newUser).filter(([_, value]) => value !== "")
        ),
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
      console.log(`Connected with ID: ${socket.id}`);
      setSocketId(socket.id);
      localStorage.setItem("socketid", socket.id);
      updatePlayer({ socketId: socket.id });
      setLoading(false);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      setLoading(true);
    }

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, []);

  // Load user from sessionStorage or server
  React.useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("player"));
    // console.log("User data from sessionStorage:", userData);
    if (userData && userData.name && userData.phone && userData.id) {
      updatePlayer(userData);
      setLoading(false);
    } else {
      const fetchUser = async () => {
        try {
          const res = await fetch(`${apiBaseUrl}/api/game/player`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

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
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{ Player, updatePlayer, deletePlayerProperty, loading }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
