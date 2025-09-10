import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getCounsilliMonthlyReport } from "../../api/counsellor";
import { formatToDDMMYYYY, getMonthOptions } from "../../utils/formatDate";
import {
  parseTimeToMinutes,
  parseDurationToMinutes,
} from "../../utils/parseTime";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- Advanced Chart Component ---
function SadhanaMetricChart({
  title,
  description,
  yAxisLabel,
  labels,
  data,
  color = "75, 192, 192",
  isModal = false, // Add a prop to detect if it's in a modal
}) {
  const [infoVisible, setInfoVisible] = useState(false);
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            if (value === null) return "No Data";
            if (
              title.includes("Time") ||
              title.includes("Rest") ||
              title.includes("Wake Up")
            )
              return `Score: ${value.toFixed(0)}`;
            return `${value.toFixed(0)} minutes`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(200, 200, 200, 0.2)",
        },
        ticks: {
          font: { size: 10 },
        },
        title: {
          display: true,
          text: yAxisLabel,
          font: { size: 12, weight: "bold" },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          autoSkip: false,
          font: { size: 10 },
          // Rotate labels vertically in modal to prevent overlap
          maxRotation: isModal ? 90 : 45,
          minRotation: isModal ? 90 : 0,
        },
        title: {
          display: true,
          text: "Day of the Month",
          font: { size: 12, weight: "bold" },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 2,
        hoverRadius: 6,
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: `rgb(${color})`,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, `rgba(${color}, 0.5)`);
          gradient.addColorStop(1, `rgba(${color}, 0)`);
          return gradient;
        },
        fill: true,
      },
    ],
  };

  return (
    <div
      className={`bg-white p-4 rounded-xl shadow-lg flex flex-col ring-1 ring-gray-900/5 ${
        isModal ? "h-full w-full" : "h-80"
      }`}
    >
      <div className="relative z-10 flex items-center justify-center mb-2">
        <h4 className="text-md font-semibold text-gray-700 text-center">
          {title}
        </h4>
        {description && (
          <div
            className="relative flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              setInfoVisible((v) => !v);
            }}
          >
            <svg
              className="w-4 h-4 ml-1.5 text-gray-400 cursor-help"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-gray-800 text-white text-xs rounded-lg p-3 transition-opacity duration-300 pointer-events-none z-50 ${
                infoVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {description}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
            </div>
          </div>
        )}
      </div>
      <div className="flex-grow">
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

// --- Modal for Expanded Chart View ---
function ChartModal({ chartProps, onClose }) {
  const isMobile = window.innerWidth < 768;

  // Special full-screen, rotated modal for mobile
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div className="relative w-screen h-screen flex items-center justify-center">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-gray-300 z-20 bg-gray-700 rounded-full p-2"
            aria-label="Close chart"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {/* This container is rotated to simulate landscape view */}
          <div className="w-[95vh] h-[90vw] transform rotate-90 p-4">
            <SadhanaMetricChart {...chartProps} isModal={true} />
          </div>
        </div>
      </div>
    );
  }

  // Standard modal for desktop
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[75vh] relative flex flex-col p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 z-10 bg-gray-100 rounded-full p-1"
          aria-label="Close chart"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <SadhanaMetricChart {...chartProps} isModal={true} />
      </div>
    </div>
  );
}

