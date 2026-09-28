import { useEffect, useState } from "react";
import { getBalances, getMyLeaves } from "../../api/leaves";
import StatCard from "../../components/StatCard";
import LeaveTable from "../../components/LeaveTable";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [balances, setBalances] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    getBalances().then(setBalances);
    getMyLeaves().then((data) => setRecent((data.results ?? data).slice(0, 5)));
  }, []);

  const pending = recent.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome, {user?.full_name}</h2>
        <p className="text-sm text-slate-500 mt-0.5">Here's your leave balance and recent activity.</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {balances.map((b) => (
          <StatCard
            key={b.id}
            icon="leave"
            tone="accent"
            label={b.leave_type_name}
            value={`${b.remaining} / ${b.entitled_days}`}
            hint="days remaining"
          />
        ))}
        <StatCard icon="pending" tone="warning" label="Pending Requests" value={pending} />
      </section>

      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-3">Recent Requests</h3>
        <LeaveTable rows={recent} />
      </div>
    </div>
  );
}
