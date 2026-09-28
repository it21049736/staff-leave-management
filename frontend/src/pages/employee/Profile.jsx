import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { changePassword, updateMe } from "../../api/auth";
import { useToast } from "../../components/Toast";
import { initials, avatarTone } from "../../utils/avatar";

const LABEL = "text-xs font-semibold text-slate-600 mb-1.5 block";
const INPUT =
  "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors";
const BTN =
  "inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all";

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    designation: user?.designation || "",
  });
  const [pwForm, setPwForm] = useState({ old_password: "", new_password: "" });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateMe(form);
      setUser(updated);
      toast("Profile updated.", "success");
    } catch {
      toast("Could not update profile.", "error");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword(pwForm.old_password, pwForm.new_password);
      setPwForm({ old_password: "", new_password: "" });
      toast("Password changed.", "success");
    } catch (err) {
      toast(err.response?.data?.old_password?.[0] || "Could not change password.", "error");
    }
  };

  const tone = avatarTone(user?.full_name);

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-full font-bold flex items-center justify-center text-xl shrink-0 ring-2 ring-indigo-500/20 ${tone.bg} ${tone.text}`}>
          {initials(user?.full_name)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.full_name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {user?.designation || (user?.role === "admin" ? "Admin / HR" : "Employee")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 text-base mb-4">Details</h3>
        <form className="flex flex-col gap-4" onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>First name</label>
              <input
                className={INPUT}
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className={LABEL}>Last name</label>
              <input
                className={INPUT}
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={LABEL}>Email</label>
            <input
              type="email"
              className={INPUT}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className={LABEL}>Designation</label>
            <input
              className={INPUT}
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
            />
          </div>
          <button className={BTN} type="submit">
            Save Changes
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 text-base mb-4">Change Password</h3>
        <form className="flex flex-col gap-4" onSubmit={handlePasswordSubmit}>
          <div>
            <label className={LABEL}>Current password</label>
            <input
              type="password"
              className={INPUT}
              value={pwForm.old_password}
              onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={LABEL}>New password</label>
            <input
              type="password"
              className={INPUT}
              value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
              required
            />
          </div>
          <button className={BTN} type="submit">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
