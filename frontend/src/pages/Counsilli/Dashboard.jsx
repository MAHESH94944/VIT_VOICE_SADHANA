import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getCounsilliDashboard } from "../../api/counsilli";
import PageTitle from "../../components/common/PageTitle";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Card from "../../components/common/Card";
import { Helmet } from "react-helmet-async";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCounsilliDashboard();
      setUser(res.user);
      setRecent(res.recentSadhana || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const recentList = useMemo(() => {
    return recent.map((card) => (
      <div
        key={card._id}
        className="border rounded-lg p-4 bg-gray-50 shadow-sm"
      >
        <div className="font-semibold text-blue-700 mb-2">
          {new Date(card.date).toLocaleDateString()}
        </div>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-medium">Wake Up:</span> {card.wakeUp}
          </div>
          <div>
            <span className="font-medium">Japa Completed:</span>{" "}
            {card.japaCompleted}
          </div>
          <div>
            <span className="font-medium">Hearing:</span> {card.hearing}
          </div>
          <div>
            <span className="font-medium">Reading:</span> {card.reading}
          </div>
        </div>
      </div>
    ));
  }, [recent]);

  return (
    <div className="max-w-5xl mx-auto mt-4 px-2 sm:px-4 p-4 pb-32 md:pb-8">
      <Helmet>
        <title>Counsilli Dashboard | VIT VOICE Sadhana</title>
        <meta
          name="description"
          content="Your personal sadhana dashboard - submit and view recent entries."
        />
      </Helmet>

      <div className="flex flex-col items-center justify-center mb-4 sm:mb-6 -mt-2 sm:-mt-0">
        <PageTitle
          title="Your Dashboard"
          subtitle={`Welcome, ${user?.name || ""}!`}
        />
        <img
          src="/haridasa-thakur-chanting.jpg"
          alt="Sadhaka in meditation"
          loading="lazy"
          className="w-full h-60 sm:h-56 md:h-[420px] lg:h-[520px] object-cover md:object-contain rounded-xl shadow-lg mt-3 sm:mt-4 border-4 border-orange-200 bg-white"
          style={{ objectPosition: "center center" }}
        />
      </div>

      <Card>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Recent Sadhana Entries
        </h3>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>
        ) : recent.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No sadhana entries yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentList}
          </div>
        )}
      </Card>
    </div>
  );
}
