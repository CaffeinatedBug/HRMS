import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CalendarDays, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import BaseApiManager from "../../api/BaseApiManager";
import { getProfile } from "../../redux/auth/authThunk";
import { getErrorMessage } from "../../utils/helper";
import CompanyLogo from "../../assets/logo/logo.png";

/*
|--------------------------------------------------------------------------
| CompleteProfile
|
| Full-screen wall shown to employees who logged in before DOB was required.
| They cannot access any dashboard route until they submit their DOB here.
| After submission, getProfile() refreshes Redux state and ProtectedRoute
| allows them through automatically.
|--------------------------------------------------------------------------
*/

const CompleteProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Max allowed DOB — must be at least 16 years old
  const maxDate = new Date(Date.now() - 16 * 365.25 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!dob) {
      setError("Please select your date of birth.");
      return;
    }

    const dobDate = new Date(dob);
    if (dobDate >= new Date()) {
      setError("Date of birth must be in the past.");
      return;
    }

    setLoading(true);
    try {
      await BaseApiManager.post("/users/complete-profile", { dob });
      setSuccess(true);

      // Refresh Redux auth state → ProtectedRoute will re-evaluate
      // and let the user through once dob is populated
      await dispatch(getProfile());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.firstName ?? "there";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <img src={CompanyLogo} alt="Logo" className="mx-auto mb-5 h-14" />
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CalendarDays size={28} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-950">
            One last step, {firstName}!
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            We need your date of birth to complete your employee profile and
            enable the birthday notification system.
          </p>
        </div>

        {/* Why we need it */}
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3.5 text-sm text-blue-800">
          <div className="flex gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold">Why is this required?</p>
              <p className="mt-0.5 text-blue-700">
                DOB is used for the company birthday notification system and HR
                records. It will be <strong>locked after submission</strong> —
                contact HR for any future changes.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="dob-input"
              className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700"
            >
              Date of Birth
              <Lock size={12} className="text-gray-400" />
            </label>

            <input
              id="dob-input"
              type="date"
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                setError("");
              }}
              max={maxDate}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
            <p className="mt-1 text-xs text-amber-600 font-medium">
              ⚠ This cannot be changed after saving without HR approval.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              ✅ Profile completed! Redirecting you to your dashboard…
            </div>
          )}

          <button
            id="complete-profile-btn"
            type="submit"
            disabled={loading || success}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving…
              </>
            ) : (
              "Save & Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
