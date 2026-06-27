import { Component } from "react";

/*
|--------------------------------------------------------------------------
| ErrorBoundary
|
| Industry Practice:
|   React functional components cannot catch render errors — only class
|   components with componentDidCatch can. This boundary sits at the top
|   of the tree so that any uncaught render error (bad data, null access,
|   library bug) shows a recovery screen instead of a blank white page.
|
|   Usage: wrap <App /> in main.jsx
|--------------------------------------------------------------------------
*/

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you would send this to a service like Sentry:
    // Sentry.captureException(error, { extra: info });
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  handleReload = () => {
    // Clear error state and re-render; if the error was transient (e.g. a
    // network race condition) the page will recover silently.
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-sm text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-4xl">
            ⚠️
          </div>

          <h1 className="text-xl font-bold text-gray-950">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            An unexpected error occurred. Your data is safe — this is a
            display issue only.
          </p>

          {/* Error detail (dev only) */}
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 overflow-auto rounded-lg bg-gray-100 px-4 py-3 text-left text-xs text-red-700 max-h-36">
              {this.state.error.message}
            </pre>
          )}

          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
