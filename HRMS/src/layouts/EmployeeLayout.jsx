import {
  Outlet,
  Link,
} from "react-router-dom";

const EmployeeLayout = () => {
  return (
    <div className="flex min-h-screen">

      <aside className="w-64 bg-blue-900 text-white p-5">
        <h2 className="text-xl font-bold mb-5">
          Employee Panel
        </h2>

        <nav className="space-y-3">
          <Link
            to="/employee/dashboard"
            className="block"
          >
            Dashboard
          </Link>

          <Link
            to="/attendance"
            className="block"
          >
            Attendance
          </Link>

          <Link
            to="/my-leaves"
            className="block"
          >
            My Leaves
          </Link>

          <Link
            to="/apply-leave"
            className="block"
          >
            Apply Leave
          </Link>

          <Link
            to="/profile"
            className="block"
          >
            Profile
          </Link>

          <Link
            to="/employee/holidays"
            className="block"
          >
            Holidays
          </Link>

          <Link
            to="/employee/notifications"
            className="block"
          >
            Notifications
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout;
