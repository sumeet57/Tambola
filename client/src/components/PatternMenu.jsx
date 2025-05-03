import React, { useContext, useState } from "react";
import { GameContext } from "../context/GameContext";

const PatternMenu = () => {
  const { gameSettings, updateGameSettings } = useContext(GameContext);

  const patterns = [
    { id: "1", value: "Early Five", label: "Early Five" },
    { id: "2", value: "Middle no", label: "Middle no" },
    { id: "3", value: "Early Seven", label: "Early Seven" },
    { id: "4", value: "First Line", label: "First Line" },
    { id: "5", value: "Second Line", label: "Second Line" },
    { id: "6", value: "Third Line", label: "Third Line" },
    { id: "7", value: "Corner", label: "Corner" },
    { id: "8", value: "Full House", label: "Full House" },
  ];

  const handleChange = (e) => {
    const { id, checked } = e.target;

    if (checked) {
      updateGameSettings({
        pattern: [...gameSettings.pattern, { id, winners: 1 }], // Add with default winners: 1
      });
    } else {
      updateGameSettings({
        pattern: gameSettings.pattern.filter((p) => p.id !== id),
      });
    }
    console.log(gameSettings.pattern);
  };

  const handleWinnersChange = (id, winners) => {
    // Validate if winners is a positive integer
    if (winners < 0) {
      alert("Winners must be a positive integer.");
      return;
    }
    if (winners > 6) {
      alert("Winners must be less than 6.");
      return;
    }
    if (isNaN(winners)) {
      alert("Winners must be a number.");
      return;
    }
    if (winners % 1 !== 0) {
      alert("Winners must be an integer.");
      return;
    }
    // Update the winners for the selected pattern
    const updatedPattern = gameSettings.pattern.map((p) =>
      p.id === id ? { ...p, winners: Number(winners) } : p
    );
    updateGameSettings({ pattern: updatedPattern });
  };

  return (
    <>
      <h2 className="text-sm font-bold mb-2 text-gray-700">Select Pattern :</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 h-[150px] overflow-auto">
        {patterns.map((pattern) => (
          <label
            key={pattern.id}
            className="flex items-center p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 w-full"
          >
            <input
              checked={gameSettings.pattern.some((p) => p.id === pattern.id)}
              onChange={handleChange}
              type="checkbox"
              id={pattern.id}
              name="pattern"
              value={pattern.value}
              className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 mr-3"
              required
            />
            <span className="text-sm font-medium text-gray-800">
              {pattern.label}
            </span>
            {gameSettings.pattern.some((p) => p.id === pattern.id) && (
              <input
                type="number"
                value={
                  gameSettings.pattern.find((p) => p.id === pattern.id)?.winners
                }
                onChange={(e) =>
                  handleWinnersChange(pattern.id, e.target.value)
                }
                min="1"
                className="ml-2 w-16 border border-gray-300 rounded-md p-1 text-sm"
              />
            )}
          </label>
        ))}
      </div>
    </>
  );
};

export default PatternMenu;
