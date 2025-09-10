import React, { useEffect, useState, useCallback } from "react";
import { getCounsilliDashboard } from "../../api/counsilli";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Card from "../../components/common/Card";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4 pb-32 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <PageTitle
          title="Your Dashboard"
          subtitle={`Welcome, ${user?.name}!`}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          onClick={() => navigate("/counsilli/add-sadhana")}
        >
          Submit New Sadhana
        </button>
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
            {recent.map((card) => (
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
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
