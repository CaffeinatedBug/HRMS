import {
  Outlet,
  Link,
} from "react-router-dom";

const HRLayout = () => {
  return (
    <div className="flex min-h-screen">

      <aside className="w-64 bg-black text-white p-5">
        <h2 className="text-xl font-bold mb-5">
          HR Panel
        </h2>

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
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default HRLayout;
