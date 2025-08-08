/**
 * Parses a time string (e.g., "40 min", "1.5 hr", "2 hr 30 min") into total minutes.
 * @param {string} timeStr The time string to parse.
 * @returns {number} The total time in minutes, or 0 if invalid.
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return 0;

  let totalMinutes = 0;
  const cleanedStr = timeStr.toLowerCase().trim();

  const parts = cleanedStr.split(/\s+/);
  let currentNumber = 0;

  parts.forEach((part) => {
    const num = parseFloat(part);
    if (!isNaN(num)) {
      currentNumber = num;
    } else if (part.startsWith("h")) {
      totalMinutes += currentNumber * 60;
      currentNumber = 0;
    } else if (part.startsWith("m")) {
      totalMinutes += currentNumber;
      currentNumber = 0;
    }
  });

  // If there's a leftover number without units, assume minutes
  if (currentNumber > 0) {
    totalMinutes += currentNumber;
  }

  return Math.round(totalMinutes);
};
