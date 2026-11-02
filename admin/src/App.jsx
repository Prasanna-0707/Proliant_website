
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

import CandidateLogin from "./pages/Candidate/CandidateLogin";
import CandidateDashboard from "./pages/Candidate/CandidateDashboard";
import MyApplications from "./pages/Candidate/MyApplicatins";
import AllJobs from "./pages/Candidate/AllJobs";
import CandidateProfile from "./pages/Candidate/CandidateProfile";
import CandidateNotifications from "./pages/Candidate/CandidateNotifications";


function App() {
  const token = localStorage.getItem("adminToken");

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin login */}
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

        {/* Candidate pages — outside admin protection */}
        <Route
          path="/candidate-login"
          element={<CandidateLogin />}
        />

        <Route
          path="/candidate-dashboard"
          element={<CandidateDashboard />}
        />
        <Route
          path="/candidate-applications"
          element={<MyApplications />}
        />

        <Route
          path="/candidate-all-jobs"
          element={<AllJobs />}
        />
        <Route path="/candidate-profile" element={<CandidateProfile />} />
        <Route
          path="/candidate-notifications"
          element={<CandidateNotifications />}
        />
        
        {/* Admin protected pages */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees-temp" element={<EmployeesTemp />} />
            <Route path="/team-members" element={<TeamMembers />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Redirect unknown routes — keep this last */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
