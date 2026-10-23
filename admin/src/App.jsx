import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Login
import Login from "./pages/Login";

// Existing Admin / HR pages
import Dashboard from "./pages/HR/HRDashboard";
import Employees from "./pages/Admin/Employees";
import EmployeesTemp from "./pages/Admin/EmployeesTemp";
import TeamMembers from "./pages/Admin/TeamMembers";
import Jobs from "./pages/HR/HRJobs";
import Countries from "./pages/Admin/Countries";
import Candidates from "./pages/HR/HRCandidates";
import Enquiries from "./pages/Enquiries";

// Interviewer pages
import InterviewerLogin from "./pages/Interviewer/InterviewerLogin";
import InterviewerDashboard from "./pages/Interviewer/Interviewerdashboard";

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
              <Login />
            )
          }
        />

        {/* Interviewer Login */}
        <Route
          path="/interviewer/login"
          element={<InterviewerLogin />}
        />

        {/* Interviewer Dashboard */}
        <Route
          path="/interviewer/dashboard"
          element={<InterviewerDashboard />}
        />

        {/* Protected Admin / HR Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

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
              element={<Candidates />}
            />

            <Route
              path="/enquiries"
              element={<Enquiries />}
            />

            {/* Keep these routes if they are needed */}
            <Route
              path="/employees-temp"
              element={<EmployeesTemp />}
            />

            <Route
              path="/countries"
              element={<Countries />}
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
