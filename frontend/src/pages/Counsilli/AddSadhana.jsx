import React, { useState } from "react";
import { addSadhana } from "../../api/counsilli"; // Corrected import name
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import Card from "../../components/common/Card";
import { Helmet } from "react-helmet-async";

export default function AddSadhana() {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    wakeUp: "",
    japaCompleted: "",
    dayRest: "",
    hearing: "",
    reading: "",
    study: "",
    timeToBed: "",
    seva: "",
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
    // Basic validation
    if (!form.date || !form.wakeUp || !form.japaCompleted) {
      setMsg("Date, Wake Up, and Japa Completed are required.");
      setLoading(false);
      return;
    }
    try {
      await addSadhana(form); // Corrected function call
      navigate("/counsilli/dashboard");
    } catch (err) {
      setMsg(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-4 bg-white rounded shadow">
      <Helmet>
        <title>Add Sadhana</title>
      </Helmet>
      <PageTitle title="Add Sadhana" />
      <Card>
        <h2 className="text-xl font-bold mb-4">Submit Sadhana Card</h2>
        {msg && <div className="mb-2 text-red-500">{msg}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="wakeUp"
            placeholder="Wake Up Time"
            value={form.wakeUp}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="japaCompleted"
            placeholder="Japa Completed"
            value={form.japaCompleted}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="dayRest"
            placeholder="Day Rest"
            value={form.dayRest}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="hearing"
            placeholder="Hearing"
            value={form.hearing}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="reading"
            placeholder="Reading"
            value={form.reading}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="study"
            placeholder="Study"
            value={form.study}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="timeToBed"
            placeholder="Time To Bed"
            value={form.timeToBed}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="seva"
            placeholder="Seva"
            value={form.seva}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <textarea
            name="concern"
            placeholder="Notes / Concerns"
            value={form.concern}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded font-semibold"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </Card>
    </div>
  );
}
