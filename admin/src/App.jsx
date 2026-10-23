
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

import Employees from "./pages/Admin/Employees";
import EmployeesTemp from "./pages/Admin/EmployeesTemp";
import TeamMembers from "./pages/Admin/TeamMembers";
import Countries from "./pages/Admin/Countries";
import Profile from "./pages/Admin/Profile";

// Future Admin Pages
// These pages are not created yet.
// import Users from "./pages/Admin/Users";
// import RolesPermissions from "./pages/Admin/RolesPermissions";
// import Settings from "./pages/Admin/Settings";
// import AuditLogs from "./pages/Admin/AuditLogs";

// Recruitment Pages
import Jobs from "./pages/HR/HRJobs";
import Candidates from "./pages/HR/HRCandidates";
import Enquiries from "./pages/Enquiries";

// Candidate Pages from Lavanya's branch
import CandidateLogin from "./pages/Candidate/CandidateLogin";
import CandidateDashboard from "./pages/Candidate/CandidateDashboard";
import AllJobs from "./pages/Candidate/AllJobs";

function App() {
  const token = localStorage.getItem("adminToken");

  return (
    <BrowserRouter>
      <Routes>

        {/* Admin Login */}
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AdminLogin />
            )
          }
        />

        {/* Candidate Pages - Outside Admin Protection */}
        <Route
          path="/candidate-login"
          element={<CandidateLogin />}
        />

        <Route
          path="/candidate-dashboard"
          element={<CandidateDashboard />}
        />

        <Route
          path="/candidate-all-jobs"
          element={<AllJobs />}
        />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>

            {/* Admin Dashboard */}
            <Route
              path="/dashboard"
              element={<AdminDashboard />}
            />

            {/* Administration - Future Pages */}
            {/*
            <Route
              path="/users"
              element={<Users />}
            />

            <Route
              path="/roles-permissions"
              element={<RolesPermissions />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
              path="/audit-logs"
              element={<AuditLogs />}
            />
            */}

            {/* Existing Admin Management Pages */}
            <Route
              path="/employees"
              element={<Employees />}
            />

            <Route
              path="/employees-temp"
              element={<EmployeesTemp />}
            />

            <Route
              path="/team-members"
              element={<TeamMembers />}
            />

            <Route
              path="/countries"
              element={<Countries />}
            />

            {/* Recruitment Pages */}
            <Route
              path="/jobs"
              element={<Jobs />}
            />

            <Route
              path="/candidates"
              element={<Candidates />}
            />

            <Route
              path="/enquiries"
              element={<Enquiries />}
            />

            {/* Admin Profile */}
            <Route
              path="/profile"
              element={<Profile />}
            />

          </Route>
        </Route>

        {/* Redirect Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;