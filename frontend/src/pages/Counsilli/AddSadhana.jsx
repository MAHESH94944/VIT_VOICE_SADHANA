import React, { useState } from "react";
import { addSadhana } from "../../api/counsilli";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import Card from "../../components/common/Card";

// Helper arrays for dropdowns
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const totalMinutes = i * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${period}`;
});

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
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await addSadhana(form);
      navigate("/counsilli/dashboard");
    } catch (err) {
      setMsg(err.message);
    }
    setLoading(false);
  };

  const renderSelect = (name, label, options) => (
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
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
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
            {renderSelect("wakeUp", "Wake Up Time", timeOptions)}
            {renderSelect("japaCompleted", "Japa Completed By", timeOptions)}
            {renderSelect("dayRest", "Day Rest", durationOptions)}
            {renderSelect("hearing", "Hearing", durationOptions)}
            {renderSelect("reading", "Reading", durationOptions)}
            {renderSelect("study", "Study", durationOptions)}
            {renderSelect("timeToBed", "Time To Bed", timeOptions)}
            {renderSelect("seva", "Seva", durationOptions)}
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
            className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Sadhana"}
          </button>
        </form>
      </Card>
    </div>
  );
}
