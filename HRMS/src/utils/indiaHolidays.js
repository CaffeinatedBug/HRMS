/**
 * India's National / Gazetted holidays by year.
 *
 * Source: Ministry of Personnel, Public Grievances & Pensions (Govt. of India)
 * Update this file each year in January when the official list is published.
 *
 * Format: { [YYYY]: Array<{ date: "YYYY-MM-DD", name: string, type: "National"|"Festival" }> }
 */

const INDIA_HOLIDAYS = {
  2025: [
    { date: "2025-01-14", name: "Makar Sankranti / Pongal", type: "Festival" },
    { date: "2025-01-26", name: "Republic Day", type: "National" },
    { date: "2025-02-26", name: "Maha Shivaratri", type: "Festival" },
    { date: "2025-03-14", name: "Holi", type: "Festival" },
    { date: "2025-03-31", name: "Eid ul-Fitr (Ramzan)", type: "Festival" },
    { date: "2025-04-06", name: "Ram Navami", type: "Festival" },
    { date: "2025-04-10", name: "Mahavir Jayanti", type: "Festival" },
    { date: "2025-04-14", name: "Dr. Ambedkar Jayanti", type: "National" },
    { date: "2025-04-18", name: "Good Friday", type: "Festival" },
    { date: "2025-05-12", name: "Buddha Purnima", type: "Festival" },
    { date: "2025-06-07", name: "Eid ul-Adha (Bakrid)", type: "Festival" },
    { date: "2025-07-06", name: "Muharram", type: "Festival" },
    { date: "2025-08-15", name: "Independence Day", type: "National" },
    { date: "2025-08-16", name: "Janmashtami", type: "Festival" },
    { date: "2025-09-05", name: "Eid-e-Milad (Prophet's Birthday)", type: "Festival" },
    { date: "2025-10-02", name: "Gandhi Jayanti / Dussehra", type: "National" },
    { date: "2025-10-20", name: "Diwali (Lakshmi Puja)", type: "Festival" },
    { date: "2025-10-22", name: "Govardhan Puja", type: "Festival" },
    { date: "2025-10-23", name: "Bhai Dooj", type: "Festival" },
    { date: "2025-11-05", name: "Guru Nanak Jayanti", type: "Festival" },
    { date: "2025-12-25", name: "Christmas Day", type: "Festival" },
  ],
  2026: [
    { date: "2026-01-14", name: "Makar Sankranti / Pongal", type: "Festival" },
    { date: "2026-01-26", name: "Republic Day", type: "National" },
    { date: "2026-02-15", name: "Maha Shivaratri", type: "Festival" },
    { date: "2026-03-20", name: "Holi", type: "Festival" },
    { date: "2026-03-20", name: "Eid ul-Fitr (Ramzan)", type: "Festival" },
    { date: "2026-03-26", name: "Good Friday", type: "Festival" },
    { date: "2026-03-29", name: "Ram Navami", type: "Festival" },
    { date: "2026-04-14", name: "Dr. Ambedkar Jayanti / Mahavir Jayanti", type: "National" },
    { date: "2026-05-01", name: "Buddha Purnima", type: "Festival" },
    { date: "2026-05-27", name: "Eid ul-Adha (Bakrid)", type: "Festival" },
    { date: "2026-06-16", name: "Muharram", type: "Festival" },
    { date: "2026-08-15", name: "Independence Day", type: "National" },
    { date: "2026-08-25", name: "Eid-e-Milad (Prophet's Birthday)", type: "Festival" },
    { date: "2026-09-02", name: "Janmashtami", type: "Festival" },
    { date: "2026-10-02", name: "Gandhi Jayanti", type: "National" },
    { date: "2026-10-19", name: "Dussehra", type: "Festival" },
    { date: "2026-11-08", name: "Diwali (Lakshmi Puja)", type: "Festival" },
    { date: "2026-11-24", name: "Guru Nanak Jayanti", type: "Festival" },
    { date: "2026-12-25", name: "Christmas Day", type: "Festival" },
  ],
};

/**
 * Returns the national/festival holidays for a given year.
 * Falls back to an empty array if the year is not yet populated.
 *
 * @param {number} year
 * @returns {Array<{ date: string, name: string, type: string }>}
 */
export const getIndiaHolidaysForYear = (year) => INDIA_HOLIDAYS[year] ?? [];
