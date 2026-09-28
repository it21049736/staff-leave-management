import { useEffect, useState } from "react";
import { downloadExport, getAllLeaves, getLeaveTypes, getSummaryReport } from "../../api/leaves";
import { getDepartments } from "../../api/users";
import LeaveTable from "../../components/LeaveTable";
import StatCard from "../../components/StatCard";

const PAGE_SIZE = 20;
const SELECT =
  "text-xs rounded-lg border border-slate-200 text-slate-700 py-1.5 pl-2.5 pr-8 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500";

export default function LeaveRecords() {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("");
  const [dept, setDept] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getDepartments().then(setDepartments);
    getLeaveTypes().then(setLeaveTypes);
    getSummaryReport().then(setSummary);
  }, []);

  useEffect(() => {
    const params = { page };
    if (status) params.status = status;
    if (dept) params.dept = dept;
    if (leaveType) params.leave_type = leaveType;
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    if (q) params.q = q;
    const timeout = setTimeout(() => {
      getAllLeaves(params).then((data) => {
        setRows(data.results ?? data);
        setCount(data.count ?? (data.results ?? data).length);
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [status, dept, leaveType, fromDate, toDate, q, page]);

  useEffect(() => setPage(1), [status, dept, leaveType, fromDate, toDate, q]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const hasFilters = status || dept || leaveType || fromDate || toDate || q;

  const clearFilters = () => {
    setStatus("");
    setDept("");
    setLeaveType("");
    setFromDate("");
    setToDate("");
    setQ("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Records</h2>
          <p className="text-sm text-slate-500 mt-0.5">Search and filter every leave request across the company.</p>
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

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </span>
            <input
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="Search employee..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select className={SELECT} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className={SELECT} value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select className={SELECT} value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
            <option value="">All leave types</option>
            {leaveTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="text-xs rounded-lg border border-slate-200 text-slate-700 py-1.5 px-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            title="From date"
          />
          <span className="text-slate-300 text-xs">–</span>
          <input
            type="date"
            className="text-xs rounded-lg border border-slate-200 text-slate-700 py-1.5 px-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            title="To date"
          />
          {hasFilters && (
            <button
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1.5 transition-colors"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}
        </div>

        <LeaveTable bare rows={rows} showEmployee />

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing{" "}
            <strong className="text-slate-700 font-semibold">
              {count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, count)}
            </strong>{" "}
            of <strong className="text-slate-700 font-semibold">{count}</strong> records
          </div>
          <div className="flex items-center gap-1">
            <button
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="px-2 font-medium text-slate-700">
              {page} / {totalPages}
            </span>
            <button
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
