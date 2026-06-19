/**
 * Extracts a human-readable error message from various error shapes
 * returned by the API layer or thrown by JS runtime.
 *
 * @param {unknown} error
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (!error) return "An unknown error occurred.";
  if (typeof error === "string") return error;
  return error.message ?? error.error ?? "An unknown error occurred.";
};
