import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Login
import Login from "./pages/Login";

// Existing pages
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import TeamMembers from "./pages/TeamMembers";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";
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
