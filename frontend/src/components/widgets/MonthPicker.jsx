import React from "react";

function getMonthOptions() {
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
}

export default function MonthPicker({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-2 rounded"
    >
      {getMonthOptions().map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
