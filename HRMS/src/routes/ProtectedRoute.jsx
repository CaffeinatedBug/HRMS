import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/common/Loader";

const ProtectedRoute = ({
  children,
  role,
}) => {
  const {
    initialized,
    loading,
    isAuthenticated,
    user,
  } = useSelector(
    (state) => state.auth
  );

  const location = useLocation();

  if (
    !initialized &&
    loading
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <Loader label="Restoring your session" />
      </main>
    );
  }

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

  /*
  |--------------------------------------------------------------------------
  | DOB Wall — Option B
  |
  | If an EMPLOYEE has no DOB set, redirect to /complete-profile.
  | This blocks all protected routes until DOB is provided.
  | HR accounts are exempt (managed by system administrators).
  |--------------------------------------------------------------------------
  */

  if (
    user?.role === "EMPLOYEE" &&
    !user?.dob &&
    location.pathname !== "/complete-profile"
  ) {
    return (
      <Navigate
        to="/complete-profile"
        replace
      />
    );
  }

  if (
    location.pathname === "/complete-profile" &&
    user?.dob
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
