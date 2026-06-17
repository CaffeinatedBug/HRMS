const StatsCard = ({
  label,
  value,
  hint,
}) => {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-gray-950">
        {value}
      </p>

      {hint ? (
        <p className="mt-2 text-sm text-gray-600">
          {hint}
        </p>
      ) : null}
    </article>
  );
};

export default StatsCard;
