import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({
  children,
  role,
}) => {
  const {
    isAuthenticated,
    user,
  } = useSelector(
    (state) => state.auth
  );

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (
    role &&
    user?.role !== role
  ) {
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

export default ProtectedRoute;
