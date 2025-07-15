import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GameOver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const claimData = location.state?.claimData;
  const [parsedData, setParsedData] = useState([]);
  
  useEffect(() => {
    if (!claimData || claimData.length === 0) {
      setParsedData([]);
      return;
    }

    const transformedData = claimData.reduce((acc, claim) => {

      if (!claim || !claim.player || !claim.pattern || !claim.player.name || !claim.player.phone) {

        console.warn("Skipping malformed claim:", claim);
        return acc;
      }


      const playerKey = `${claim.player.name}-${claim.player.phone}`;

      let existingPlayerEntry = acc.find(
        (entry) => `${entry.player.name}-${entry.player.phone}` === playerKey
      );

      if (existingPlayerEntry) {
      
        const existingPattern = existingPlayerEntry.pattern.find(
          (p) => p.name === claim.pattern
        );

        if (existingPattern) {
          
          existingPattern.count += 1;
        } else {
         
          existingPlayerEntry.pattern.push({ name: claim.pattern, count: 1 });
        }
      } else {
        
        acc.push({
          player: {
            name: claim.player.name,
            phone: claim.player.phone, 
  
          },
          pattern: [{ name: claim.pattern, count: 1 }],
        });
      }
      return acc;
    }, []);

    setParsedData(transformedData);
  }, [claimData]); 

  useEffect(() => {
    const timer = setTimeout(() => {
      // navigate("/");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 to-purple-300 p-1">
        <div className="leaderboard w-full max-w-2xl bg-white rounded-lg shadow-xl p-3 md:p-5">
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800 md:text-4xl">Game Over</h1>
          <h2 className="text-xl font-semibold mb-4 text-center text-gray-700 md:text-2xl">🎊 Winners 🎊</h2>
          <div className="overflow-x-auto max-h-[50vh] overflow-y-auto custom-scrollbar">

            {parsedData.length > 0 ? (
              parsedData.map((data, index) => (
                // --- Start of Compact Player Card Styling ---
                <div
                  key={index}
                  className="mb-1 p-1 border border-gray-400 rounded-md bg-white shadow-sm transition-all duration-200 ease-in-out hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-between mb-1">
                    <span>{data.player.name} <span className="text-sm font-normal text-gray-700"> - {data.player.phone}</span></span>
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-0.5"> {/* Reduced spacing and font size */}
                    {data.pattern.map((p, pIndex) => (
                      <li key={pIndex} className="flex justify-between items-center border-b-2 border-gray-300">
                        <span className="font-normal">{p.name}</span>
                        <span className="font-medium text-blue-600 ml-2">{p.count} claims</span> {/* Use ml-2 for spacing */}
                      </li>
                    ))}
                  </ul>
                </div>
                // --- End of Compact Player Card Styling ---
              ))
            ) : (
              <p className="text-center text-gray-600 py-8">No claim data to display.</p>
            )}

          </div>
          <div className="flex justify-center mt-6">
            <button 
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameOver;
