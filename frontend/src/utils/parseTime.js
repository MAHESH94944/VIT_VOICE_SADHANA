/**
 * Parses a time string (e.g., "5:30 AM") into minutes from midnight.
 * @param {string} timeStr The time string to parse.
 * @returns {number|null} The total minutes from midnight, or null if invalid.
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return null;

  const time = timeStr.toUpperCase().match(/(\d{1,2}):(\d{2})\s*([AP]M)/);
  if (!time) return null;

  let [, hours, minutes, period] = time;
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }
  if (period === "AM" && hours === 12) {
    hours = 0; // Midnight case
  }

  return hours * 60 + minutes;
};

/**
 * Parses a duration string (e.g., "1 hr 30 min") into total minutes.
 * @param {string} durationStr The duration string to parse.
 * @returns {number|null} The total minutes, or null if invalid.
 */
export const parseDurationToMinutes = (durationStr) => {
  if (!durationStr || typeof durationStr !== "string") return null;

  let totalMinutes = 0;
  const hourMatch = durationStr.match(/(\d+)\s*hr/);
  const minMatch = durationStr.match(/(\d+)\s*min/);

  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60;
  }
  if (minMatch) {
    totalMinutes += parseInt(minMatch[1], 10);
  }

  if (durationStr.toLowerCase().includes("more than")) {
    const numberMatch = durationStr.match(/(\d+)/);
    if (numberMatch) {
      return parseInt(numberMatch[1], 10) * 60;
    }
  }

  if (!hourMatch && !minMatch && totalMinutes === 0) return 0;

  return totalMinutes;
};
