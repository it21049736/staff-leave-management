import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getByDepartmentReport, getSummaryReport, downloadExport } from "../../api/leaves";
import StatCard from "../../components/StatCard";

const ACCENT = "#4f46e5";
const AXIS_STYLE = { fill: "#64748b", fontSize: 12 };

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [byDept, setByDept] = useState([]);

  useEffect(() => {
    getSummaryReport().then(setSummary);
    getByDepartmentReport().then((data) =>
      setByDept(
        data.map((d) => ({
          department: d.user__department__name || "Unassigned",
          days: d.total_days,
        }))
      )
    );
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reports &amp; Trends</h2>
          <p className="text-sm text-slate-500 mt-0.5">Company-wide leave activity, by status, type and department.</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          onClick={downloadExport}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Export CSV
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon="pending" tone="warning" label="Pending" value={summary?.by_status.pending ?? "-"} />
        <StatCard icon="approved" tone="success" label="Approved" value={summary?.by_status.approved ?? "-"} />
        <StatCard icon="rejected" tone="danger" label="Rejected" value={summary?.by_status.rejected ?? "-"} />
        <StatCard icon="cancelled" tone="neutral" label="Cancelled" value={summary?.by_status.cancelled ?? "-"} />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Approved Days by Leave Type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={summary?.by_type.map((t) => ({ name: t.leave_type__name, days: t.total_days })) || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecedf4" />
              <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={{ stroke: "#ecedf4" }} tickLine={false} />
              <YAxis allowDecimals={false} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e6e8f0", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="days" fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Approved Days by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byDept}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecedf4" />
              <XAxis dataKey="department" tick={AXIS_STYLE} axisLine={{ stroke: "#ecedf4" }} tickLine={false} />
              <YAxis allowDecimals={false} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e6e8f0", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="days" fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
