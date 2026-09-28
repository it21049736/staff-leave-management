import { useEffect, useState } from "react";
import { createLeaveType, deleteLeaveType, getLeaveTypes, updateLeaveType } from "../../api/leaves";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { dotTone } from "../../utils/tags";

const LABEL = "text-xs font-semibold text-slate-600 mb-1.5 block";
const INPUT =
  "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors";

const emptyForm = { name: "", default_days: 0, requires_document: false };

export default function LeavePolicy() {
  const [types, setTypes] = useState([]);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const toast = useToast();

  const load = () => getLeaveTypes().then(setTypes);

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm(emptyForm);
    setError("");
    setEditing({});
  };

  const openEdit = (lt) => {
    setForm({ name: lt.name, default_days: lt.default_days, requires_document: lt.requires_document });
    setError("");
    setEditing(lt);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, default_days: Number(form.default_days) };
      if (editing.id) {
        await updateLeaveType(editing.id, payload);
        toast("Leave type updated.", "success");
      } else {
        await createLeaveType(payload);
        toast("Leave type created.", "success");
      }
      setEditing(null);
      load();
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === "string" ? data : data ? Object.values(data).flat().join(" ") : "Could not save leave type.");
    }
  };

  const handleDelete = async (lt) => {
    if (!confirm(`Delete "${lt.name}"? This can't be undone.`)) return;
    try {
      await deleteLeaveType(lt.id);
      toast("Leave type deleted.", "success");
      load();
    } catch (err) {
      toast(err.response?.data?.detail || "Could not delete leave type.", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Policy</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Define leave types, their annual entitlement, and whether supporting documents are required.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          onClick={openNew}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          New Leave Type
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {types.length === 0 && (
          <div className="col-span-full text-center text-slate-400 py-12 bg-white rounded-2xl border border-slate-200/90">
            No leave types defined yet.
          </div>
        )}
        {types.map((lt) => (
          <div key={lt.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${dotTone(lt.name)}`} />
                <h3 className="font-bold text-slate-900 text-sm">{lt.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Edit"
                  onClick={() => openEdit(lt)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 013 3L12 16l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete"
                  onClick={() => handleDelete(lt)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {lt.default_days > 0 ? lt.default_days : "Unlimited"}
              </span>
              {lt.default_days > 0 && <span className="text-xs text-slate-500">days / year</span>}
            </div>
            <span
              className={
                "inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full text-[11px] font-semibold border w-max " +
                (lt.requires_document
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-slate-100 text-slate-500 border-slate-200")
              }
            >
              {lt.requires_document ? "Document required" : "No document required"}
            </span>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing.id ? `Edit ${editing.name}` : "New Leave Type"} onClose={() => setEditing(null)}>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-lg px-3 py-2 text-xs font-medium">
                {error}
              </div>
            )}
            <div>
              <label className={LABEL}>Name</label>
              <input className={INPUT} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className={LABEL}>Default days per year (0 = unlimited)</label>
              <input
                type="number"
                min={0}
                className={INPUT}
                value={form.default_days}
                onChange={(e) => setForm({ ...form, default_days: e.target.value })}
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                checked={form.requires_document}
                onChange={(e) => setForm({ ...form, requires_document: e.target.checked })}
              />
              Requires supporting document
            </label>
            <button
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
              type="submit"
            >
              {editing.id ? "Save Changes" : "Create Leave Type"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
