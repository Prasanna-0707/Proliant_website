
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";

import Dashboard from "./pages/HR/HRDashboard";
import Employees from "./pages/Admin/Employees";
import EmployeesTemp from "./pages/Admin/EmployeesTemp";
import TeamMembers from "./pages/Admin/TeamMembers";
import Jobs from "./pages/HR/HRJobs";
import Countries from "./pages/Admin/Countries";
import Candidates from "./pages/HR/HRCandidates";
import Enquiries from "./pages/Enquiries";
import Profile from "./pages/Admin/Profile";

function App() {
  const token = localStorage.getItem("adminToken");

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin management */}
            <Route path="/employees" element={<Employees />} />
            <Route
              path="/employees-temp"
              element={<EmployeesTemp />}
            />
            <Route path="/team-members" element={<TeamMembers />} />
            <Route path="/countries" element={<Countries />} />

            {/* Recruitment */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/enquiries" element={<Enquiries />} />

            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