export default function CounsilliReport() {
  const { id } = useParams();
  const [month, setMonth] = useState(getMonthOptions()[0].value);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedChart, setExpandedChart] = useState(null);

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

  const processedData = useMemo(() => {
    if (!report?.sadhanaCards || report.sadhanaCards.length === 0) return null;

    const dataByDay = new Map();
    report.sadhanaCards.forEach((card) => {
      const day = new Date(card.date).getDate();
      dataByDay.set(day, card);
    });

    const labels = Array.from(
      { length: getDaysInMonth(...month.split("-")) },
      (_, i) => i + 1
    );

    const getChartData = (key, parser, inverted = false, maxVal = 120) => {
      return labels.map((day) => {
        const card = dataByDay.get(day);
        let val = card ? parser(card[key]) : null;

        if (val === null) return null;

        if (inverted) {
          // Special handling for bedtime wrap-around (e.g., 1 AM is later than 11 PM)
          if (key === "timeToBed" && val < 240) {
            // Treat times before 4 AM as "late"
            val += 1440;
          }
          return Math.max(0, maxVal - val);
        }
        return val;
      });
    };

    return {
      labels,
      wakeUp: getChartData("wakeUp", parseTimeToMinutes, true, 720), // Invert against 12 PM
      japaCompleted: getChartData(
        "japaCompleted",
        parseTimeToMinutes,
        true,
        1320
      ), // Invert against 10 PM
      timeToBed: getChartData("timeToBed", parseTimeToMinutes, true, 1560), // Invert against 2 AM (1440 + 120)
      dayRest: getChartData("dayRest", parseDurationToMinutes, true, 120), // Invert against 120 min
      hearing: getChartData("hearing", parseDurationToMinutes),
      reading: getChartData("reading", parseDurationToMinutes),
      study: getChartData("study", parseDurationToMinutes),
      seva: getChartData("seva", parseDurationToMinutes),
    };
  }, [report, month]);

  // Prepare calendar data
  const [year, monthNum] = month.split("-");
  const daysInMonth = getDaysInMonth(Number(year), Number(monthNum));
  const cardByDay = {};
  if (report && report.sadhanaCards) {
    report.sadhanaCards.forEach((card) => {
      const day = new Date(card.date).getDate();
      cardByDay[day] = card;
    });
  }

  const hasData = processedData !== null;

  const charts = hasData
    ? [
        {
          title: "Wake Up Time",
          description:
            "Y-Axis: Performance Score (Higher is better). X-Axis: Day of the month. A higher point means an earlier wake-up time.",
          data: processedData.wakeUp,
          yAxisLabel: "Performance Score",
          color: "54, 162, 235",
        },
        {
          title: "Japa Time",
          description:
            "Y-Axis: Performance Score (Higher is better). X-Axis: Day of the month. A higher point means japa was completed earlier.",
          data: processedData.japaCompleted,
          yAxisLabel: "Performance Score",
          color: "255, 99, 132",
        },
        {
          title: "Time to Bed",
          description:
            "Y-Axis: Performance Score (Higher is better). X-Axis: Day of the month. A higher point means an earlier bedtime.",
          data: processedData.timeToBed,
          yAxisLabel: "Performance Score",
          color: "153, 102, 255",
        },
        {
          title: "Day Rest",
          description:
            "Y-Axis: Performance Score (Higher is better). X-Axis: Day of the month. A higher point means less time was spent resting.",
          data: processedData.dayRest,
          yAxisLabel: "Performance Score",
          color: "255, 159, 64",
        },
        {
          title: "Hearing",
          description:
            "Y-Axis: Duration in Minutes. X-Axis: Day of the month. A higher point means more time was spent hearing.",
          data: processedData.hearing,
          yAxisLabel: "Minutes",
          color: "75, 192, 192",
        },
        {
          title: "Reading",
          description:
            "Y-Axis: Duration in Minutes. X-Axis: Day of the month. A higher point means more time was spent reading.",
          data: processedData.reading,
          yAxisLabel: "Minutes",
          color: "255, 205, 86",
        },
        {
          title: "Study",
          description:
            "Y-Axis: Duration in Minutes. X-Axis: Day of the month. A higher point means more time was spent studying.",
          data: processedData.study,
          yAxisLabel: "Minutes",
          color: "201, 203, 207",
        },
        {
          title: "Seva",
          description:
            "Y-Axis: Duration in Minutes. X-Axis: Day of the month. A higher point means more time was spent on seva.",
          data: processedData.seva,
          yAxisLabel: "Minutes",
          color: "46, 204, 113",
        },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto mt-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-orange-50 via-yellow-100 to-orange-100 min-h-screen">
      {expandedChart && (
        <ChartModal
          chartProps={{ ...expandedChart, labels: processedData.labels }}
          onClose={() => setExpandedChart(null)}
        />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-3xl font-bold text-orange-800 mb-4 sm:mb-0 flex items-center gap-2">
          <span>🕉️</span> Counsilli Sadhana Report
        </h2>
        <div className="flex gap-4 items-center bg-white p-3 rounded-lg shadow-sm">
          <label className="font-semibold text-gray-700">Select Month:</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
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
      ) : hasData ? (
        <>
          {/* Chart Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Monthly Activity Trends
            </h3>
            {/* Desktop Grid View */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-8">
              {charts.map((chartProps) => (
                <SadhanaMetricChart
                  key={chartProps.title}
                  labels={processedData.labels}
                  {...chartProps}
                />
              ))}
            </div>
            {/* Mobile Swiper View */}
            <div className="md:hidden">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                className="pb-10"
              >
                {charts.map((chartProps) => (
                  <SwiperSlide
                    key={chartProps.title}
                    onClick={() => setExpandedChart(chartProps)}
                    className="cursor-pointer"
                  >
                    <SadhanaMetricChart
                      labels={processedData.labels}
                      {...chartProps}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
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
