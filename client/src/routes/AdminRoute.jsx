import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

function AdminRoute({ children }) {
  const { token, user } =
    useContext(AuthContext);

  useEffect(() => {
    if (token && user && user.role !== "admin") {
      toast.error(
        "You are not authorized to access this page."
      );
    }
  }, [token, user]);

  if (!token) {
    return <Navigate to="/" />;
  }

  if (
    !user ||
    user.role !== "admin"
  ) {
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