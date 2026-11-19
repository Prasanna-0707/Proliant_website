
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

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Profile from "./pages/Admin/Profile";
import Users from "./pages/Admin/Users";
import RolePermissions from "./pages/Admin/RolePermissions";
import Settings from "./pages/Admin/Settings";
import AuditLogs from "./pages/Admin/AuditLogs";

// HR Pages
import HRDashboard from "./pages/HR/HRDashboard";
import HRJobs from "./pages/HR/HRJobs";
import HRCandidates from "./pages/HR/HRCandidates";
import HRCountries from "./pages/HR/HRCountries";
import HREnquiries from "./pages/HR/HREnquiries";
import L0Screener from "./pages/HR/L0Screener";
import L1Interview from "./pages/HR/L1Interview";
import L2Interview from "./pages/HR/L2Interview";

// Screener Pages
import ScreenerLayout from "./components/Screener/ScreenerLayout";
import ScreenerDashboard from "./pages/L0_Screener/ScreenerDashboard";
import ScreenerApplications from "./pages/L0_Screener/MyApplications";
import PendingScreening from "./pages/L0_Screener/PendingScreening";
import Shortlisted from "./pages/L0_Screener/Shortlisted";
import Rejected from "./pages/L0_Screener/Rejected";
import OnHold from "./pages/L0_Screener/OnHold";
import HRReviewRequests from "./pages/L0_Screener/HRReviewRequests";
import ScreeningHistory from "./pages/L0_Screener/ScreeningHistory";
import ScreenerProfile from "./pages/L0_Screener/ScreenerProfile";

// Candidate Pages
import CandidateLogin from "./pages/Candidate/CandidateLogin";
import CandidateDashboard from "./pages/Candidate/CandidateDashboard";
import CandidateApplications from "./pages/Candidate/MyApplicatins";
import AllJobs from "./pages/Candidate/AllJobs";
import CandidateProfile from "./pages/Candidate/CandidateProfile";
import CandidateNotifications from "./pages/Candidate/CandidateNotifications";

// Department Admin Pages
import DeptAdminDashboard from "./pages/deptAdmin/DeptAdminDashboard";

// Interviewer Pages
import InterviewerDashboard from "./pages/Interviewer/Interviewerdashboard";
import MyInterviews from "./pages/Interviewer/MyInterviews";
import InterviewDetails from "./pages/Interviewer/InterviewDetails";
import CandidateReview from "./pages/Interviewer/CandidateReview";
import InterviewEvaluation from "./pages/Interviewer/InterviewEvaluation";
import InterviewHistory from "./pages/Interviewer/InterviewHistory";
import InterviewerProfile from "./pages/Interviewer/InterviewerProfile";

