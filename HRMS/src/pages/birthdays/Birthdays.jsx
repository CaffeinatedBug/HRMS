import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  Cake,
  PartyPopper,
  CalendarDays,
  Gift,
  Users,
  AlertCircle,
} from "lucide-react";
import { fetchAllEmployees } from "../../services/birthdayService";
import {
  isBirthdayToday,
  daysUntilBirthday,
  turningAge,
  birthdaysWithinDays,
  sortByUpcomingBirthday,
} from "../../utils/birthdayUtils";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Avatar circle with initials and an optional confetti ring for today's birthdays.
 */
const BirthdayAvatar = ({ name, isToday }) => {
  const initials = (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
        isToday
          ? "bg-gradient-to-br from-pink-500 to-orange-400 ring-4 ring-pink-200"
          : "bg-gradient-to-br from-blue-500 to-indigo-500"
      }`}
    >
      {initials}
      {isToday && (
        <span className="absolute -right-1 -top-1 text-base">🎂</span>
      )}
    </div>
  );
};

/**
 * Countdown badge — shows "Today!", "Tomorrow", or "In N days".
 */
const CountdownBadge = ({ daysUntil }) => {
  if (daysUntil === 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-700">
        <PartyPopper size={12} />
        Today! 🎉
      </span>
    );
  if (daysUntil === 1)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
        <Cake size={12} />
        Tomorrow
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
      <CalendarDays size={12} />
      In {daysUntil} days
    </span>
  );
};

/**
 * Single birthday card row.
 */
const BirthdayCard = ({ person, isSelf }) => {
  const daysUntil = daysUntilBirthday(person.dob);
  const isToday = daysUntil === 0;
  const age = turningAge(person.dob);
  const fullName = `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();
  const dobFormatted = dayjs(person.dob).format("DD MMMM");

  return (
    <article
      className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 transition-shadow hover:shadow-md ${
        isToday
          ? "border-pink-200 bg-gradient-to-r from-pink-50 to-orange-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-4">
        <BirthdayAvatar name={fullName} isToday={isToday} />
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">{fullName}</p>
            {isSelf && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                You
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {person.designation || "Employee"} — Birthday: {dobFormatted}
          </p>
          {age && (
            <p className="text-xs text-gray-400">
              Turning {age} {isToday ? "today" : "this birthday"}
            </p>
          )}
        </div>
      </div>
      <CountdownBadge daysUntil={daysUntil} />
    </article>
  );
};

/**
 * Celebratory banner shown when it's the logged-in user's own birthday.
 */
const OwnBirthdayBanner = ({ name }) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 p-6 text-white shadow-lg">
    <div className="relative z-10">
      <div className="flex items-center gap-3">
        <PartyPopper size={28} />
        <h2 className="text-xl font-bold">Happy Birthday, {name}! 🎉</h2>
      </div>
      <p className="mt-2 text-pink-100">
        Wishing you a wonderful day full of joy and celebration. The whole team wishes you the very best!
      </p>
    </div>
    {/* Decorative circles */}
    <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
    <div className="absolute -bottom-8 right-16 h-24 w-24 rounded-full bg-white/10" />
  </div>
);

// ---------------------------------------------------------------------------
// Birthdays Page
// ---------------------------------------------------------------------------

const Birthdays = () => {
  const { user: self } = useSelector((state) => state.auth);

  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState(""); // non-fatal

  const [filter, setFilter] = useState("upcoming"); // "upcoming" | "month" | "all"

  // ── Fetch team for colleague birthdays ─────────────────────────────────

  const loadTeam = useCallback(async () => {
    setTeamLoading(true);
    setTeamError("");
    try {
      const res = await fetchAllEmployees();
      const members = (res?.users ?? []).filter((u) => u.dob);
      setTeamMembers(members);
    } catch {
      setTeamError("Unable to load team birthday data right now.");
      setTeamMembers([]);
    } finally {
      setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  // ── Build the combined people list ─────────────────────────────────────
  // Always include self (from Redux). If team loaded, merge and deduplicate by _id.

  const people = useMemo(() => {
    const hasSelfDob = !!self?.dob;
    if (!hasSelfDob && teamMembers.length === 0) return [];

    const selfIds = new Set();
    if (self?._id) selfIds.add(String(self._id));

    const merged = [];
    if (hasSelfDob) merged.push(self);
    for (const m of teamMembers) {
      if (!selfIds.has(String(m._id))) merged.push(m);
    }
    return merged;
  }, [self, teamMembers]);

  // ── Apply filter ────────────────────────────────────────────────────────

  const displayList = useMemo(() => {
    if (filter === "upcoming") return birthdaysWithinDays(people, 30);
    if (filter === "month") {
      const currentMonth = dayjs().month();
      return sortByUpcomingBirthday(people).filter(
        (p) => dayjs(p.dob).month() === currentMonth
      );
    }
    return sortByUpcomingBirthday(people);
  }, [people, filter]);

  const todayBirthdays = useMemo(
    () => people.filter((p) => isBirthdayToday(p.dob)),
    [people]
  );

  const selfBirthdayToday = isBirthdayToday(self?.dob);
  const selfName = self?.firstName ?? "there";
  const teamMode = teamMembers.length > 0; // true = HR or team data loaded

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-950">Birthdays</h1>
        <p className="mt-1 text-sm text-gray-600">
          {teamMode
            ? "Team birthdays calculated from employee date of birth records."
            : "Birthday data is currently unavailable. Showing your profile details only."}
        </p>
      </div>

      {/* Own birthday celebration banner */}
      {selfBirthdayToday && <OwnBirthdayBanner name={selfName} />}

      {/* Today's birthdays (other than self) */}
      {todayBirthdays.filter((p) => String(p._id) !== String(self?._id)).length > 0 && (
        <section className="rounded-2xl border border-pink-200 bg-pink-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Gift size={18} className="text-pink-600" />
            <h2 className="font-bold text-pink-800">
              🎂 Today's Birthdays ({todayBirthdays.filter((p) => String(p._id) !== String(self?._id)).length})
            </h2>
          </div>
          <div className="space-y-3">
            {todayBirthdays
              .filter((p) => String(p._id) !== String(self?._id))
              .map((person, i) => (
                <BirthdayCard
                  key={person._id ?? i}
                  person={person}
                  isSelf={String(person._id) === String(self?._id)}
                />
              ))}
          </div>
        </section>
      )}

      {/* Non-fatal team data warning */}
      {teamError && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <Users size={16} className="shrink-0 text-blue-500" />
          <p className="text-sm text-blue-700">{teamError}</p>
        </div>
      )}

      {/* Stats row */}
      {people.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-pink-200 bg-pink-50 p-4 text-center">
            <p className="text-2xl font-bold text-pink-700">{todayBirthdays.length}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-pink-600">
              Today
            </p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center">
            <p className="text-2xl font-bold text-orange-700">
              {birthdaysWithinDays(people, 7).length}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-orange-600">
              This Week
            </p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">
              {birthdaysWithinDays(people, 30).length}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
              This Month
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs + list */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { key: "upcoming", label: "Next 30 Days" },
            { key: "month",    label: "This Month" },
            { key: "all",      label: "All Employees" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                filter === key
                  ? "border-b-2 border-blue-600 text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {teamLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : displayList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Cake size={40} className="mb-3 text-gray-300" />
              <p className="font-semibold text-gray-600">No birthdays in this period</p>
              <p className="mt-1 text-sm text-gray-400">
                {filter === "upcoming"
                  ? "No team birthdays in the next 30 days."
                  : filter === "month"
                  ? "No birthdays this calendar month."
                  : !self?.dob
                  ? "Add your date of birth in your profile to see your birthday here."
                  : "No birthday data available."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayList.map((person, i) => (
                <BirthdayCard
                  key={person._id ?? i}
                  person={person}
                  isSelf={String(person._id) === String(self?._id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Own birthday missing — prompt to update profile */}
      {!self?.dob && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
          <AlertCircle size={16} className="shrink-0 text-yellow-600" />
          <p className="text-sm text-yellow-700">
            Your date of birth is not set. Ask HR to update your profile to enable birthday reminders.
          </p>
        </div>
      )}
    </div>
  );
};

export default Birthdays;
