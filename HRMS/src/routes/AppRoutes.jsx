import {
  Routes,
  Route,
} from "react-router-dom";

import LoginPage from "../pages/auth/Login";
import RegisterPage from "../pages/auth/Register";

import HRLayout from "../layouts/HRLayout";
import EmployeeLayout from "../layouts/EmployeeLayout";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

/* Pages */
import Dashboard from "../pages/dashboard/Dashboard";
import Attendance from "../pages/attendance/Attendance";
import MonthlyAttendance from "../pages/attendance/MonthlyAttendance";
import EmployeeDashboard from "../pages/dashboard/EmployeeDashboard";
import EmployeeList from "../pages/employees/EmployeeList";
import AddEmployee from "../pages/employees/AddEmployee";
import EmployeeDetails from "../pages/employees/EmployeeDetails";
import AllLeaves from "../pages/leave/AllLeaves";
import MyLeaves from "../pages/leave/MyLeaves";
import ApplyLeave from "../pages/leave/ApplyLeave";
import Holidays from "../pages/holiday/Holidays";
import SalaryList from "../pages/salary/SalaryList";
import SalaryDetails from "../pages/salary/SalaryDetails";
import Notifications from "../pages/notifications/Notifications";
import Profile from "../pages/profile/Profile";
import Reports from "../pages/reports/Reports";
import Birthdays from "../pages/birthdays/Birthdays";
import CompleteProfile from "../pages/auth/CompleteProfile";
import NotFound from "../pages/not-found/NotFound";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Login */}

      <Route
        path="/"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* DOB Wall — shown to employees who logged in before DOB was required */}

      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* HR Routes */}

      <Route
        element={
          <ProtectedRoute role="HR">
            <HRLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/employees"
          element={<EmployeeList />}
        />

        <Route
          path="/employees/add"
          element={<AddEmployee />}
        />

        <Route
          path="/employees/:id"
          element={<EmployeeDetails />}
        />

        <Route
          path="/leave-management"
          element={<AllLeaves />}
        />

        <Route
          path="/holidays"
          element={<Holidays />}
        />

        <Route
          path="/salary"
          element={<SalaryList />}
        />

        <Route
          path="/salary/:id"
          element={<SalaryDetails />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />
      </Route>

      {/* Employee Routes */}

      <Route
        element={
          <ProtectedRoute role="EMPLOYEE">
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/employee/dashboard"
          element={<EmployeeDashboard />}
        />

        <Route
          path="/attendance"
          element={<Attendance />}
        />

        <Route
          path="/attendance/monthly"
          element={<MonthlyAttendance />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/my-leaves"
          element={<MyLeaves />}
        />

        <Route
          path="/apply-leave"
          element={<ApplyLeave />}
        />


        <Route
          path="/employee/holidays"
          element={<Holidays />}
        />

        <Route
          path="/employee/notifications"
          element={<Notifications />}
        />


        <Route
          path="/employee/birthdays"
          element={<Birthdays />}
        />
      </Route>

      {/* 404 */}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
};

export default AppRoutes;
