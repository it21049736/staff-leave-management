import { useNavigate } from "react-router-dom";
import LeaveForm from "../../components/LeaveForm";
import { applyLeave } from "../../api/leaves";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";

export default function ApplyLeave() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const handleSubmit = async (data) => {
    await applyLeave(data);
    toast("Leave request submitted.", "success");
    navigate(user?.role === "admin" ? "/admin" : "/my-requests");
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Apply for Leave</h2>
        <p className="text-sm text-slate-500 mt-0.5">Submit a new leave request for approval.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 max-w-lg">
        <LeaveForm onSubmit={handleSubmit} submitLabel="Submit Request" />
      </div>
    </div>
  );
}
