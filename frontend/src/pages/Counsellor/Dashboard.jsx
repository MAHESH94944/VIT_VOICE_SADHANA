import React, { useEffect, useState } from "react";
import { getCounsellorDashboard } from "../../api/counsellor";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PageTitle from "../../components/common/PageTitle";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Card from "../../components/common/Card";
import { Helmet } from "react-helmet";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0 });
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const dashboard = await getCounsellorDashboard();
        setStats({
          total: dashboard.assignedCounsilliCount,
        });
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4">
      <Helmet>
        <title>Counsellor Dashboard | VIT VOICE Sadhana</title>
        <meta
          name="description"
          content="Counsellor dashboard for managing assigned counsillis and viewing stats."
        />
      </Helmet>
      <img
        src="/Krishna_arjun.jpg"
        alt="Mahabharata Chariot"
        loading="lazy"
        className="w-full max-h-96 md:max-h-[340px] object-contain rounded-xl shadow-lg mb-6 border-4 border-orange-200 mx-auto bg-white"
        style={{ objectPosition: "center top" }}
      />
      <h1 className="text-3xl font-extrabold text-orange-800 mb-2 text-center drop-shadow-sm">
        Counsellor Dashboard
      </h1>
      <div className="mt-8">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="text-center bg-gradient-to-br from-yellow-200 via-yellow-100 to-orange-100 border-2 border-orange-300 shadow-lg">
              <div className="text-5xl font-extrabold text-orange-600 drop-shadow">
                {stats.total}
              </div>
              <div className="text-lg text-orange-900 mt-2 font-semibold">
                Total Counsillis Assigned
              </div>
            </Card>
            <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-50 to-orange-200 border-2 border-yellow-300 shadow-lg">
              <h3 className="text-lg font-semibold text-orange-900 mb-4">
                Manage Your Counsillis
              </h3>
              <Link
                to="/counsellor/counsilli-list"
                className="w-full text-center px-6 py-3 font-semibold text-white bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow hover:from-yellow-500 hover:to-orange-500 transition-all duration-300"
              >
                View Counsilli List
              </Link>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
