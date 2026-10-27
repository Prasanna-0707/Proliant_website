
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Pages
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminEmployees from "./pages/Admin/Employees";
import EmployeesTemp from "./pages/Admin/EmployeesTemp";
import AdminTeamMembers from "./pages/Admin/TeamMembers";
import Countries from "./pages/Admin/Countries";
import Profile from "./pages/Admin/Profile";
import Users from "./pages/Admin/Users";
import RolePermissions from "./pages/Admin/RolePermissions";
import Settings from "./pages/Admin/Settings";
import AuditLogs from "./pages/Admin/AuditLogs";

// HR Pages
import HRDashboard from "./pages/HR/HRDashboard";
import HRJobs from "./pages/HR/HRJobs";
import HRCandidates from "./pages/HR/HRCandidates";
import HRLogin from "./pages/HR/HRLogin";

// Recruitment Pages
import Enquiries from "./pages/Enquiries";

// Candidate Pages
import CandidateLogin from "./pages/Candidate/CandidateLogin";
import CandidateDashboard from "./pages/Candidate/CandidateDashboard";
import AllJobs from "./pages/Candidate/AllJobs";

// Satya's existing shared pages
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import TeamMembers from "./pages/TeamMembers";
import Jobs from "./pages/Jobs";

// Interviewer Pages
import InterviewerLogin from "./pages/Interviewer/InterviewerLogin";
import InterviewerDashboard from "./pages/Interviewer/Interviewerdashboard";

function App() {
  const adminToken = localStorage.getItem("adminToken");

  return (
    <BrowserRouter>
      <Routes>
        {/* Root Route */}
        <Route
          path="/"
          element={<Navigate to="/admin/login" replace />}
        />

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={
            adminToken ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <AdminLogin />
            )
          }
        />

        {/* HR Login */}
        <Route
          path="/hr/login"
          element={<HRLogin />}
        />

        {/* Interviewer Login */}
        <Route
          path="/interviewer/login"
          element={<InterviewerLogin />}
        />

        {/* Candidate Public Routes */}
        <Route
          path="/candidate/login"
          element={<CandidateLogin />}
        />

        <Route
          path="/candidate/jobs"
          element={<AllJobs />}
        />

        <Route
          path="/candidate/dashboard"
          element={<CandidateDashboard />}
        />

        {/* Protected Internal Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            {/* Satya's Shared Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Satya's Shared Pages */}
            <Route
              path="/employees"
              element={<Employees />}
            />

            <Route
              path="/team-members"
              element={<TeamMembers />}
            />

            <Route
              path="/jobs"
              element={<Jobs />}
            />

            <Route
              path="/candidates"
              element={<HRCandidates />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/employees"
              element={<AdminEmployees />}
            />

            <Route
              path="/admin/employees/temp"
              element={<EmployeesTemp />}
            />

            <Route
              path="/admin/team-members"
              element={<AdminTeamMembers />}
            />

            <Route
              path="/admin/countries"
              element={<Countries />}
            />

            <Route
              path="/admin/users"
              element={<Users />}
            />

            <Route
              path="/admin/roles-permissions"
              element={<RolePermissions />}
            />

            <Route
              path="/admin/settings"
              element={<Settings />}
            />

            <Route
              path="/admin/profile"
              element={<Profile />}
            />

            <Route
              path="/admin/audit-logs"
              element={<AuditLogs />}
            />

            {/* HR Routes */}
            <Route
              path="/hr/dashboard"
              element={<HRDashboard />}
            />

            <Route
              path="/hr/jobs"
              element={<HRJobs />}
            />

            <Route
              path="/hr/candidates"
              element={<HRCandidates />}
            />

            <Route
              path="/hr/enquiries"
              element={<Enquiries />}
            />

            {/* Interviewer Dashboard */}
            <Route
              path="/interviewer/dashboard"
              element={<InterviewerDashboard />}
            />
          </Route>
        </Route>

        {/* Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/admin/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;