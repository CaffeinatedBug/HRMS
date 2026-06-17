import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } =
    useSelector(
      (state) => state.auth
    );

  if (isAuthenticated) {
    const redirectTo =
      user?.role === "HR"
        ? "/dashboard"
        : "/employee/dashboard";

    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );
  }

  return children;
};

export default PublicRoute;
