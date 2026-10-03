import { useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { changePassword, removeAvatar, updateMe, uploadAvatar } from "../../api/auth";
import { useToast } from "../../components/Toast";
import Avatar from "../../components/Avatar";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

const LABEL = "text-xs font-semibold text-slate-600 mb-1.5 block";
const INPUT =
  "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors";
const BTN =
  "inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50";

function extractError(err, fallback) {
  const data = err.response?.data;
  if (typeof data === "string") return data;
  if (data) return Object.values(data).flat().join(" ");
  return fallback;
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    designation: user?.designation || "",
  });
  const [pwForm, setPwForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [pwError, setPwError] = useState("");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarPick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast("Only JPEG, PNG, or WebP images are allowed.", "error");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast("Image must be 2MB or smaller.", "error");
      return;
    }

    setAvatarBusy(true);
    try {
      const updated = await uploadAvatar(file);
      setUser(updated);
      toast("Profile photo updated.", "success");
    } catch (err) {
      toast(extractError(err, "Could not upload photo."), "error");
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarBusy(true);
    try {
      const updated = await removeAvatar();
      setUser(updated);
      toast("Profile photo removed.", "success");
    } catch (err) {
      toast(extractError(err, "Could not remove photo."), "error");
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateMe(form);
      setUser(updated);
      toast("Profile updated.", "success");
    } catch (err) {
      toast(extractError(err, "Could not update profile."), "error");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError("New password and confirmation do not match.");
      return;
    }
    try {
      await changePassword(pwForm.old_password, pwForm.new_password);
      setPwForm({ old_password: "", new_password: "", confirm_password: "" });
      toast("Password changed.", "success");
    } catch (err) {
      setPwError(extractError(err, "Could not change password."));
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar name={user?.full_name} avatarUrl={user?.avatar_url} size="xl" ring />
          <button
            type="button"
            onClick={handleAvatarPick}
            disabled={avatarBusy}
            title="Change photo"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-sm border-2 border-white transition-colors disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.full_name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {user?.designation || (user?.role === "admin" ? "Admin / HR" : "Employee")}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <button
              type="button"
              onClick={handleAvatarPick}
              disabled={avatarBusy}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              {avatarBusy ? "Uploading..." : "Change photo"}
            </button>
            {user?.avatar_url && (
              <button
                type="button"
                onClick={handleAvatarRemove}
                disabled={avatarBusy}
                className="text-xs font-semibold text-slate-400 hover:text-rose-600 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
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
                maxLength={150}
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className={LABEL}>Last name</label>
              <input
                className={INPUT}
                maxLength={150}
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
              maxLength={254}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className={LABEL}>Designation</label>
            <input
              className={INPUT}
              maxLength={100}
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
          {pwError && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-lg px-3 py-2 text-xs font-medium">
              {pwError}
            </div>
          )}
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
              minLength={8}
              value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">At least 8 characters.</p>
          </div>
          <div>
            <label className={LABEL}>Confirm new password</label>
            <input
              type="password"
              className={INPUT}
              minLength={8}
              value={pwForm.confirm_password}
              onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
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
