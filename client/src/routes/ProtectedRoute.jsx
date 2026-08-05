import { useContext } from "react";
import { Navigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

/**
 * Protects routes that require authentication.
 */
function ProtectedRoute({ children }) {
  const { token, user } =
    useContext(AuthContext);

  if (!token) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // Prevent redirect flicker while auth state initializes.
  if (user === undefined) {
    return null;
  }

  return children;
}

export default ProtectedRoute;