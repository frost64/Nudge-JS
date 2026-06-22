import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function AdminRoute({ children }) {

  const { token, user } =
    useContext(AuthContext);

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
      />
    );
  }

  return children;
}

export default AdminRoute;