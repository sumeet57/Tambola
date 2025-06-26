import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { PlayerContext } from "../context/PlayerContext";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // room ID from route

  const { Player } = useContext(PlayerContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/api/game/rooms`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        setLoading(false);
        const data = await response.json();
        if (response.status === 200) {
          setRooms(data.rooms || []);
        } else {
          console.error("Error fetching rooms:", data.message);
        }
      } catch (error) {
        setLoading(false);
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    if (!Player || Player.role !== "host") {
      navigate("/auth");
    }
  }, []);

  if (id) {
    // Detail page logic
    const selectedRoom = rooms.find((r) => r.roomid === id);

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-center text-indigo-700">
            🧾 Room Details - {id}
          </h1>

          {/* CLAIM DATA */}
          {selectedRoom?.claimData.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                🎯 Claim Data
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded shadow">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 border">Player Name</th>
                      <th className="px-4 py-2 border">Phone</th>
                      <th className="px-4 py-2 border">Pattern</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRoom?.claimData.map((claim, index) => (
                      <tr key={claim?._id || index}>
                        <td className="px-4 py-2 border text-center">
                          {claim?.player?.name}
                        </td>
                        <td className="px-4 py-2 border text-center">
                          {claim?.player?.phone}
                        </td>
                        <td className="px-4 py-2 border text-center capitalize">
                          {claim?.pattern}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ROOM INFO */}
          <div className="bg-white p-4 rounded shadow border">
            <p className="text-gray-700 mb-1">
              <strong>Status:</strong>{" "}
              <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {selectedRoom?.isOngoing ? "Ongoing" : ""}
              </span>{" "}
              {selectedRoom?.isCompleted && (
                <span className="text-sm px-2 py-1 ml-2 bg-green-100 text-green-700 rounded">
                  Completed
                </span>
              )}
            </p>
            {selectedRoom?.finishTime && (
              <p className="text-gray-700">
                <strong>Finish Time:</strong> {selectedRoom.finishTime}
              </p>
            )}
          </div>

          {/* PLAYER DATA */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              👥 Players
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded shadow">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">Name</th>
                    <th className="px-4 py-2 border">Phone</th>
                    <th className="px-4 py-2 border">Tickets</th>
                    <th className="px-4 py-2 border">Claims</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRoom?.players.map((player) => (
                    <tr key={player?._id}>
                      <td className="px-4 py-2 border text-center">
                        {player?._id}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {player?.name}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {player?.phone}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {player?.ticketCount}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {player?.claims.length > 0
                          ? player?.claims.map((c, i) => (
                              <span
                                key={i}
                                className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded mr-1 text-sm inline-block"
                              >
                                {c}
                              </span>
                            ))
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ⬅️ Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default dashboard (room list)
  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-4xl mx-auto pt-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
          🏠 Room Dashboard
        </h1>

        {rooms.length === 0 ? (
          <div className="text-center text-gray-500">No rooms available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <div
                key={room.roomid}
                onClick={() => navigate(`/dashboard/${room.roomid}`)}
                className="bg-white cursor-pointer shadow-md rounded-lg p-5 border border-gray-200 hover:shadow-lg transition duration-300"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Room ID: <span className="text-blue-600">{room.roomid}</span>
                </h2>
                <p className="text-gray-600 inline mr-4">
                  Total Players:{" "}
                  <span className="font-medium text-green-600">
                    {room.players.length}
                  </span>
                </p>
                <p className="text-gray-600 inline mr-4">
                  Patterns:{" "}
                  <span className="font-medium text-green-600">
                    {room.settings.patterns.length}
                  </span>
                </p>
                <button
                  onClick={() => navigate(`/dashboard/${room.roomid}`)}
                  className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
                >
                  view details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
