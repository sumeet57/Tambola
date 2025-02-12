import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  useEffect(() => {
    const handleStorageUpdate = () => {
      const playerData = JSON.parse(sessionStorage.getItem("player"));
      setPlayer(playerData);
    };
    // Listen for custom event
    window.addEventListener("sessionStorageUpdated", handleStorageUpdate);

    // Initial fetch from sessionStorage
    handleStorageUpdate();
    return () => {
      window.removeEventListener("sessionStorageUpdated", handleStorageUpdate);
    };
  }, []);

  return (
    <>
      <nav className="w-full py-3 flex justify-between items-center p-4 bg-gray-100 fixed">
        <div className="text-xl font-bold">Tambola</div>
        <div className="flex items-center space-x-2">
          {player ? (
            <div className="bg-blue-500 text-white px-4 py-2 rounded">
              Points : {player?.points || 0}
            </div>
          ) : (
            <>""</>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
