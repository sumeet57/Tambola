import React, { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { toast } from "react-toastify";

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
  };

  const handleWinnersChange = (id, winners) => {
    const numWinners = Number(winners);

    if (numWinners < 0) {
      toast.warning("Winners must be a positive number.");
      return;
    }
    if (numWinners > 6) {
      toast.warning("Winners cannot be more than 6.");
      return;
    }
    if (isNaN(numWinners) || numWinners % 1 !== 0) {
      toast.warning("Winners must be an integer.");
      return;
    }

    const updatedPattern = gameSettings.pattern.map((p) =>
      p.id === id ? { ...p, winners: numWinners } : p
    );
    updateGameSettings({ pattern: updatedPattern });
  };

  return (
    <div className="bg-white p-1 rounded-lg border border-gray-400 shadow-md">
      <h2 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 text-center">
        Select Patterns
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto max-h-[300px] pr-1">
        {" "}
        {/* Adjusted grid and gap */}
        {patterns.length > 0 ? (
          patterns.map((pattern) => (
            <label
              key={pattern.id}
              className={`
                flex items-center p-2 rounded border text-sm
                ${
                  gameSettings.pattern.some((p) => p.id === pattern.id)
                    ? "border-blue-500 bg-blue-50 text-blue-800 font-semibold" // Highlight selected
                    : "border-gray-200 bg-white hover:bg-gray-100 text-gray-700" // Default and hover
                }
                cursor-pointer transition-all duration-200 justify-between
              `}
            >
              {/* Checkbox and Label */}
              <div className="flex items-center flex-grow">
                <input
                  checked={gameSettings.pattern.some(
                    (p) => p.id === pattern.id
                  )} // Default checked for Early Five and Middle no
                  onChange={handleChange}
                  type="checkbox"
                  id={pattern.id}
                  name="pattern"
                  value={pattern.value}
                  className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2 flex-shrink-0" // Smaller checkbox
                />
                <span className="truncate">
                  {" "}
                  {/* Truncate long labels */}
                  {pattern.label}
                </span>
              </div>

              {/* Winners Input */}
              {gameSettings.pattern.some((p) => p.id === pattern.id) && (
                <div className="ml-2 flex-shrink-0">
                  {" "}
                  {/* Adjusted margin for input */}
                  <input
                    type="number"
                    id={`winners-${pattern.id}`}
                    value={
                      gameSettings.pattern.find((p) => p.id === pattern.id)
                        ?.winners || ""
                    }
                    onChange={(e) =>
                      handleWinnersChange(pattern.id, e.target.value)
                    }
                    min="1"
                    className="w-16 border border-gray-300 rounded-md p-1 text-sm text-center focus:border-blue-500 focus:ring-blue-500 outline-none" // Smaller, centered input
                    placeholder="W" // Placeholder for winner count
                  />
                </div>
              )}
            </label>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 py-6">
            No patterns available.
          </p>
        )}
      </div>
    </div>
  );
};

export default PatternMenu;
