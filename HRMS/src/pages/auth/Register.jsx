import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import { toast } from "react-toastify";

import CompanyLogo from "../../assets/logo/logo.png";
import {
  registerUser,
} from "../../redux/auth/authThunk";

const RegisterPage = () => {
  const dispatch =
    useDispatch();
  const navigate =
    useNavigate();

  const [formData,
    setFormData] =
    useState({
      employeeId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });

  const [formError,
    setFormError] =
    useState("");

  const {
    loading,
    error,
    isAuthenticated,
    user,
  } = useSelector(
    (state) => state.auth
  );

  const handleChange = (
    event
  ) => {
    setFormError("");
    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value,
    });
  };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (
      formData.password.length <
      6
    ) {
      setFormError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setFormError(
        "Passwords do not match."
      );
      return;
    }

    if (
      formData.phone.trim() &&
      !/^[6-9]\d{9}$/.test(
        formData.phone.trim()
      )
    ) {
      setFormError(
        "Phone number must be a valid Indian mobile number."
      );
      return;
    }

    dispatch(
      registerUser({
        employeeId:
          formData.employeeId.trim(),
        firstName:
          formData.firstName.trim(),
        lastName:
          formData.lastName.trim(),
        email:
          formData.email.trim(),
        phone:
          formData.phone.trim(),
        password:
          formData.password,
        role: "EMPLOYEE",
      })
    );
  };

  useEffect(() => {
    if (
      isAuthenticated &&
      user?.role ===
      "EMPLOYEE"
    ) {
      toast.success(
        "Registration successful"
      );
      navigate(
        "/employee/dashboard"
      );
    }
  }, [
    isAuthenticated,
    user,
    navigate,
  ]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="w-full min-h-screen overflow-auto bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl border border-gray-200 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <img
            src={
              CompanyLogo
            }
            alt="Logo"
            className="h-16 mb-4"
          />

          <h1 className="text-3xl font-bold text-gray-900">
            Employee
            registration
          </h1>

          <p className="mt-2 text-gray-500">
            Create your employee account to access attendance, leave, holidays, and profile tools.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                FIRST NAME
              </label>

              <input
                type="text"
                name="firstName"
                value={
                  formData.firstName
                }
                onChange={
                  handleChange
                }
                placeholder="Enter first name"
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                LAST NAME
              </label>

              <input
                type="text"
                name="lastName"
                value={
                  formData.lastName
                }
                onChange={
                  handleChange
                }
                placeholder="Enter last name"
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                required
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                EMPLOYEE ID
              </label>

              <input
                type="text"
                name="employeeId"
                value={
                  formData.employeeId
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. EMP001"
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PHONE (Optional)
              </label>

              <input
                type="tel"
                name="phone"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. 9876543210"
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              WORK EMAIL
            </label>

            <input
              type="email"
              name="email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              placeholder="Enter company email"
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg outline-none"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PASSWORD
              </label>

              <input
                type="password"
                name="password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                placeholder="Minimum 6 characters"
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                CONFIRM PASSWORD
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={
                  formData.confirmPassword
                }
                onChange={
                  handleChange
                }
                placeholder="Repeat password"
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                minLength={6}
                required
              />
            </div>
          </div>

          {formError ? (
            <p className="text-sm font-medium text-red-600">
              {formError}
            </p>
          ) : null}

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            New registrations are created as employee accounts only.
          </div>

          <button
            type="submit"
            disabled={
              loading
            }
            className="w-full h-12 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/"
              className="font-semibold text-gray-900 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
