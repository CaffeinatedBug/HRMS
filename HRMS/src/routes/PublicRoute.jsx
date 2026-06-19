import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/common/Loader";

const PublicRoute = ({ children }) => {
  const {
    initialized,
    loading,
    isAuthenticated,
    user,
  } =
    useSelector(
      (state) => state.auth
    );

  if (
    !initialized &&
    loading
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <Loader label="Checking account access" />
      </main>
    );
  }

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
