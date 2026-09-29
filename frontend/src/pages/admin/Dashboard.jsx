import { useEffect, useMemo, useState } from "react";
import { approveLeave, getAllLeaves, getLeaveTypes, getSummaryReport, rejectLeave } from "../../api/leaves";
import { getDepartments } from "../../api/users";
import StatCard from "../../components/StatCard";
import LeaveTable from "../../components/LeaveTable";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { initials, avatarTone } from "../../utils/avatar";
import { dotTone } from "../../utils/tags";

const PAGE_SIZE = 4;
const TODAY = new Date().toISOString().slice(0, 10);

function fiscalLabel() {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const quarter = Math.floor(((now.getMonth() + 9) % 12) / 3) + 1;
  return { fy: `${year}/${String((year + 1) % 100).padStart(2, "0")}`, q: `Q${quarter} Active` };
}

function formatBack(toDate) {
  if (toDate === TODAY) return "Back Today";
  const d = new Date(toDate + "T00:00:00");
  const diffDays = Math.round((d - new Date(TODAY + "T00:00:00")) / 86400000);
  if (diffDays === 1) return "Back Tomorrow";
  return "Back " + d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [pendingAll, setPendingAll] = useState([]);
  const [awayToday, setAwayToday] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [deptFilter, setDeptFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [reviewing, setReviewing] = useState(null);
  const [remarks, setRemarks] = useState("");
  const toast = useToast();

  const load = () => {
    getSummaryReport().then(setSummary);
    // page_size: 200 - this panel needs every pending/approved request to paginate and
    // filter correctly client-side, not just the first paginated page from the API.
    getAllLeaves({ status: "pending", page_size: 200 }).then((data) => setPendingAll(data.results ?? data));
    getAllLeaves({ status: "approved", page_size: 200 }).then((data) => {
      const rows = data.results ?? data;
      setAwayToday(rows.filter((r) => r.from_date <= TODAY && TODAY <= r.to_date).slice(0, 5));
    });
  };

  useEffect(() => {
    load();
    getDepartments().then(setDepartments);
    getLeaveTypes().then(setLeaveTypes);
  }, []);

  const filtered = useMemo(() => {
    return pendingAll.filter(
      (r) =>
        (!deptFilter || r.department_name === deptFilter) &&
        (!typeFilter || r.leave_type_name === typeFilter)
    );
  }, [pendingAll, deptFilter, typeFilter]);

  useEffect(() => setPage(1), [deptFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openReview = (row, action) => {
    setReviewing({ row, action });
    setRemarks("");
  };

  const submitReview = async () => {
    try {
      if (reviewing.action === "approve") {
        await approveLeave(reviewing.row.id, remarks);
        toast("Request approved.", "success");
      } else {
        await rejectLeave(reviewing.row.id, remarks);
        toast("Request rejected.", "success");
      }
      setReviewing(null);
      load();
    } catch {
      toast("Action failed.", "error");
    }
  };

  const byStatus = summary?.by_status;
  const decided = (byStatus?.approved ?? 0) + (byStatus?.rejected ?? 0);
  const approvalRate = decided ? Math.round(((byStatus?.approved ?? 0) / decided) * 100) : null;
  const rejectionRate = decided ? Math.round(((byStatus?.rejected ?? 0) / decided) * 100) : null;
  const { fy, q } = fiscalLabel();

  const byType = summary?.by_type ?? [];
  const maxTypeDays = Math.max(1, ...byType.map((t) => t.total_days));
  const totalTypeDays = byType.reduce((sum, t) => sum + t.total_days, 0) || 1;
  const typeBarTone = ["bg-indigo-600", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-sky-500"];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Overview of employee leave applications, team availability, and approvals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Fiscal Year: <strong className="text-slate-800">{fy}</strong>
          </span>
          <span className="h-4 w-px bg-slate-300" />
          <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2.5 py-1 rounded-md font-medium">
            {q}
          </span>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon="pending"
          tone="warning"
          label="Pending Review"
          value={byStatus?.pending ?? "-"}
          badge={byStatus?.pending ? "Action Required" : null}
        />
        <StatCard
          icon="approved"
          tone="success"
          label="Approved"
          value={byStatus?.approved ?? "-"}
          badge={approvalRate !== null ? `${approvalRate}% approval rate` : null}
        />
        <StatCard
          icon="rejected"
          tone="danger"
          label="Declined Requests"
          value={byStatus?.rejected ?? "-"}
          badge={rejectionRate !== null ? `${rejectionRate}% rate` : null}
        />
        <StatCard
          icon="leave"
          tone="accent"
          label="Staff Away Today"
          value={awayToday.length}
          hint="on approved leave"
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <span>Pending Leave Requests</span>
                  {filtered.length > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Requires Review
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Approve or reject requests from team members.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="text-xs rounded-lg border border-slate-200 text-slate-700 py-1.5 pl-2.5 pr-8 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <select
                  className="text-xs rounded-lg border border-slate-200 text-slate-700 py-1.5 pl-2.5 pr-8 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Leave Types</option>
                  {leaveTypes.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <LeaveTable
              bare
              hideStatus
              rows={pageRows}
              showEmployee
              actions={(row) => (
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition-all border border-emerald-200 hover:border-emerald-600"
                    title="Approve"
                    onClick={() => openReview(row, "approve")}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-all border border-rose-200 hover:border-rose-600"
                    title="Reject"
                    onClick={() => openReview(row, "reject")}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            />

            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing{" "}
                <strong className="text-slate-700 font-semibold">
                  {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)}
                </strong>{" "}
                of <strong className="text-slate-700 font-semibold">{filtered.length}</strong> pending requests
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className={
                      "px-2.5 py-1 rounded font-medium " +
                      (n === page ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-100")
                    }
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
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

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Who's Away Today</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </h4>
            </div>
            <div className="space-y-3">
              {awayToday.length === 0 && <p className="text-xs text-slate-400">Everyone is in today.</p>}
              {awayToday.map((row) => {
                const tone = avatarTone(row.user_name);
                return (
                  <div key={row.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full font-semibold text-xs flex items-center justify-center ${tone.bg} ${tone.text}`}>
                        {initials(row.user_name)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{row.user_name}</div>
                        <div className="text-[11px] text-slate-400">
                          {row.department_name || "Unassigned"} • {row.leave_type_name}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {formatBack(row.to_date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
            <h4 className="font-bold text-slate-900 text-sm mb-1">Approved Leave Days by Type</h4>
            <p className="text-xs text-slate-500 mb-4">Share of approved leave days this period.</p>
            <div className="space-y-4">
              {byType.length === 0 && <p className="text-xs text-slate-400">No approved leave yet.</p>}
              {byType.map((t, i) => (
                <div key={t.leave_type__name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${dotTone(t.leave_type__name)}`} />
                      {t.leave_type__name}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {Math.round((t.total_days / totalTypeDays) * 100)}%{" "}
                      <span className="text-slate-400 font-normal">({t.total_days}d)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${typeBarTone[i % typeBarTone.length]}`}
                      style={{ width: `${(t.total_days / maxTypeDays) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {reviewing && (
        <Modal
          title={`${reviewing.action === "approve" ? "Approve" : "Reject"} request from ${reviewing.row.user_name}`}
          onClose={() => setReviewing(null)}
        >
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Remarks (optional)</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
          </div>
          <button
            className={
              "inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all text-white " +
              (reviewing.action === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700")
            }
            onClick={submitReview}
          >
            Confirm {reviewing.action === "approve" ? "Approval" : "Rejection"}
          </button>
        </Modal>
      )}
    </div>
  );
}
