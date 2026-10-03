import { useEffect, useState } from "react";
import { createUser, getDepartments, getUsers, resetUserPassword, updateUser } from "../../api/users";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { initials, avatarTone } from "../../utils/avatar";
import { tagTone } from "../../utils/tags";

const LABEL = "text-xs font-semibold text-slate-600 mb-1.5 block";
const INPUT =
  "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors";

const emptyForm = {
  username: "",
  password: "",
  email: "",
  first_name: "",
  last_name: "",
  role: "employee",
  department: "",
  designation: "",
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [resetResult, setResetResult] = useState(null); // { user, tempPassword }
  const toast = useToast();

  const load = () => getUsers().then(setUsers);

  useEffect(() => {
    load();
    getDepartments().then(setDepartments);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createUser({ ...form, department: form.department || null });
      toast("Employee added.", "success");
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === "string" ? data : data ? Object.values(data).flat().join(" ") : "Could not create user.");
    }
  };

  const toggleActive = async (user) => {
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      toast(`User ${user.is_active ? "deactivated" : "activated"}.`, "success");
      load();
    } catch {
      toast("Could not update user status.", "error");
    }
  };

  const handleResetPassword = async (user) => {
    if (!confirm(`Reset ${user.full_name}'s password? Their current password will stop working immediately.`)) return;
    try {
      const { temp_password } = await resetUserPassword(user.id);
      setResetResult({ user, tempPassword: temp_password });
    } catch {
      toast("Could not reset password.", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Users</h2>
          <p className="text-sm text-slate-500 mt-0.5">Add employees, assign departments, and manage access.</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          onClick={() => setShowForm(true)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Add Employee
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200/80 tracking-wider">
            <tr>
              <th className="py-3 pl-4 pr-2">Employee</th>
              <th className="py-3 px-2">Role</th>
              <th className="py-3 px-2">Department</th>
              <th className="py-3 px-2">Designation</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 pl-2 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-slate-400 py-12">
                  No employees yet.
                </td>
              </tr>
            )}
            {users.map((u) => {
              const tone = avatarTone(u.full_name || u.username);
              return (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="py-3 pl-4 pr-2 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-[11px] shrink-0 ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}>
                        {initials(u.full_name)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{u.full_name}</div>
                        <div className="text-[11px] text-slate-400">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <span
                      className={
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize border " +
                        (u.role === "admin"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-slate-100 text-slate-600 border-slate-200")
                      }
                    >
                      {u.role === "admin" ? "Admin / HR" : "Employee"}
                    </span>
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    {u.department_name ? (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border ${tagTone(u.department_name)}`}>
                        {u.department_name}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap text-slate-600">{u.designation || "-"}</td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <span
                      className={
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border " +
                        (u.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200")
                      }
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 pl-2 pr-4 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                        onClick={() => handleResetPassword(u)}
                      >
                        Reset Password
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                        onClick={() => toggleActive(u)}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Add Employee" onClose={() => setShowForm(false)}>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-lg px-3 py-2 text-xs font-medium">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>First name</label>
                <input className={INPUT} name="first_name" maxLength={150} value={form.first_name} onChange={handleChange} required />
              </div>
              <div>
                <label className={LABEL}>Last name</label>
                <input className={INPUT} name="last_name" maxLength={150} value={form.last_name} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Username</label>
                <input className={INPUT} name="username" maxLength={150} value={form.username} onChange={handleChange} required />
              </div>
              <div>
                <label className={LABEL}>Password</label>
                <input className={INPUT} type="password" name="password" minLength={8} value={form.password} onChange={handleChange} required />
                <p className="text-[11px] text-slate-400 mt-1">At least 8 characters.</p>
              </div>
            </div>
            <div>
              <label className={LABEL}>Email</label>
              <input className={INPUT} type="email" name="email" maxLength={254} value={form.email} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Role</label>
                <select className={INPUT} name="role" value={form.role} onChange={handleChange}>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin/HR</option>
                </select>
              </div>
              <div>
                <label className={LABEL}>Department</label>
                <select className={INPUT} name="department" value={form.department} onChange={handleChange}>
                  <option value="">None</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={LABEL}>Designation</label>
              <input className={INPUT} name="designation" maxLength={100} value={form.designation} onChange={handleChange} />
            </div>
            <button
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
              type="submit"
            >
              Create Employee
            </button>
          </form>
        </Modal>
      )}

      {resetResult && (
        <Modal title={`Password reset for ${resetResult.user.full_name}`} onClose={() => setResetResult(null)}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Share this temporary password with <strong>{resetResult.user.full_name}</strong> directly — it won't be
              shown again. They should change it after signing in.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-900 tracking-wide">
                {resetResult.tempPassword}
              </code>
              <button
                className="shrink-0 px-3 py-2.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                onClick={() => {
                  navigator.clipboard?.writeText(resetResult.tempPassword);
                  toast("Copied to clipboard.", "success");
                }}
              >
                Copy
              </button>
            </div>
            <button
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
              onClick={() => setResetResult(null)}
            >
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
