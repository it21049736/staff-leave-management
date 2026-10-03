import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  "Apply for leave and track approvals in real time",
  "Managers review and approve requests in one place",
  "Live balances, history and reports for every team",
];

const INPUT =
  "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors";
const LABEL = "text-xs font-semibold text-slate-600 mb-1.5 block";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(username, password);
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Invalid username or password."
          : "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1.1fr_1fr]">
      <div className="hidden md:flex flex-col justify-center px-16 py-12 bg-gradient-to-br from-indigo-700 to-indigo-600 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 85% 10%, rgba(255,255,255,0.16) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(255,255,255,0.12) 0%, transparent 40%)",
          }}
        />
        <div className="relative">
          <div className="w-14 h-14 rounded-xl bg-white/90 border border-white/30 flex items-center justify-center p-1.5 mb-6 shadow-lg">
            <img src="/logo.png" alt="StaffLeave OS" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 max-w-md">Staff Leave Management</h1>
          <p className="text-white/85 text-base leading-relaxed max-w-sm mb-8">
            One place for your team to request, review and track leave — built for HR teams and
            employees alike.
          </p>
          <ul className="flex flex-col gap-3.5 max-w-sm">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-white/90 leading-snug">
                <svg className="w-[18px] h-[18px] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <form className="bg-white border border-slate-200 rounded-2xl shadow-xl p-9 w-full max-w-sm flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Sign in</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to continue</p>
          </div>
          {error && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-lg px-3 py-2 text-xs font-medium">
              {error}
            </div>
          )}
          <div>
            <label className={LABEL}>Username</label>
            <input className={INPUT} value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className={LABEL}>Password</label>
            <input
              className={INPUT}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
