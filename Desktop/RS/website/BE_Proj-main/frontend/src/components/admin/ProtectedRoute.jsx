import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);

  // While persisted state is still loading, user could briefly be null.
  // We check after rehydration — PersistGate in main.jsx handles the wait.
  if (user === null) {
    // Not logged in → go home
    return <Navigate to="/" replace />;
  }

  if (user.role !== "admin") {
    // Logged in but not admin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
