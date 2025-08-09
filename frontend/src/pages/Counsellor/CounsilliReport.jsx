import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCounsilliMonthlyReport } from "../../api/counsellor";
import { formatToDDMMYYYY, getMonthOptions } from "../../utils/formatDate"; // Updated import
import { parseTimeToMinutes } from "../../utils/parseTime";
import {
  // ...existing code...
  ResponsiveContainer,
} from "recharts";

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export default function CounsilliReport() {
  const { id } = useParams();
  const [month, setMonth] = useState(getMonthOptions()[0].value);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError("");
      try {
        const res = await getCounsilliMonthlyReport(id, month);
        setReport(res);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchReport();
  }, [id, month]);

  // Prepare calendar data
  const [year, monthNum] = month.split("-");
  const daysInMonth = getDaysInMonth(Number(year), Number(monthNum));
  const cardByDay = {};
  if (report?.sadhanaCards) {
    report.sadhanaCards.forEach((card) => {
      const day = new Date(card.date).getDate();
      cardByDay[day] = card;
    });
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Counsilli Sadhana Report
        </h2>
        <div className="flex gap-4 items-center bg-white p-3 rounded-lg shadow-sm">
          <label className="font-semibold text-gray-700">Select Month:</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {getMonthOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 bg-red-100 p-4 rounded-lg shadow">
          {error}
        </div>
      ) : report && report.sadhanaCards.length > 0 ? (
        <>
          {/* Calendar View */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Monthly Calendar Overview
            </h3>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const card = cardByDay[day];
                return (
                  <div
                    key={day}
                    className={`h-12 sm:h-16 flex flex-col items-center justify-center rounded-lg shadow-sm text-sm font-semibold transition-transform transform hover:scale-105 ${
                      card
                        ? "bg-green-200 text-green-900"
                        : "bg-red-200 text-red-900"
                    }`}
                  >
                    {day}
                    <span className="hidden sm:inline text-xs mt-1">
                      {card ? "✔ Submitted" : "✗ Missed"}
                    </span>
                    <span className="sm:hidden text-lg">
                      {card ? "✔" : "✗"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Report Section */}
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Detailed Daily Entries
          </h3>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-lg">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Wake Up
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Japa Time
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Day Rest
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Hearing
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Reading
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Study
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Time To Bed
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Seva
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Concern
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.sadhanaCards.map((card) => (
                  <tr key={card._id} className="hover:bg-gray-50 transition">
                    <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatToDDMMYYYY(card.date)}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {card.wakeUp}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {card.japaCompleted}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {card.dayRest}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {card.hearing}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {card.reading}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {card.study}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {card.timeToBed}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {card.seva}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {card.concern}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {report.sadhanaCards.map((card) => (
              <div key={card._id} className="bg-white p-4 rounded-lg shadow-md">
                <h4 className="font-bold text-lg text-blue-600 mb-2">
                  {formatToDDMMYYYY(card.date)}
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <strong className="text-gray-600">Wake Up:</strong>{" "}
                    {card.wakeUp}
                  </div>
                  <div>
                    <strong className="text-gray-600">Japa Time:</strong>{" "}
                    {card.japaCompleted}
                  </div>
                  <div>
                    <strong className="text-gray-600">Day Rest:</strong>{" "}
                    {card.dayRest}
                  </div>
                  <div>
                    <strong className="text-gray-600">Hearing:</strong>{" "}
                    {card.hearing}
                  </div>
                  <div>
                    <strong className="text-gray-600">Reading:</strong>{" "}
                    {card.reading}
                  </div>
                  <div>
                    <strong className="text-gray-600">Study:</strong>{" "}
                    {card.study}
                  </div>
                  <div>
                    <strong className="text-gray-600">Time To Bed:</strong>{" "}
                    {card.timeToBed}
                  </div>
                  <div>
                    <strong className="text-gray-600">Seva:</strong> {card.seva}
                  </div>
                </div>
                {card.concern && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <strong className="text-gray-600">Concern:</strong>
                    <p className="text-gray-800 italic">{card.concern}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow">
          No sadhana cards found for this month.
        </div>
      )}
    </div>
  );
}
