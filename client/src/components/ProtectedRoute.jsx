import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { Player, loading } = useContext(PlayerContext);

  // If player is still null after loading - not logged in
  if (!Player) return <Navigate to="/auth" replace />;

  // If role not allowed - unauthorized
  if (!allowedRoles.includes(Player.role))
    return <Navigate to="/unauthorized" replace />;

  // Otherwise - allowed
  return children;
};

export default ProtectedRoute;
