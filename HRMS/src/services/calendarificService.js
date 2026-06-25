import axios from "axios";

const API_KEY = import.meta.env.VITE_CALENDARIFIC_API_KEY;
const BASE_URL = "https://calendarific.com/api/v2";

// ---------------------------------------------------------------------------
// In-memory cache keyed by year — avoids repeated network calls when the
// user navigates between months of the same year.
// ---------------------------------------------------------------------------

const cache = new Map(); // year (number) → normalised holiday array

/**
 * Maps a raw Calendarific holiday object into the same shape used
 * throughout the Holidays page.
 *
 * @param {Object} h  raw holiday from Calendarific response
 * @returns {{ date: string, name: string, type: string, description: string, source: string }}
 */
const normalise = (h) => {
  const raw = h.type ?? [];
  const isNational =
    raw.some((t) => t.toLowerCase().includes("national")) ||
    h.primary_type === "National Holiday" ||
    h.primary_type === "Gazetted Holiday";

  return {
    date: h.date.iso.slice(0, 10), // "YYYY-MM-DD"
    name: h.name,
    description: h.description ?? "",
    type: isNational ? "National" : "Festival",
    source: "national",
  };
};

/**
 * Fetches India's national + gazetted holidays for the given year from
 * Calendarific. Results are cached in memory for the app session.
 *
 * @param {number} year
 * @returns {Promise<Array<{ date: string, name: string, type: string, description: string, source: string }>>}
 */
export const fetchIndiaHolidays = async (year) => {
  if (cache.has(year)) return cache.get(year);

  const { data } = await axios.get(`${BASE_URL}/holidays`, {
    params: {
      api_key: API_KEY,
      country: "IN",
      year,
      type: "national",
    },
  });

  const holidays = (data?.response?.holidays ?? []).map(normalise);
  cache.set(year, holidays);
  return holidays;
};
