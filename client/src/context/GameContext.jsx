import React from "react";

export const GameContext = React.createContext();

export const GameContextProvider = ({ children }) => {
  const [gameSettings, setGameSettings] = React.useState({
    roomId: "",
    pattern: [],
    isScheduled: false,
    schedule: null,
  });

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

  const updateGameSettings = (newSettings) => {
    setGameSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
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
