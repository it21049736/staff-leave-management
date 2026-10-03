import StatusTag from "./StatusTag";
import Avatar from "./Avatar";
import { tagTone, dotTone } from "../utils/tags";

function formatShort(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDuration(row) {
  if (row.from_date === row.to_date) return formatShort(row.from_date);
  return `${formatShort(row.from_date)} - ${formatShort(row.to_date)}`;
}

export default function LeaveTable({ rows, showEmployee = false, actions, bare = false, hideStatus = false }) {
  const colSpan = (showEmployee ? 3 : 1) + (hideStatus ? 4 : 5) + (actions ? 1 : 0);

  return (
    <div className={bare ? "overflow-x-auto" : "overflow-x-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm"}>
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200/80 tracking-wider">
          <tr>
            {showEmployee && <th className="py-3 pl-4 pr-2">Employee</th>}
            {showEmployee && <th className="py-3 px-2">Department</th>}
            <th className="py-3 px-2">Leave Type</th>
            <th className="py-3 px-2">Duration</th>
            <th className="py-3 px-2">Reason</th>
            {!hideStatus && <th className="py-3 px-2">Status</th>}
            <th className="py-3 px-2">Applied</th>
            {actions && <th className="py-3 pl-2 pr-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && (
            <tr>
              <td colSpan={colSpan} className="text-center text-slate-400 py-12">
                No records found.
              </td>
            </tr>
          )}
          {rows.map((row) => {
            return (
              <tr key={row.id} className="hover:bg-slate-50/60 transition-colors group">
                {showEmployee && (
                  <td className="py-3.5 pl-4 pr-2 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={row.user_name} avatarUrl={row.avatar_url} size="sm" ring />
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {row.user_name}
                      </div>
                    </div>
                  </td>
                )}
                {showEmployee && (
                  <td className="py-3.5 px-2 whitespace-nowrap">
                    {row.department_name ? (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border ${tagTone(row.department_name)}`}>
                        {row.department_name}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                )}
                <td className="py-3.5 px-2 whitespace-nowrap">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dotTone(row.leave_type_name)}`} />
                    {row.leave_type_name}
                  </span>
                </td>
                <td className="py-3.5 px-2 whitespace-nowrap">
                  <div className="font-semibold text-slate-800">{formatDuration(row)}</div>
                  <div className="text-[11px] text-slate-400">{row.days} day{row.days === 1 ? "" : "s"}</div>
                </td>
                <td className="py-3.5 px-2 max-w-[110px] truncate text-slate-600" title={row.reason}>
                  {row.reason}
                </td>
                {!hideStatus && (
                  <td className="py-3.5 px-2 whitespace-nowrap">
                    <StatusTag status={row.status} />
                  </td>
                )}
                <td className="py-3.5 px-2 whitespace-nowrap text-slate-500">{formatShort(row.applied_on)}</td>
                {actions && <td className="py-3.5 pl-2 pr-4 whitespace-nowrap text-right">{actions(row)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
