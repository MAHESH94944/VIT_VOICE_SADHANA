import React, { useEffect, useState } from "react";
import { getMonthlyReport } from "../../api/counsilli";
import { getMonthOptions } from "../../utils/formatDate"; // Import the shared function

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export default function MonthlyReport() {
  const [month, setMonth] = useState(getMonthOptions()[0].value);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError("");
      try {
        const res = await getMonthlyReport(month);
        setReport(res.sadhanaCards || []);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchReport();
  }, [month]);

  // Prepare calendar data
  const [year, monthNum] = month.split("-");
  const daysInMonth = getDaysInMonth(Number(year), Number(monthNum));
  const cardByDay = {};
  report.forEach((card) => {
    const day = new Date(card.date).getDate();
    cardByDay[day] = card;
  });

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Monthly Sadhana Report</h2>
      <div className="mb-4 flex gap-4 items-center">
        <label className="font-semibold">Month:</label>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-2 rounded"
        >
          {getMonthOptions().map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border rounded shadow">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Wake Up</th>
                  <th className="p-2 text-left">Japa</th>
                  <th className="p-2 text-left">Day Rest</th>
                  <th className="p-2 text-left">Hearing</th>
                  <th className="p-2 text-left">Reading</th>
                  <th className="p-2 text-left">Study</th>
                  <th className="p-2 text-left">Time To Bed</th>
                  <th className="p-2 text-left">Seva</th>
                  <th className="p-2 text-left">Concern</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const card = cardByDay[day];
                  return (
                    <tr
                      key={day}
                      className={card ? "bg-green-50" : "bg-red-50"}
                    >
                      <td className="p-2 font-semibold">{`${year}-${monthNum}-${String(
                        day
                      ).padStart(2, "0")}`}</td>
                      <td className="p-2">{card?.wakeUp || "-"}</td>
                      <td className="p-2">{card?.japaCompleted || "-"}</td>
                      <td className="p-2">{card?.dayRest || "-"}</td>
                      <td className="p-2">{card?.hearing || "-"}</td>
                      <td className="p-2">{card?.reading || "-"}</td>
                      <td className="p-2">{card?.study || "-"}</td>
                      <td className="p-2">{card?.timeToBed || "-"}</td>
                      <td className="p-2">{card?.seva || "-"}</td>
                      <td className="p-2">{card?.concern || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Calendar view */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const card = cardByDay[day];
                return (
                  <div
                    key={day}
                    className={`h-12 flex flex-col items-center justify-center rounded shadow text-sm font-semibold ${
                      card
                        ? "bg-green-200 text-green-900"
                        : "bg-red-200 text-red-900"
                    }`}
                  >
                    {day}
                    <span className="text-xs">{card ? "✔" : "✗"}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 bg-green-200 inline-block rounded"></span>{" "}
                Completed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 bg-red-200 inline-block rounded"></span>{" "}
                Not Submitted
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
            