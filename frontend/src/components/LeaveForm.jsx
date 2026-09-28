import { useEffect, useState } from "react";
import { getLeaveTypes } from "../api/leaves";

const empty = { leave_type: "", from_date: "", to_date: "", reason: "" };

const LABEL = "text-xs font-semibold text-slate-600 mb-1.5 block";
const INPUT =
  "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors";

export default function LeaveForm({ initial, onSubmit, submitLabel = "Submit" }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState(initial || empty);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getLeaveTypes().then(setLeaveTypes);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({ ...form, leave_type: Number(form.leave_type) });
      setForm(empty);
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === "string"
          ? data
          : data
          ? Object.values(data).flat().join(" ")
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-lg px-3 py-2 text-xs font-medium">
          {error}
        </div>
      )}
      <div>
        <label className={LABEL}>Leave Type</label>
        <select name="leave_type" value={form.leave_type} onChange={handleChange} required className={INPUT}>
          <option value="" disabled>
            Select leave type
          </option>
          {leaveTypes.map((lt) => (
            <option key={lt.id} value={lt.id}>
              {lt.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>From</label>
          <input type="date" name="from_date" value={form.from_date} onChange={handleChange} required className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>To</label>
          <input type="date" name="to_date" value={form.to_date} onChange={handleChange} required className={INPUT} />
        </div>
      </div>
      <div>
        <label className={LABEL}>Reason</label>
        <textarea name="reason" value={form.reason} onChange={handleChange} rows={4} required className={INPUT} />
      </div>
      <button
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
        type="submit"
        disabled={submitting}
      >
        {submitting ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}
