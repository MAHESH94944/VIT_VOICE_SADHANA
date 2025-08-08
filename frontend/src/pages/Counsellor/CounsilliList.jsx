import React, { useEffect, useState, useCallback } from "react";
import { getCounsillisList } from "../../api/counsellor";
import { useNavigate } from "react-router-dom";
import { formatToDDMMYYYY } from "../../utils/formatDate";
import PageTitle from "../../components/common/PageTitle";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Card from "../../components/common/Card";

export default function CounsilliList() {
  const [counsillis, setCounsillis] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCounsillisList();
      setCounsillis(res.counsillis);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filtered = counsillis.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4">
      <PageTitle
        title="Your Counsillis"
        subtitle="View and manage reports for your assigned counsillis."
      />
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-6 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Last Submission
                </th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 p-6">
                    No counsillis found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={`https://ui-avatars.com/api/?name=${c.name}&background=random`}
                          alt=""
                          loading="lazy"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {c.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {c.email}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                      {c.lastSubmission ? (
                        formatToDDMMYYYY(c.lastSubmission)
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap text-center">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        onClick={() =>
                          navigate(`/counsellor/counsilli/${c._id}/report`)
                        }
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
