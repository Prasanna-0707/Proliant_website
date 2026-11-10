
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLayout from "./components/AdminLayout";
import HRLayout from "./components/HR/HRLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Auth/login";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import Profile from "./pages/Admin/Profile";
import Users from "./pages/Admin/Users";
import RolePermissions from "./pages/Admin/RolePermissions";
import Settings from "./pages/Admin/Settings";
import AuditLogs from "./pages/Admin/AuditLogs";

import HRDashboard from "./pages/HR/HRDashboard";
import HRJobs from "./pages/HR/HRJobs";
import HRCandidates from "./pages/HR/HRCandidates";
import HRCountries from "./pages/HR/HRCountries";
import HREnquiries from "./pages/HR/HREnquiries";
import L0Screener from "./pages/HR/L0Screener";
import L1Interview from "./pages/HR/L1Interview";
import L2Interview from "./pages/HR/L2Interview";

import ScreenerLayout from "./components/Screener/ScreenerLayout";
import ScreenerDashboard from "./pages/L0_Screener/ScreenerDashboard";
import MyApplications from "./pages/L0_Screener/MyApplications";
import PendingScreening from "./pages/L0_Screener/PendingScreening";
import Shortlisted from "./pages/L0_Screener/Shortlisted";
import Rejected from "./pages/L0_Screener/Rejected";
import OnHold from "./pages/L0_Screener/OnHold";
import HRReviewRequests from "./pages/L0_Screener/HRReviewRequests";
import ScreeningHistory from "./pages/L0_Screener/ScreeningHistory";
import ScreenerProfile from "./pages/L0_Screener/ScreenerProfile";

import CandidateLogin from "./pages/Candidate/CandidateLogin";
import CandidateDashboard from "./pages/Candidate/CandidateDashboard";
import AllJobs from "./pages/Candidate/AllJobs";

import InterviewerDashboard from "./pages/Interviewer/Interviewerdashboard";

import HiringManagerLayout from "./components/HiringManager/HiringManagerLayout";
import HiringManagerDashboard from "./pages/HiringManager/HiringManagerDashboard";
import InterviewPipeline from "./pages/HiringManager/InterviewPipeline";
import InterviewSchedule from "./pages/HiringManager/InterviewSchedule";
import InterviewerCoordination from "./pages/HiringManager/InterviewerCoordination";
import Evaluations from "./pages/HiringManager/Evaluations";
import HiringDecisions from "./pages/HiringManager/HiringDecisions";
import FinalReview from "./pages/HiringManager/FinalReview";
import ActivityHistory from "./pages/HiringManager/ActivityHistory";
import HiringManagerProfile from "./pages/HiringManager/HiringManagerProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<Login />} />

        <Route
          path="/admin/login"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/hr/login"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/interviewer/login"
          element={<Navigate to="/login" replace />}
        />

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

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
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

            <Route
              path="/candidates"
              element={<HRCandidates />}
            />
          </Route>

          <Route element={<HRLayout />}>
            <Route
              path="/hr/dashboard"
              element={<HRDashboard />}
            />

            <Route
              path="/hr/countries"
              element={<HRCountries />}
            />

            <Route
              path="/hr/jobs"
              element={<HRJobs />}
            />

            <Route
              path="/hr/enquiries"
              element={<HREnquiries />}
            />

            <Route
              path="/hr/candidates"
              element={<HRCandidates />}
            />

            <Route
              path="/hr/l0-screeners"
              element={<L0Screener />}
            />

            <Route
              path="/hr/l1-interview"
              element={<L1Interview />}
            />

            <Route
              path="/hr/l2-interview"
              element={<L2Interview />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["L0_SCREENER"]} />}>
            <Route element={<ScreenerLayout />}>
              <Route
                path="/screener-dashboard"
                element={<ScreenerDashboard />}
              />

              <Route
                path="/assigned-applications"
                element={<MyApplications />}
              />

              <Route
                path="/l0-screening"
                element={<PendingScreening />}
              />

              <Route
                path="/screener/shortlisted"
                element={<Shortlisted />}
              />

              <Route
                path="/screener/rejected"
                element={<Rejected />}
              />

              <Route
                path="/screener/on-hold"
                element={<OnHold />}
              />

              <Route
                path="/screener/hr-review"
                element={<HRReviewRequests />}
              />

              <Route
                path="/screener/history"
                element={<ScreeningHistory />}
              />

              <Route
                path="/screener/profile"
                element={<ScreenerProfile />}
              />
            </Route>
          </Route>

          <Route element={<AdminLayout />}>
            <Route
              path="/interviewer/dashboard"
              element={<InterviewerDashboard />}
            />
          </Route>

          <Route element={<HiringManagerLayout />}>
            <Route
              path="/hiring-manager/dashboard"
              element={<HiringManagerDashboard />}
            />

            <Route
              path="/hiring-manager/interview-pipeline"
              element={<InterviewPipeline />}
            />

            <Route
              path="/hiring-manager/interview-schedule"
              element={<InterviewSchedule />}
            />

            <Route
              path="/hiring-manager/interviewer-coordination"
              element={<InterviewerCoordination />}
            />

            <Route
              path="/hiring-manager/evaluations"
              element={<Evaluations />}
            />

            <Route
              path="/hiring-manager/decisions"
              element={<HiringDecisions />}
            />

            <Route
              path="/hiring-manager/final-review"
              element={<FinalReview />}
            />

            <Route
              path="/hiring-manager/activity-history"
              element={<ActivityHistory />}
            />

            <Route
              path="/hiring-manager/profile"
              element={<HiringManagerProfile />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;