// Hiring Manager Pages
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
        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Login Routes */}
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

        <Route
          path="/candidate-dashboard"
          element={<CandidateDashboard />}
        />

        <Route
          path="/candidate-applications"
          element={<CandidateApplications />}
        />

        <Route
          path="/candidate-all-jobs"
          element={<AllJobs />}
        />

        <Route
          path="/candidate-profile"
          element={<CandidateProfile />}
        />

        <Route
          path="/candidate-notifications"
          element={<CandidateNotifications />}
        />

        {/* Dept admin */}
        <Route
          path="/dept-admin-dashboard"
          element={<DeptAdminDashboard />}
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>

          {/* Admin Portal */}
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

          {/* HR Portal */}
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

          {/* L0 Screener Portal */}
          <Route
            element={<ProtectedRoute allowedRoles={["L0_SCREENER"]} />}
          >
            <Route element={<ScreenerLayout />}>
              <Route
                path="/screener-dashboard"
                element={<ScreenerDashboard />}
              />

              <Route
                path="/assigned-applications"
                element={<ScreenerApplications />}
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

          {/* Interviewer Portal */}
          <Route element={<AdminLayout />}>
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
          </Route>

          {/* Hiring Manager Portal */}
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

        {/* Fallback Route */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";

// import AdminLayout from "./components/AdminLayout";
// import HRLayout from "./components/HR/HRLayout";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Login from "./components/Auth/login";

// // Admin Pages
// import AdminDashboard from "./pages/Admin/AdminDashboard";
// import Profile from "./pages/Admin/Profile";
// import Users from "./pages/Admin/Users";
// import RolePermissions from "./pages/Admin/RolePermissions";
// import Settings from "./pages/Admin/Settings";
// import AuditLogs from "./pages/Admin/AuditLogs";

// // HR Pages
// import HRDashboard from "./pages/HR/HRDashboard";
// import HRJobs from "./pages/HR/HRJobs";
// import HRCandidates from "./pages/HR/HRCandidates";
// import HRCountries from "./pages/HR/HRCountries";
// import HREnquiries from "./pages/HR/HREnquiries";
// import L0Screener from "./pages/HR/L0Screener";
// import L1Interview from "./pages/HR/L1Interview";
// import L2Interview from "./pages/HR/L2Interview";

// // Screener Pages
// import ScreenerLayout from "./components/Screener/ScreenerLayout";
// import ScreenerDashboard from "./pages/L0_Screener/ScreenerDashboard";
// import ScreenerApplications from "./pages/L0_Screener/MyApplications";
// import PendingScreening from "./pages/L0_Screener/PendingScreening";
// import Shortlisted from "./pages/L0_Screener/Shortlisted";
// import Rejected from "./pages/L0_Screener/Rejected";
// import OnHold from "./pages/L0_Screener/OnHold";
// import HRReviewRequests from "./pages/L0_Screener/HRReviewRequests";
// import ScreeningHistory from "./pages/L0_Screener/ScreeningHistory";
// import ScreenerProfile from "./pages/L0_Screener/ScreenerProfile";

// // Candidate Pages
// import CandidateLogin from "./pages/Candidate/CandidateLogin";
// import CandidateDashboard from "./pages/Candidate/CandidateDashboard";
// import CandidateApplications from "./pages/Candidate/MyApplicatins";
// import AllJobs from "./pages/Candidate/AllJobs";
// import CandidateProfile from "./pages/Candidate/CandidateProfile";
// import CandidateNotifications from "./pages/Candidate/CandidateNotifications";

// // Interviewer Pages
// import InterviewerDashboard from "./pages/Interviewer/Interviewerdashboard";
// <<<<<<< HEAD

// // Hiring Manager Pages
// import HiringManagerLayout from "./components/HiringManager/HiringManagerLayout";
// import HiringManagerDashboard from "./pages/HiringManager/HiringManagerDashboard";
// import InterviewPipeline from "./pages/HiringManager/InterviewPipeline";
// import InterviewSchedule from "./pages/HiringManager/InterviewSchedule";
// import InterviewerCoordination from "./pages/HiringManager/InterviewerCoordination";
// import Evaluations from "./pages/HiringManager/Evaluations";
// import HiringDecisions from "./pages/HiringManager/HiringDecisions";
// import FinalReview from "./pages/HiringManager/FinalReview";
// import ActivityHistory from "./pages/HiringManager/ActivityHistory";
// import HiringManagerProfile from "./pages/HiringManager/HiringManagerProfile";
// =======
// import MyInterviews from "./pages/Interviewer/MyInterviews";
// import InterviewDetails from "./pages/Interviewer/InterviewDetails";
// import CandidateReview from "./pages/Interviewer/CandidateReview";
// import InterviewEvaluation from "./pages/Interviewer/InterviewEvaluation";
// import InterviewHistory from "./pages/Interviewer/InterviewHistory";
// import InterviewerProfile from "./pages/Interviewer/InterviewerProfile";
// function App() {
//   const token = localStorage.getItem("adminToken");
// >>>>>>> origin/satya-dev

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Default Route */}
//         <Route
//           path="/"
//           element={<Navigate to="/login" replace />}
//         />

//         {/* Login Routes */}
//         <Route path="/login" element={<Login />} />

//         <Route
//           path="/admin/login"
//           element={<Navigate to="/login" replace />}
//         />

//         <Route
//           path="/hr/login"
//           element={<Navigate to="/login" replace />}
//         />

// <<<<<<< HEAD
// =======
//         {/* Interviewer Routes */}
// >>>>>>> origin/satya-dev
//         <Route
//           path="/interviewer/login"
//           element={<Navigate to="/login" replace />}
//         />

//         <Route
//           path="/candidate/login"
//           element={<CandidateLogin />}
//         />

// <<<<<<< HEAD
//         {/* Candidate Public Routes */}
//         {/* Original routes from prasanna-dev */}
//         <Route
//           path="/candidate/jobs"
//           element={<AllJobs />}
//         />

//         <Route
//           path="/candidate/dashboard"
//           element={<CandidateDashboard />}
//         />

//         {/* Candidate routes from lavanya-dev */}
//         <Route
//           path="/candidate-dashboard"
//           element={<CandidateDashboard />}
//         />

//         <Route
//           path="/candidate-applications"
//           element={<CandidateApplications />}
//         />

//         <Route
//           path="/candidate-all-jobs"
//           element={<AllJobs />}
//         />

//         <Route
//           path="/candidate-profile"
//           element={<CandidateProfile />}
//         />

//         <Route
//           path="/candidate-notifications"
//           element={<CandidateNotifications />}
//         />

//         {/* Protected Routes */}
// =======
//         <Route
//           path="/interviewer/my-interviews"
//           element={<MyInterviews />}
//         />

//         <Route
//           path="/interviewer/interview/:id"
//           element={<InterviewDetails />}
//         />

