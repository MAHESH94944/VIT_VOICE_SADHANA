/**
 * Validates an email address format.
 * @param {string} email The email to validate.
 * @returns {boolean} True if the email format is valid.
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validates password strength (minimum 6 characters).
 * @param {string} password The password to validate.
 * @returns {string|null} An error message if invalid, otherwise null.
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  return null;
};

/**
 * Validates the sadhana form fields.
 * @param {object} values The form values from the sadhana form.
 * @returns {object} An object containing error messages for invalid fields.
 */
export const validateSadhanaForm = (values) => {
  const errors = {};

  if (!values.date) {
    errors.date = "Date is required.";
  }
  if (!values.wakeUp) {
    errors.wakeUp = "Wake Up time is required.";
  }
  if (!values.japaCompleted) {
    errors.japaCompleted = "Japa completion time is required.";
  }

  // Example of a more specific validation for time fields
  // This regex checks for formats like "HH:MM AM/PM" or "HH:MM"
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9](\s?[AP]M)?$/i;
  if (values.wakeUp && !timeRegex.test(values.wakeUp)) {
    errors.wakeUp = "Please use a valid time format (e.g., 4:30 AM).";
  }
  if (values.japaCompleted && !timeRegex.test(values.japaCompleted)) {
    errors.japaCompleted = "Please use a valid time format (e.g., 7:00 PM).";
  }

  return errors;
};
