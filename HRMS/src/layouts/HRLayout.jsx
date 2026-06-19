import {
  Outlet,
  Link,
  useNavigate,
} from "react-router-dom";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import {
  logoutUser,
} from "../redux/auth/authThunk";

const HRLayout = () => {
  const dispatch =
    useDispatch();
  const navigate =
    useNavigate();
  const { user } =
    useSelector(
      (state) => state.auth
    );

  const handleLogout =
    async () => {
      await dispatch(
        logoutUser()
      );
      navigate("/");
    };

  return (
    <div className="flex min-h-screen">

      <aside className="w-64 bg-black text-white p-5">
        <div className="mb-5 space-y-2">
          <h2 className="text-xl font-bold">
            HR Panel
          </h2>

          <p className="text-sm text-white/70">
            {user?.firstName
              ? `${user.firstName} ${user.lastName || ""}`.trim()
              : "HR user"}
          </p>
        </div>

        <nav className="space-y-3">
          <Link
            to="/dashboard"
            className="block"
          >
            Dashboard
          </Link>

          <Link
            to="/employees"
            className="block"
          >
            Employees
          </Link>

          <Link
            to="/leave-management"
            className="block"
          >
            Leave Management
          </Link>

          <Link
            to="/holidays"
            className="block"
          >
            Holidays
          </Link>

          <Link
            to="/salary"
            className="block"
          >
            Salary
          </Link>

          <Link
            to="/notifications"
            className="block"
          >
            Notifications
          </Link>

          <Link
            to="/reports"
            className="block"
          >
            Reports
          </Link>
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 inline-flex h-10 w-full items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default HRLayout;