//         <Route
//           path="/interviewer/candidates"
//           element={<CandidateReview />}
//         />

//         <Route
//           path="/interviewer/evaluation/:id"
//           element={<InterviewEvaluation />}
//         />

//         <Route
//           path="/interviewer/history/:id"
//           element={<InterviewHistory />}
//         />

//         <Route
//           path="/interviewer/profile"
//           element={<InterviewerProfile />}
//         />


//         {/* Protected Admin / HR Routes */}
// >>>>>>> origin/satya-dev
//         <Route element={<ProtectedRoute />}>

//           {/* Admin Portal */}
//           <Route element={<AdminLayout />}>
//             <Route
//               path="/admin/dashboard"
//               element={<AdminDashboard />}
//             />

//             <Route
//               path="/admin/users"
//               element={<Users />}
//             />

//             <Route
//               path="/admin/roles-permissions"
//               element={<RolePermissions />}
//             />

//             <Route
//               path="/admin/settings"
//               element={<Settings />}
//             />

//             <Route
//               path="/admin/profile"
//               element={<Profile />}
//             />

//             <Route
//               path="/admin/audit-logs"
//               element={<AuditLogs />}
//             />

//             <Route
//               path="/candidates"
//               element={<HRCandidates />}
//             />
//           </Route>

//           {/* HR Portal */}
//           <Route element={<HRLayout />}>
//             <Route
//               path="/hr/dashboard"
//               element={<HRDashboard />}
//             />

//             <Route
//               path="/hr/countries"
//               element={<HRCountries />}
//             />

//             <Route
//               path="/hr/jobs"
//               element={<HRJobs />}
//             />

//             <Route
//               path="/hr/enquiries"
//               element={<HREnquiries />}
//             />

//             <Route
//               path="/hr/candidates"
//               element={<HRCandidates />}
//             />

//             <Route
//               path="/hr/l0-screeners"
//               element={<L0Screener />}
//             />

//             <Route
//               path="/hr/l1-interview"
//               element={<L1Interview />}
//             />

//             <Route
//               path="/hr/l2-interview"
//               element={<L2Interview />}
//             />
//           </Route>

//           {/* L0 Screener Portal */}
//           <Route
//             element={<ProtectedRoute allowedRoles={["L0_SCREENER"]} />}
//           >
//             <Route element={<ScreenerLayout />}>
//               <Route
//                 path="/screener-dashboard"
//                 element={<ScreenerDashboard />}
//               />

//               <Route
//                 path="/assigned-applications"
//                 element={<ScreenerApplications />}
//               />

//               <Route
//                 path="/l0-screening"
//                 element={<PendingScreening />}
//               />

//               <Route
//                 path="/screener/shortlisted"
//                 element={<Shortlisted />}
//               />

//               <Route
//                 path="/screener/rejected"
//                 element={<Rejected />}
//               />

//               <Route
//                 path="/screener/on-hold"
//                 element={<OnHold />}
//               />

//               <Route
//                 path="/screener/hr-review"
//                 element={<HRReviewRequests />}
//               />

//               <Route
//                 path="/screener/history"
//                 element={<ScreeningHistory />}
//               />

//               <Route
//                 path="/screener/profile"
//                 element={<ScreenerProfile />}
//               />
//             </Route>
//           </Route>

//           {/* Interviewer Portal */}
//           <Route element={<AdminLayout />}>
//             <Route
//               path="/interviewer/dashboard"
//               element={<InterviewerDashboard />}
//             />
//           </Route>

//           {/* Hiring Manager Portal */}
//           <Route element={<HiringManagerLayout />}>
//             <Route
//               path="/hiring-manager/dashboard"
//               element={<HiringManagerDashboard />}
//             />

//             <Route
//               path="/hiring-manager/interview-pipeline"
//               element={<InterviewPipeline />}
//             />

//             <Route
//               path="/hiring-manager/interview-schedule"
//               element={<InterviewSchedule />}
//             />

//             <Route
//               path="/hiring-manager/interviewer-coordination"
//               element={<InterviewerCoordination />}
//             />

//             <Route
//               path="/hiring-manager/evaluations"
//               element={<Evaluations />}
//             />

//             <Route
//               path="/hiring-manager/decisions"
//               element={<HiringDecisions />}
//             />

//             <Route
//               path="/hiring-manager/final-review"
//               element={<FinalReview />}
//             />

//             <Route
//               path="/hiring-manager/activity-history"
//               element={<ActivityHistory />}
//             />

//             <Route
//               path="/hiring-manager/profile"
//               element={<HiringManagerProfile />}
//             />
//           </Route>

//         </Route>

//         {/* Fallback Route */}
//         <Route
//           path="*"
//           element={<Navigate to="/login" replace />}
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;