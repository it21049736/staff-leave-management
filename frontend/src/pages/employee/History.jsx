import { useEffect, useState } from "react";
import { getMyLeaves } from "../../api/leaves";
import LeaveTable from "../../components/LeaveTable";

export default function History() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const params = status ? { status } : {};
    getMyLeaves(params).then((data) => setRows(data.results ?? data));
  }, [status]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Leave History</h2>
        <p className="text-sm text-slate-500 mt-0.5">Every leave request you've made, past and present.</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select
          className="text-xs rounded-lg border border-slate-200 text-slate-700 py-1.5 pl-2.5 pr-8 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <LeaveTable rows={rows} />
    </div>
  );
}
