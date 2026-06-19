import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import {
  RiLockPasswordLine,
  RiLockPasswordFill,
} from "react-icons/ri";
import LoginImage from "../../assets/images/loginImage.png";
import CompanyLogo from "../../assets/logo/logo.png";

import {
  loginUser,
} from "../../redux/auth/authThunk";

const LoginPage = () => {
  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [rememberMe,
    setRememberMe] =
    useState(() => {
      return Boolean(
        localStorage.getItem(
          "rememberEmail"
        )
      );
    });

  const [formData,
    setFormData] =
    useState(() => ({
      email:
        localStorage.getItem(
          "rememberEmail"
        ) || "",
      password: "",
    }));

  const {
    loading,
    error,
    isAuthenticated,
    user,
  } = useSelector(
    (state) => state.auth
  );

  /*
  |--------------------------------------------------------------------------
  | Handle Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (
    e
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Login Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (
    e
  ) => {
    e.preventDefault();

    if (
      rememberMe
    ) {
      localStorage.setItem(
        "rememberEmail",
        formData.email
      );
    } else {
      localStorage.removeItem(
        "rememberEmail"
      );
    }

    dispatch(
      loginUser(
        formData
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Success Login
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    localStorage.removeItem(
      "rememberPassword"
    );

  if (
    isAuthenticated &&
    user
  ) {
    toast.success(
      "Login successful"
    );

    setTimeout(() => {
      if (
        user.role === "HR"
      ) {
        navigate("/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    }, 2000);
  }
}, [
  isAuthenticated,
  user,
  navigate,
]);



  /*
  |--------------------------------------------------------------------------
  | Error Toast
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (error) {
      toast.error(
        error,
        {
          position:
            "top-right",
        }
      );
    }
  }, [error]);

  return (
    <div className="w-full h-screen overflow-auto bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex lg:flex-row flex-col items-center justify-between gap-12">

        <div className="hidden lg:flex w-1/2 justify-center">
          <img
            src={
              LoginImage
            }
            alt="HRMS"
            className="w-full max-w-lg object-contain"
          />
        </div>

        <div className="w-full lg:w-[400px] flex flex-col justify-center">

          <div className="mb-8">
            <img
              src={
                CompanyLogo
              }
              alt="Logo"
              className="h-16 mb-4"
            />

            <h1 className="text-3xl font-bold text-gray-900">
              Sign in to
              your account
            </h1>

            <p className="text-gray-500 mt-2">
              Welcome back!
              Please enter
              your details.
            </p>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                EMAIL
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
                placeholder="Enter Your Company Email"
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PASSWORD
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter Your Password"
                  className="w-full h-12 px-4 pr-12 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <RiLockPasswordLine
                      size={
                        20
                      }
                    />
                  ) : (
                    <RiLockPasswordFill
                      size={
                        20
                      }
                    />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2 cursor-pointer text-gray-600">

                <input
                  type="checkbox"
                  checked={
                    rememberMe
                  }
                  onChange={(
                    e
                  ) =>
                    setRememberMe(
                      e.target
                        .checked
                    )
                  }
                  className="w-4 h-4 accent-black"
                />

                Remember me
              </label>

              <button
                type="button"
                className="font-semibold text-gray-900 hover:underline"
              >
                Forgot Password?
              </button>

            </div>

            <button
              type="submit"
              disabled={
                loading
              }
              className="w-full h-12 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>

            <p className="text-center text-sm text-gray-600">
              New employee?{" "}
              <Link
                to="/register"
                className="font-semibold text-gray-900 hover:underline"
              >
                Register here
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
