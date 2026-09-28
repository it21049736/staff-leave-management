import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

import EmployeeDashboard from "./pages/employee/Dashboard";
import ApplyLeave from "./pages/employee/ApplyLeave";
import MyRequests from "./pages/employee/MyRequests";
import History from "./pages/employee/History";
import Profile from "./pages/employee/Profile";

import AdminDashboard from "./pages/admin/Dashboard";
import ReviewRequests from "./pages/admin/ReviewRequests";
import LeaveRecords from "./pages/admin/LeaveRecords";
import Reports from "./pages/admin/Reports";
import ManageUsers from "./pages/admin/ManageUsers";
import LeavePolicy from "./pages/admin/LeavePolicy";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/apply" element={<ProtectedRoute><ApplyLeave /></ProtectedRoute>} />
            <Route path="/my-requests" element={<ProtectedRoute role="employee"><MyRequests /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute role="employee"><History /></ProtectedRoute>} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/requests" element={<ProtectedRoute role="admin"><ReviewRequests /></ProtectedRoute>} />
            <Route path="/admin/records" element={<ProtectedRoute role="admin"><LeaveRecords /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>} />
            <Route path="/admin/policy" element={<ProtectedRoute role="admin"><LeavePolicy /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
