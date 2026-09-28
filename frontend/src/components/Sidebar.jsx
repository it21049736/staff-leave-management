import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllLeaves } from "../api/leaves";
import { initials } from "../utils/avatar";

const ICONS = {
  dashboard: (
    <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  ),
  apply: <path d="M12 4v16m8-8H4" />,
  requests: <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  history: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  reports: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  users: <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
  policy: (
    <>
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </>
  ),
  profile: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
};

function Icon({ name, className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const [pendingCount, setPendingCount] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    getAllLeaves({ status: "pending" }).then((data) => {
      const rows = data.results ?? data;
      setPendingCount(data.count ?? rows.length);
    });
  }, [isAdmin]);

  const links = isAdmin
    ? [
        { to: "/admin", label: "Dashboard", end: true, icon: "dashboard" },
        { to: "/admin/requests", label: "Review Requests", icon: "requests", badge: pendingCount },
        { to: "/admin/records", label: "Leave Records", icon: "history" },
        { to: "/admin/reports", label: "Reports & Trends", icon: "reports" },
        { to: "/admin/users", label: "Manage Users", icon: "users" },
        { to: "/admin/policy", label: "Leave Policy", icon: "policy" },
        { to: "/profile", label: "My Profile", icon: "profile" },
      ]
    : [
        { to: "/", label: "Dashboard", end: true, icon: "dashboard" },
        { to: "/apply", label: "Apply Leave", icon: "apply" },
        { to: "/my-requests", label: "My Requests", icon: "requests" },
        { to: "/history", label: "History", icon: "history" },
        { to: "/profile", label: "My Profile", icon: "profile" },
      ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 z-20">
      <div className="p-5 flex flex-col h-full overflow-y-auto">
        <div className="flex items-center gap-3 px-2 py-1 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-200">
            SL
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-base leading-tight">
              StaffLeave <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">OS</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {isAdmin ? "Admin / HR Hub" : "Employee Portal"}
            </p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group " +
                (isActive
                  ? "bg-indigo-50/80 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70")
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon name={link.icon} className={"w-5 h-5 " + (isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                    <span>{link.label}</span>
                  </div>
                  {!!link.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {link.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-indigo-500/20">
            {initials(user?.full_name)}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-slate-900 truncate">{user?.full_name}</div>
            <div className="text-xs text-slate-500 truncate">{user?.email || (isAdmin ? "Admin / HR" : "Employee")}</div>
          </div>
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50/60 border border-slate-200 rounded-lg transition shadow-sm"
          onClick={logout}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
