import { Clock, AlertCircle, UserCheck, Calendar } from "lucide-react";

// ---------------------------------------------------------------------------
// AttendanceSummary
//
// Props:
//   data     {object | null}   Attendance summary data from HR dashboard
//   loading  {boolean}
// ---------------------------------------------------------------------------

const StatPill = ({ label, value, colorClass, icon: Icon }) => (
  <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${colorClass}`}>
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/60">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-2xl font-bold leading-none">{value ?? 0}</p>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest opacity-70">
        {label}
      </p>
    </div>
  </div>
);

const SkeletonPill = () => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
      <div className="space-y-2 flex-1">
        <div className="h-5 w-12 rounded bg-gray-200 animate-pulse" />
        <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  </div>
);

const AttendanceSummary = ({ data, loading = false }) => {
  const summary = data?.attendanceSummary ?? data ?? null;

  const stats = [
    {
      label: "Present Today",
      value: summary?.presentToday ?? summary?.todayAttendance ?? 0,
      colorClass: "border-green-200 bg-green-50 text-green-800",
      icon: UserCheck,
    },
    {
      label: "Late Arrivals",
      value: summary?.lateArrivals ?? 0,
      colorClass: "border-yellow-200 bg-yellow-50 text-yellow-800",
      icon: Clock,
    },
    {
      label: "Missing Punch-outs",
      value: summary?.missingPunchOuts ?? summary?.missedPunchOuts ?? 0,
      colorClass: "border-orange-200 bg-orange-50 text-orange-800",
      icon: AlertCircle,
    },
    {
      label: "Monthly Present",
      value: summary?.monthlyPresent ?? summary?.presentThisMonth ?? 0,
      colorClass: "border-blue-200 bg-blue-50 text-blue-800",
      icon: Calendar,
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-950">
            Attendance Summary
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Daily and monthly attendance at a glance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonPill key={i} />)
          : stats.map((s) => <StatPill key={s.label} {...s} />)}
      </div>
    </section>
  );
};

export default AttendanceSummary;
