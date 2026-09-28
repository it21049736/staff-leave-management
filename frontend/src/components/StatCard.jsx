const ICONS = {
  pending: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  approved: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  rejected: <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  cancelled: <path d="M18 6 6 18M6 6l12 12" />,
  leave: <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
};

const TONES = {
  warning: { iconBg: "bg-amber-50 border-amber-100 text-amber-600", hover: "hover:border-amber-300", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  success: { iconBg: "bg-emerald-50 border-emerald-100 text-emerald-600", hover: "hover:border-emerald-300", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  danger: { iconBg: "bg-rose-50 border-rose-100 text-rose-600", hover: "hover:border-rose-300", badge: "bg-slate-100 text-slate-600 border-slate-200" },
  accent: { iconBg: "bg-indigo-50 border-indigo-100 text-indigo-600", hover: "hover:border-indigo-300", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  neutral: { iconBg: "bg-slate-100 border-slate-200 text-slate-500", hover: "hover:border-slate-300", badge: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function StatCard({ label, value, hint, badge, icon, tone = "accent" }) {
  const t = TONES[tone] || TONES.accent;
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm transition-all ${t.hover}`}>
      <div className="flex items-start justify-between">
        {icon && (
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${t.iconBg}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              {ICONS[icon]}
            </svg>
          </div>
        )}
        {badge && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${t.badge}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
          {hint && <span className="text-xs text-slate-500">{hint}</span>}
        </div>
      </div>
    </div>
  );
}
