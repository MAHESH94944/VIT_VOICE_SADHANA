/**
 * Formats a date to 'DD/MM/YYYY'.
 * @param {string|Date} dateInput The date to format.
 * @returns {string} The formatted date string.
 */
export const formatToDDMMYYYY = (dateInput) => {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return "Invalid Date";
  }
};

/**
 * Formats a date to 'Month YYYY' (e.g., 'January 2023').
 * @param {string|Date} dateInput The date to format.
 * @returns {string} The formatted month and year string.
 */
export const formatToMonthYear = (dateInput) => {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    return date.toLocaleString("default", {
      month: "long",
      year: "numeric",
      timeZone: "UTC", // Use UTC to avoid timezone-related month shifts
    });
  } catch (error) {
    return "Invalid Date";
  }
};

/**
 * Generates a list of the last 12 months for a dropdown.
 * @returns {Array<{value: string, label: string}>} An array of month options.
 */
export const getMonthOptions = () => {
  const now = new Date();
  const options = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("default", { month: "long", year: "numeric" }),
    });
  }
  return options;
};
