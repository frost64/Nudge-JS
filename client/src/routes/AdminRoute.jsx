import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

import { AuthContext } from "../context/AuthContext";

/**
 * Protects routes that require administrator access.
 */
function AdminRoute({ children }) {
  const { token, user } =
    useContext(AuthContext);

  const isAdmin =
    user?.role === "admin";

  useEffect(() => {
    if (
      token &&
      user &&
      !isAdmin
    ) {
      toast.error(
        "You are not authorized to access this page.",
        {
          id: "admin-access-denied",
        }
      );
    }
  }, [
    token,
    user,
    isAdmin,
  ]);

  if (!token) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

export default AdminRoute;