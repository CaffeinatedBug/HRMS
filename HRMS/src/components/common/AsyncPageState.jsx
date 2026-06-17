import Loader from "./Loader";

const AsyncPageState = ({
  title,
  description,
  loading,
  error,
  isEmpty,
  emptyTitle = "No data available",
  emptyDescription = "There is nothing to show right now.",
  onRetry,
  children,
}) => {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-950">
          {title}
        </h1>

        {description ? (
          <p className="max-w-3xl text-sm text-gray-600">
            {description}
          </p>
        ) : null}
      </header>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10">
          <Loader label="Loading page data" />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-red-950">
              We could not load this page
            </h2>

            <p className="text-sm text-red-700">
              {error}
            </p>

            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white"
              >
                Try again
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {!loading && !error && isEmpty ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {emptyTitle}
            </h2>

            <p className="text-sm text-gray-600">
              {emptyDescription}
            </p>
          </div>
        </div>
      ) : null}

      {!loading && !error && !isEmpty ? (
        children
      ) : null}
    </section>
  );
};

export default AsyncPageState;
