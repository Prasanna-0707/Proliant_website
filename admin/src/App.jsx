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
import MyInterviews from "./pages/Interviewer/MyInterviews";
import InterviewDetails from "./pages/Interviewer/InterviewDetails";
import CandidateReview from "./pages/Interviewer/CandidateReview";
import InterviewEvaluation from "./pages/Interviewer/InterviewEvaluation";
import InterviewHistory from "./pages/Interviewer/InterviewHistory";
import InterviewerProfile from "./pages/Interviewer/InterviewerProfile";
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

        {/* Interviewer Routes */}
        <Route
          path="/interviewer/login"
          element={<InterviewerLogin />}
        />

        <Route
          path="/interviewer/dashboard"
          element={<InterviewerDashboard />}
        />

        <Route
          path="/interviewer/my-interviews"
          element={<MyInterviews />}
        />

        <Route
          path="/interviewer/interview/:id"
          element={<InterviewDetails />}
        />

        <Route
          path="/interviewer/candidates"
          element={<CandidateReview />}
        />

        <Route
          path="/interviewer/evaluation/:id"
          element={<InterviewEvaluation />}
        />

        <Route
          path="/interviewer/history/:id"
          element={<InterviewHistory />}
        />

        <Route
          path="/interviewer/profile"
          element={<InterviewerProfile />}
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
