import { useEffect, useMemo, useState } from "react";
import { approveLeave, getAllLeaves, rejectLeave } from "../../api/leaves";
import { useToast } from "../../components/Toast";
import Avatar from "../../components/Avatar";
import { dotTone } from "../../utils/tags";

const TABS = [
  { key: "pending", label: "Pending Review" },
  { key: "clashing", label: "Escalated / Clashing" },
  { key: "approved", label: "Recently Approved" },
  { key: "all", label: "All History" },
];

function formatShort(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatPeriod(row) {
  if (row.from_date === row.to_date) return formatShort(row.from_date);
  return `${formatShort(row.from_date)} - ${formatShort(row.to_date)}`;
}

function rangesOverlap(aFrom, aTo, bFrom, bTo) {
  return aFrom <= bTo && bFrom <= aTo;
}

export default function ReviewRequests() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("pending");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [inspectingId, setInspectingId] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  // This page needs the whole company's leave history (for tabs + conflict
  // detection across all requests), not one paginated page of it.
  const load = () => getAllLeaves({ page_size: 200 }).then((data) => setRows(data.results ?? data));

  useEffect(() => {
    load();
  }, []);

  // Real conflict detection: same department, overlapping dates, different employee,
  // among requests that are pending or approved.
  const clashMap = useMemo(() => {
    const map = new Map();
    const active = rows.filter((r) => r.status === "pending" || r.status === "approved");
    for (const r of active) {
      if (!r.department_name) continue;
      const conflicts = active.filter(
        (o) =>
          o.id !== r.id &&
          o.department_name === r.department_name &&
          o.user !== r.user &&
          rangesOverlap(r.from_date, r.to_date, o.from_date, o.to_date)
      );
      if (conflicts.length) map.set(r.id, conflicts);
    }
    return map;
  }, [rows]);

  const pending = useMemo(() => rows.filter((r) => r.status === "pending"), [rows]);
  const clashing = useMemo(() => pending.filter((r) => clashMap.has(r.id)), [pending, clashMap]);
  const approvedRecent = useMemo(() => rows.filter((r) => r.status === "approved"), [rows]);

  const tabRows = { pending, clashing, approved: approvedRecent, all: rows }[tab];

  useEffect(() => {
    setSelectedIds(new Set());
    setInspectingId(tabRows[0]?.id ?? null);
  }, [tab, rows]); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = rows.find((r) => r.id === inspectingId) || null;

  useEffect(() => {
    setNote("");
  }, [inspectingId]);

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const act = async (id, action, remarks = "") => {
    setBusy(true);
    try {
      if (action === "approve") await approveLeave(id, remarks);
      else await rejectLeave(id, remarks);
      toast(`Request ${action === "approve" ? "approved" : "rejected"}.`, "success");
      load();
    } catch {
      toast("Action failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  const batchAct = async (action) => {
    setBusy(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => (action === "approve" ? approveLeave(id) : rejectLeave(id)))
      );
      toast(`${selectedIds.size} request(s) ${action === "approve" ? "approved" : "rejected"}.`, "success");
      load();
    } catch {
      toast("Batch action failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Review Requests</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {pending.length} Pending
            </span>
          </div>
          <p className="text-slate-500 text-sm max-w-2xl">
            Approve, reject or inspect employee leave applications, with real overlap detection against
            teammates in the same department.
          </p>
        </div>

        {tab === "pending" && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <span className="text-xs text-slate-600 font-medium px-2">{selectedIds.size} Selected</span>
            <button
              disabled={!selectedIds.size || busy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold transition-colors shadow-sm"
              onClick={() => batchAct("approve")}
            >
              Batch Approve
            </button>
            <button
              disabled={!selectedIds.size || busy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 disabled:opacity-40 disabled:pointer-events-none text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
              onClick={() => batchAct("reject")}
            >
              Batch Reject
            </button>
          </div>
        )}
      </section>

      {clashing.length > 0 && (
        <section className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-amber-950 text-sm font-bold">
                {clashing.length} pending request{clashing.length === 1 ? "" : "s"} overlap with a teammate's leave
              </h3>
              <p className="text-amber-900/80 text-xs mt-0.5">
                Same-department requests with overlapping dates — review these before approving to avoid coverage gaps.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start shadow-sm">
        {TABS.map((t) => {
          const count = { pending, clashing, approved: approvedRecent, all: rows }[t.key].length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                "px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all " +
                (tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")
              }
            >
              <span>{t.label}</span>
              <span
                className={
                  "text-[11px] px-1.5 py-0.5 rounded-full font-bold border " +
                  (t.key === "clashing"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200")
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Leave Applications</span>
            <span className="text-xs text-slate-500">{tabRows.length} record{tabRows.length === 1 ? "" : "s"}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                  {tab === "pending" && <th className="py-3 px-4 w-8"></th>}
                  <th className="py-3 px-3">Employee &amp; Dept</th>
                  <th className="py-3 px-3">Type &amp; Period</th>
                  <th className="py-3 px-3">Quota Left</th>
                  <th className="py-3 px-3">Conflict Radar</th>
                  <th className="py-3 px-3 text-right pr-4">{tab === "pending" ? "Quick Decision" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tabRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-400 py-12">
                      No records in this view.
                    </td>
                  </tr>
                )}
                {tabRows.map((row) => {
                  const conflicts = clashMap.get(row.id);
                  const entitled = row.balance_entitled;
                  const used = row.balance_used ?? 0;
                  const pct = entitled ? Math.min(100, Math.round((used / entitled) * 100)) : 0;
                  const isSelected = selectedIds.has(row.id);
                  const isInspecting = row.id === inspectingId;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setInspectingId(row.id)}
                      className={
                        "transition-colors cursor-pointer group " +
                        (isInspecting ? "bg-indigo-50/40 border-l-4 border-l-indigo-600" : "hover:bg-slate-50 border-l-4 border-l-transparent")
                      }
                    >
                      {tab === "pending" && (
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                            checked={isSelected}
                            onChange={() => toggleRow(row.id)}
                          />
                        </td>
                      )}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={row.user_name} avatarUrl={row.avatar_url} size="md" ring />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{row.user_name}</span>
                            {row.designation && <span className="text-[11px] text-slate-500">{row.designation}</span>}
                            {row.department_name && (
                              <span className="mt-0.5 inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono w-max border border-slate-200">
                                {row.department_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`size-2 rounded-full ${dotTone(row.leave_type_name)}`} />
                            <span className="font-semibold text-slate-900">{row.leave_type_name}</span>
                          </div>
                          <span className="text-[11px] text-slate-600 font-mono">{formatPeriod(row)}</span>
                          <span className="text-[10px] text-slate-400">{row.days} day{row.days === 1 ? "" : "s"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        {entitled ? (
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-slate-800 text-xs font-semibold">
                              {used} <span className="text-slate-400 font-normal">/ {entitled}d</span>
                            </span>
                            <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${pct >= 90 ? "bg-rose-500" : "bg-indigo-600"}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unlimited</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {conflicts ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Overlaps {conflicts[0].user_name.split(" ")[0]}
                            {conflicts.length > 1 ? ` +${conflicts.length - 1}` : ""}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            No Clash
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right pr-4">
                        {row.status === "pending" ? (
                          <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              disabled={busy}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition-all disabled:opacity-40"
                              title="Approve"
                              aria-label="Approve request"
                              onClick={() => act(row.id, "approve")}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <button
                              disabled={busy}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition-all disabled:opacity-40"
                              title="Reject"
                              aria-label="Reject request"
                              onClick={() => act(row.id, "reject")}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <span
                            className={
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize border " +
                              (row.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : row.status === "rejected"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-100 text-slate-500 border-slate-200")
                            }
                          >
                            {row.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          {!selected ? (
            <p className="text-sm text-slate-400 text-center py-10">Select a request to inspect it here.</p>
          ) : (
            <>
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.user_name} avatarUrl={selected.avatar_url} size="lg" ring />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-slate-900 text-base font-bold">{selected.user_name}</h3>
                      {selected.status === "pending" && clashMap.has(selected.id) && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Action Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      {selected.designation || "—"} {selected.department_name ? `· ${selected.department_name}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-center">
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Type</span>
                  <span className="text-xs font-bold text-slate-900 mt-1">{selected.leave_type_name}</span>
                </div>
                <div className="flex flex-col border-x border-slate-200 px-2">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Duration</span>
                  <span className="text-xs font-bold text-slate-900 mt-1">{selected.days} day{selected.days === 1 ? "" : "s"}</span>
                  <span className="text-[10px] text-slate-500">{formatPeriod(selected)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Remaining</span>
                  <span className="text-xs font-bold text-emerald-600 mt-1">
                    {selected.balance_entitled
                      ? `${Math.max(0, selected.balance_entitled - (selected.balance_used ?? 0) - selected.days)}d left`
                      : "Unlimited"}
                  </span>
                  <span className="text-[10px] text-slate-400">After this request</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Employee Reason</span>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selected.reason || <span className="text-slate-400">No reason provided.</span>}
                </div>
              </div>

              {clashMap.has(selected.id) && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-amber-700">
                    Team Availability Conflict
                  </span>
                  <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-200 space-y-1.5 text-xs">
                    {clashMap.get(selected.id).map((c) => (
                      <div key={c.id} className="flex items-center justify-between bg-amber-100/70 border border-amber-300 px-2.5 py-1.5 rounded-lg text-amber-900 text-[11px]">
                        <span className="font-semibold flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-amber-500" /> {c.user_name} ({c.leave_type_name})
                        </span>
                        <span className="font-mono text-[10px] font-medium text-amber-800">{formatPeriod(c)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.balance_entitled != null && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Accrual Balance</span>
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Entitled: <strong className="text-slate-900">{selected.balance_entitled}d</strong></span>
                      <span>Used: <strong className="text-slate-900">{selected.balance_used}d</strong></span>
                      <span>This request: <strong className="text-indigo-600">{selected.days}d</strong></span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 flex overflow-hidden">
                      <div className="bg-slate-400 h-full" style={{ width: `${Math.min(100, (selected.balance_used / selected.balance_entitled) * 100)}%` }} />
                      <div className="bg-indigo-600 h-full" style={{ width: `${Math.min(100, (selected.days / selected.balance_entitled) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {selected.status === "pending" ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Internal HR Note (optional)</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-0 resize-none transition-colors"
                    placeholder="Add an approval note or coverage requirement..."
                    rows={2}
                    maxLength={1000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      disabled={busy}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                      onClick={() => act(selected.id, "approve", note)}
                    >
                      Approve Request
                    </button>
                    <button
                      disabled={busy}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-all disabled:opacity-50"
                      onClick={() => act(selected.id, "reject", note)}
                    >
                      Decline Request
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 flex flex-col gap-1">
                  <span>
                    Status: <span className="font-semibold capitalize text-slate-800">{selected.status}</span>
                    {selected.reviewed_by_name && <> by {selected.reviewed_by_name}</>}
                  </span>
                  {selected.remarks && <span>Note: {selected.remarks}</span>}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
