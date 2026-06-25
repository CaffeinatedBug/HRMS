import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  AlertCircle,
  User,
  BadgeCheck,
  Clock,
} from "lucide-react";

import BaseApiManager from "../../api/BaseApiManager";
import { EMPLOYEE } from "../../api/endpoints";
import { getErrorMessage } from "../../utils/helper";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AVATAR_COLORS = [
  "bg-blue-500",  "bg-purple-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500",   "bg-cyan-500",
  "bg-indigo-500","bg-orange-500",
];

const avatarColor = (id) =>
  AVATAR_COLORS[(id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

const getInitials = (firstName, lastName) =>
  `${(firstName?.[0] ?? "").toUpperCase()}${(lastName?.[0] ?? "").toUpperCase()}`;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const Avatar = ({ user }) => {
  const initials = getInitials(user.firstName, user.lastName);
  const color = avatarColor(user._id);

  if (user.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={initials}
        className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-md"
      />
    );
  }

  return (
    <div
      className={`h-20 w-20 ${color} flex shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white ring-4 ring-white shadow-md`}
    >
      {initials}
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
      <Icon size={14} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-gray-800 break-all">
        {value || "—"}
      </p>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-gray-400">
      {title}
    </h2>
    <div className="space-y-5">{children}</div>
  </section>
);

const SkeletonBlock = () => (
  <div className="animate-pulse space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 rounded-full bg-gray-200" />
      <div className="space-y-3">
        <div className="h-6 w-40 rounded bg-gray-200" />
        <div className="h-4 w-28 rounded bg-gray-200" />
        <div className="h-4 w-24 rounded bg-gray-200" />
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// EmployeeDetails
// ---------------------------------------------------------------------------

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await BaseApiManager.get(EMPLOYEE.DETAILS(id));
      // Response: { success, user: {} }
      const data = res?.user ?? res?.data ?? res;
      setEmployee(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Error ──────────────────────────────────────────────────────────────────

  if (!loading && error) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="font-semibold text-red-700">
              Could not load employee record
            </p>
          </div>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            onClick={load}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-20 rounded bg-gray-200 animate-pulse" />
        <SkeletonBlock />
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse space-y-3 rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="h-4 w-28 rounded bg-gray-200" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-16 rounded bg-gray-200" />
                    <div className="h-4 w-32 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!employee) return null;

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const statusColor =
    employee.status === "Inactive"
      ? "bg-gray-100 text-gray-500 border-gray-200"
      : "bg-green-50 text-green-700 border-green-200";
  const roleColor =
    employee.role === "HR"
      ? "bg-purple-50 text-purple-700 border-purple-200"
      : "bg-blue-50 text-blue-700 border-blue-200";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Employees
      </button>

      {/* Profile hero card */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar user={employee} />

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-950">{fullName}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {employee.designation || "No designation set"}
              {employee.department ? ` · ${employee.department}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusColor}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    employee.status === "Inactive" ? "bg-gray-400" : "bg-green-500"
                  }`}
                />
                {employee.status ?? "Active"}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${roleColor}`}
              >
                {employee.role === "HR" ? "HR Admin" : "Employee"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 font-mono text-xs text-gray-600">
                <BadgeCheck size={11} />
                {employee.employeeId}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Detail sections */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Contact information */}
        <Section title="Contact Information">
          <InfoRow icon={Mail} label="Email" value={employee.email} />
          <InfoRow icon={Phone} label="Phone" value={employee.phone} />
          <InfoRow icon={MapPin} label="Address" value={employee.address} />
        </Section>

        {/* Work information */}
        <Section title="Work Information">
          <InfoRow
            icon={Building2}
            label="Department"
            value={employee.department}
          />
          <InfoRow
            icon={Briefcase}
            label="Designation"
            value={employee.designation}
          />
          <InfoRow
            icon={Calendar}
            label="Joining Date"
            value={
              employee.joiningDate
                ? dayjs(employee.joiningDate).format("DD MMMM YYYY")
                : null
            }
          />
        </Section>

        {/* Personal information */}
        <Section title="Personal Information">
          <InfoRow
            icon={User}
            label="Gender"
            value={employee.gender}
          />
          <InfoRow
            icon={Calendar}
            label="Date of Birth"
            value={
              employee.dob
                ? dayjs(employee.dob).format("DD MMMM YYYY")
                : null
            }
          />
        </Section>

        {/* Account information */}
        <Section title="Account Information">
          <InfoRow
            icon={Clock}
            label="Last Login"
            value={
              employee.lastLogin
                ? dayjs(employee.lastLogin).format("DD MMM YYYY, hh:mm A")
                : "Never"
            }
          />
          <InfoRow
            icon={Calendar}
            label="Account Created"
            value={
              employee.createdAt
                ? dayjs(employee.createdAt).format("DD MMMM YYYY")
                : null
            }
          />
        </Section>
      </div>
    </div>
  );
};

export default EmployeeDetails;
