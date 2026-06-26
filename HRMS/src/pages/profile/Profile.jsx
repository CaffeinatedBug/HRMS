import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { Mail, Phone, MapPin, Briefcase, User, Save, AlertCircle, Calendar, Hash, Lock } from "lucide-react";
import BaseApiManager from "../../api/BaseApiManager";
import { EMPLOYEE } from "../../api/endpoints";
import { getProfile } from "../../redux/auth/authThunk";
import { getErrorMessage } from "../../utils/helper";

// ---------------------------------------------------------------------------
// Constants
// Only phone, address, and gender are employee-editable.
// First name, last name, and designation are set by HR and shown read-only.
// ---------------------------------------------------------------------------

const EDITABLE_FIELDS = [
  { name: "phone",   label: "Phone",   icon: Phone,  type: "tel" },
  { name: "address", label: "Address", icon: MapPin,  type: "text" },
];

const GENDER_OPTIONS = ["Male", "Female", "Other"];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const Avatar = ({ name }) => {
  const initials = (name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
      {initials}
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
    <Icon size={15} className="shrink-0 text-gray-400" />
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-800">{value || "—"}</p>
    </div>
  </div>
);

const ReadOnlyField = ({ icon: Icon, label, value }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-gray-500">{label}</label>
    <div className="relative">
      <Icon
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
      />
      <input
        type="text"
        value={value || "—"}
        readOnly
        tabIndex={-1}
        className="w-full cursor-not-allowed rounded-lg border border-gray-100 bg-gray-100 py-3 pl-9 pr-4 text-sm text-gray-400 outline-none"
      />
    </div>
    <p className="mt-1 text-xs text-gray-400">Set by HR — not editable</p>
  </div>
);

// ---------------------------------------------------------------------------
// Profile Page
// ---------------------------------------------------------------------------

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ phone: "", address: "", gender: "", dob: "" });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        phone:   user.phone   ?? "",
        address: user.address ?? "",
        gender:  user.gender  ?? "",
        // Only pre-fill dob in state if NOT yet set (first-time entry)
        dob: user.dob ? "" : "",
      });
    }
  }, [user]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccessMessage("");
    setErrorMessage("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const payload = { ...form };

      // Only send dob when it's being set for the first time
      if (user?.dob) {
        delete payload.dob; // locked — don't send, backend would reject anyway
      } else if (!payload.dob) {
        delete payload.dob; // not provided — skip
      }

      const res = await BaseApiManager.put(EMPLOYEE.UPDATE_PROFILE, payload);
      setSuccessMessage(res?.message ?? "Profile updated successfully!");
      dispatch(getProfile());
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-950">My Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          View your employee information and update your contact details.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left: read-only info card ── */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Avatar name={fullName} />
            <h2 className="mt-4 text-lg font-bold text-gray-950">{fullName}</h2>
            <p className="text-sm text-gray-500">{user.designation || "Employee"}</p>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                user.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.status ?? "Active"}
            </span>
          </div>

          <div className="mt-6 space-y-2">
            <InfoRow icon={Mail}      label="Email"       value={user.email} />
            <InfoRow icon={Hash}      label="Employee ID" value={user.employeeId} />
            <InfoRow icon={Briefcase} label="Designation" value={user.designation} />
            <InfoRow
              icon={Calendar}
              label="Joined"
              value={user.joiningDate ? dayjs(user.joiningDate).format("DD MMM YYYY") : "—"}
            />
            <InfoRow
              icon={user.dob ? Lock : Calendar}
              label="Date of Birth"
              value={user.dob ? dayjs(user.dob).format("DD MMM YYYY") : "Not set"}
            />
          </div>
        </section>

        {/* ── Right: editable form ── */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-1 text-lg font-semibold text-gray-950">Edit Personal Details</h3>
          <p className="mb-6 text-sm text-gray-500">
            Name and designation are managed by HR and cannot be changed here.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Read-only fields */}
              <ReadOnlyField icon={User}      label="First Name"   value={user.firstName} />
              <ReadOnlyField icon={User}      label="Last Name"    value={user.lastName} />
              <ReadOnlyField icon={Briefcase} label="Designation"  value={user.designation} />

              {/* Editable fields */}
              {EDITABLE_FIELDS.map(({ name, label, icon: Icon, type }) => (
                <div key={name}>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {label}
                  </label>
                  <div className="relative">
                    <Icon
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id={name}
                      type={type}
                      name={name}
                      value={form[name] ?? ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-9 pr-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              ))}

              {/* Gender select */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender ?? ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* DOB — one-time editable, locked after first save */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  Date of Birth
                  {user.dob && <Lock size={12} className="text-gray-400" />}
                </label>

                {user.dob ? (
                  // Already set — show locked read-only
                  <div>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-100 px-4 py-3 text-sm text-gray-400">
                      <Lock size={14} />
                      <span>{dayjs(user.dob).format("DD MMMM YYYY")}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      DOB is locked. Contact HR to request a change.
                    </p>
                  </div>
                ) : (
                  // Not yet set — one-time editable
                  <div>
                    <input
                      id="dob"
                      type="date"
                      name="dob"
                      value={form.dob ?? ""}
                      onChange={handleChange}
                      max={new Date(Date.now() - 16 * 365.25 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <p className="mt-1 text-xs text-amber-600 font-medium">
                      ⚠ Once saved, DOB cannot be changed without HR approval.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {successMessage && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-sm font-medium text-red-700">{errorMessage}</p>
              </div>
            )}

            <button
              id="save-profile-btn"
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile;
