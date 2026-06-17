import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <section className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Page not found
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          The page you are looking for is not available.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-black px-5 text-sm font-semibold text-white"
        >
          Go to login
        </Link>
      </section>
    </main>
  );
};

export default NotFound;
