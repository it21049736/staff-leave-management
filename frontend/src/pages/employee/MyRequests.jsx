import { useEffect, useState } from "react";
import { cancelLeave, getMyLeaves } from "../../api/leaves";
import LeaveTable from "../../components/LeaveTable";
import { useToast } from "../../components/Toast";

export default function MyRequests() {
  const [rows, setRows] = useState([]);
  const toast = useToast();

  const load = () => getMyLeaves({ status: "pending" }).then((data) => setRows(data.results ?? data));

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this leave request?")) return;
    try {
      await cancelLeave(id);
      toast("Request cancelled.", "success");
      load();
    } catch {
      toast("Could not cancel request.", "error");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Pending Requests</h2>
        <p className="text-sm text-slate-500 mt-0.5">Track requests awaiting approval, or cancel them if plans change.</p>
      </div>
      <LeaveTable
        rows={rows}
        actions={(row) =>
          row.status === "pending" && (
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg text-xs font-semibold transition-all"
              onClick={() => handleCancel(row.id)}
            >
              Cancel
            </button>
          )
        }
      />
    </div>
  );
}
