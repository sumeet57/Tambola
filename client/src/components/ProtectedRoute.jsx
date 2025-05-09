import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { Player } = useContext(PlayerContext);

  if (!Player) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(Player.role))
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
