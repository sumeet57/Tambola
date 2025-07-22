import React from "react";

export const GameContext = React.createContext();

export const GameContextProvider = ({ children }) => {
  // This context will hold the game settings and state (creating or joining a game)
  const [gameSettings, setGameSettings] = React.useState({
    roomId: "",
    pattern: [],
    isScheduled: false,
    schedule: null,
  });

  // This context will hold the current game state
  const [gameState, setGameState] = React.useState({
    publicId: "",
    name: "",
    ticketCount: 1,
    roomid: "",
    pattern: [],
    assign_numbers: [],
    claim: [],
    drawnNumbers: [],
  });

  // Function to update game settings and state
  const updateGameSettings = (newSettings) => {
    setGameSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  // Function to update game state
  const updateGameState = (newState) => {
    setGameState((prevState) => ({
      ...prevState,
      ...newState,
    }));
  };

  return (
    <GameContext.Provider
      value={{ gameSettings, updateGameSettings, gameState, updateGameState }}
    >
      {children}
    </GameContext.Provider>
  );
};
