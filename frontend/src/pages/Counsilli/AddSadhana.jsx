import React, { useState } from "react";
import { addSadhana } from "../../api/counsilli";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import Card from "../../components/common/Card";

// Helper arrays for dropdowns
const timeOptions = [
  ...Array.from({ length: 48 }, (_, i) => {
    const totalMinutes = i * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${period}`;
  }),
  "Other...", // Add custom option
];

const durationOptions = [
  "0 min",
  "15 min",
  "30 min",
  "45 min",
  "1 hr",
  "1 hr 15 min",
  "1 hr 30 min",
  "1 hr 45 min",
  "2 hr",
  "2 hr 30 min",
  "3 hr",
  "More than 3 hr",
  "Other...", // Add custom option
];

export default function AddSadhana() {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    wakeUp: "6:00 AM",
    japaCompleted: "8:00 AM",
    dayRest: "0 min",
    hearing: "30 min",
    reading: "30 min",
    study: "1 hr",
    timeToBed: "10:00 PM",
    seva: "0 min",
    concern: "",
  });
  // New state for ALL custom values
  const [customValues, setCustomValues] = useState({
    wakeUp: "",
    japaCompleted: "",
    timeToBed: "",
    dayRest: "",
    hearing: "",
    reading: "",
    study: "",
    seva: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // New handler for ALL custom input fields
  const handleCustomValueChange = (e) => {
    setCustomValues({ ...customValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    // Prepare form data, using custom values if "Other..." is selected
    const dataToSend = { ...form };
    for (const key in customValues) {
      if (form[key] === "Other...") {
        dataToSend[key] = customValues[key];
      }
    }

    try {
      await addSadhana(dataToSend);
      navigate("/counsilli/dashboard");
    } catch (err) {
      setMsg(err.message);
    }
    setLoading(false);
  };

  const renderSelect = (name, label, options, isCustomizable = false) => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={form[name]}
        onChange={handleChange}
        className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {isCustomizable && form[name] === "Other..." && (
        <input
          type="text"
          name={name}
          value={customValues[name]}
          onChange={handleCustomValueChange}
          placeholder={
            name.includes("Time") || name.includes("wakeUp")
              ? "e.g., 5:45 AM"
              : "e.g., 1 hr 10 min"
          }
          className="w-full mt-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          required
        />
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 pb-32 md:pb-8">
      <PageTitle
        title="Submit Sadhana Card"
        subtitle="Fill in your spiritual activities for the day."
      />
      <Card>
        {msg && (
          <div className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">
            {msg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderSelect("wakeUp", "Wake Up Time", timeOptions, true)}
            {renderSelect(
              "japaCompleted",
              "Japa Completed By",
              timeOptions,
              true
            )}
            {renderSelect("dayRest", "Day Rest", durationOptions, true)}
            {renderSelect("hearing", "Hearing", durationOptions, true)}
            {renderSelect("reading", "Reading", durationOptions, true)}
            {renderSelect("study", "Study", durationOptions, true)}
            {renderSelect("timeToBed", "Time To Bed", timeOptions, true)}
            {renderSelect("seva", "Seva", durationOptions, true)}
          </div>

          <div>
            <label
              htmlFor="concern"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes / Concerns
            </label>
            <textarea
              id="concern"
              name="concern"
              placeholder="Any challenges or realizations..."
              value={form.concern}
              onChange={handleChange}
              className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          >
            Submit Sadhana
          </button>
        </form>
      </Card>
    </div>
  );
}
