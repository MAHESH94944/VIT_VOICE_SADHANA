import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getCounsilliMonthlyReport } from "../../api/counsellor";
import { formatToDDMMYYYY, getMonthOptions } from "../../utils/formatDate";
import {
  parseTimeToMinutes,
  parseDurationToMinutes,
} from "../../utils/parseTime";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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

  const chartData = useMemo(() => {
    if (!report?.sadhanaCards) return [];
    return report.sadhanaCards
      .map((card) => ({
        day: new Date(card.date).getDate(),
        wakeUp: parseTimeToMinutes(card.wakeUp),
        reading: parseDurationToMinutes(card.reading),
        hearing: parseDurationToMinutes(card.hearing),
        study: parseDurationToMinutes(card.study),
        seva: parseDurationToMinutes(card.seva),
      }))
      .sort((a, b) => a.day - b.day);
  }, [report]);

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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const formatMinutesToTime = (mins) => {
        if (mins === null) return "N/A";
        const hours = Math.floor(mins / 60) % 24;
        const minutes = mins % 60;
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 === 0 ? 12 : hours % 12;
        return `${displayHours}:${minutes
          .toString()
          .padStart(2, "0")} ${period}`;
      };
      const formatMinutesToDuration = (mins) => {
        if (mins === null || isNaN(mins)) return "N/A";
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h`;
        return `${minutes}m`;
      };

      return (
        <div className="bg-white/80 backdrop-blur-sm p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800">{`Day ${label}`}</p>
          {payload.map((p) => (
            <p key={p.name} style={{ color: p.color }}>
              {`${p.name}: `}
              <strong>
                {p.dataKey === "wakeUp"
                  ? formatMinutesToTime(p.value)
                  : formatMinutesToDuration(p.value)}
              </strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
          {/* Chart Section */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Monthly Activity Trends
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  label={{
                    value: "Duration (minutes)",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fontSize: 14 },
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={["dataMin - 60", "dataMax + 60"]}
                  reversed={true}
                  tickFormatter={(value) => {
                    const h = Math.floor(value / 60) % 24;
                    const m = value % 60;
                    return `${h % 12 === 0 ? 12 : h % 12}:${m
                      .toString()
                      .padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
                  }}
                  label={{
                    value: "Wake Up Time",
                    angle: 90,
                    position: "insideRight",
                    style: { textAnchor: "middle", fontSize: 14 },
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "14px" }} />
                <Bar
                  yAxisId="left"
                  dataKey="reading"
                  name="Reading"
                  stackId="a"
                  fill="#82ca9d"
                />
                <Bar
                  yAxisId="left"
                  dataKey="hearing"
                  name="Hearing"
                  stackId="a"
                  fill="#ffc658"
                />
                <Bar
                  yAxisId="left"
                  dataKey="study"
                  name="Study"
                  stackId="a"
                  fill="#ff7300"
                />
                <Bar
                  yAxisId="left"
                  dataKey="seva"
                  name="Seva"
                  stackId="a"
                  fill="#8884d8"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="wakeUp"
                  name="Wake Up"
                  stroke="#d82727"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

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
