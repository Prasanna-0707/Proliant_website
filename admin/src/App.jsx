import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// ==============================
// Admin Pages
// ==============================
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";

import Employees from "./pages/Admin/Employees";
import EmployeesTemp from "./pages/Admin/EmployeesTemp";
import TeamMembers from "./pages/Admin/TeamMembers";
import Countries from "./pages/Admin/Countries";
import Profile from "./pages/Admin/Profile";

import Users from "./pages/Admin/Users";
import RolePermissions from "./pages/Admin/RolePermissions";
import Settings from "./pages/Admin/Settings";
import AuditLogs from "./pages/Admin/AuditLogs";

// ==============================
// HR Pages
// ==============================
import HRDashboard from "./pages/HR/HRDashboard";
import HRJobs from "./pages/HR/HRJobs";
import HRCandidates from "./pages/HR/HRCandidates";

// ==============================
// Recruitment Pages
// ==============================
import Enquiries from "./pages/Enquiries";

// ==============================
// Candidate Pages
// ==============================
import CandidateLogin from "./pages/Candidate/CandidateLogin";
import CandidateDashboard from "./pages/Candidate/CandidateDashboard";
import AllJobs from "./pages/Candidate/AllJobs";


function App() {
  const adminToken = localStorage.getItem("adminToken");

  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================
            ROOT ROUTE
        ===================================== */}
        <Route
          path="/"
          element={<Navigate to="/admin/login" replace />}
        />


        {/* =====================================
            ADMIN AUTHENTICATION
        ===================================== */}
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


        {/* =====================================
            CANDIDATE PUBLIC ROUTES
        ===================================== */}
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


        {/* =====================================
            PROTECTED ADMIN & HR ROUTES
        ===================================== */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>

            {/* =================================
                ADMIN ROUTES
            ================================= */}

            {/* Admin Dashboard */}
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            {/* Employee Management */}
            <Route
              path="/admin/employees"
              element={<Employees />}
            />

            <Route
              path="/admin/employees/temp"
              element={<EmployeesTemp />}
            />

            <Route
              path="/admin/team-members"
              element={<TeamMembers />}
            />

            <Route
              path="/admin/countries"
              element={<Countries />}
            />

            {/* User & Permission Management */}
            <Route
              path="/admin/users"
              element={<Users />}
            />

            <Route
              path="/admin/roles-permissions"
              element={<RolePermissions />}
            />

            {/* Admin Settings */}
            <Route
              path="/admin/settings"
              element={<Settings />}
            />

            {/* Admin Profile */}
            <Route
              path="/admin/profile"
              element={<Profile />}
            />

            {/* Audit Logs */}
            <Route
              path="/admin/audit-logs"
              element={<AuditLogs />}
            />


            {/* =================================
                HR ROUTES
            ================================= */}

            {/* HR Dashboard */}
            <Route
              path="/hr/dashboard"
              element={<HRDashboard />}
            />

            {/* HR Job Management */}
            <Route
              path="/hr/jobs"
              element={<HRJobs />}
            />

            {/* HR Candidate Management */}
            <Route
              path="/hr/candidates"
              element={<HRCandidates />}
            />

            {/* HR Enquiries */}
            <Route
              path="/hr/enquiries"
              element={<Enquiries />}
            />

          </Route>
        </Route>


        {/* =====================================
            UNKNOWN ROUTES
        ===================================== */}
        <Route
          path="*"
          element={<Navigate to="/admin/login" replace />}
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
// import ProtectedRoute from "./components/ProtectedRoute";

// // Admin Pages
// import AdminLogin from "./pages/Admin/AdminLogin";
// import AdminDashboard from "./pages/Admin/AdminDashboard";

// import Employees from "./pages/Admin/Employees";
// import EmployeesTemp from "./pages/Admin/EmployeesTemp";
// import TeamMembers from "./pages/Admin/TeamMembers";
// import Countries from "./pages/Admin/Countries";
// import Profile from "./pages/Admin/Profile";

// // Future Admin Pages
// // These pages are not created yet.
// // import Users from "./pages/Admin/Users";
// // import RolesPermissions from "./pages/Admin/RolesPermissions";
// // import Settings from "./pages/Admin/Settings";
// // import AuditLogs from "./pages/Admin/AuditLogs";

// // Recruitment Pages
// import Jobs from "./pages/HR/HRJobs";
// import Candidates from "./pages/HR/HRCandidates";
// import Enquiries from "./pages/Enquiries";

// // Candidate Pages from Lavanya's branch
// import CandidateLogin from "./pages/Candidate/CandidateLogin";
// import CandidateDashboard from "./pages/Candidate/CandidateDashboard";
// import AllJobs from "./pages/Candidate/AllJobs";

// function App() {
//   const token = localStorage.getItem("adminToken");

//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* Admin Login */}
//         <Route
//           path="/login"
//           element={
//             token ? (
//               <Navigate to="/dashboard" replace />
//             ) : (
//               <AdminLogin />
//             )
//           }
//         />

//         {/* Candidate Pages - Outside Admin Protection */}
//         <Route
//           path="/candidate-login"
//           element={<CandidateLogin />}
//         />

//         <Route
//           path="/candidate-dashboard"
//           element={<CandidateDashboard />}
//         />

//         <Route
//           path="/candidate-all-jobs"
//           element={<AllJobs />}
//         />

//         {/* Protected Admin Routes */}
//         <Route element={<ProtectedRoute />}>
//           <Route element={<AdminLayout />}>

//             {/* Admin Dashboard */}
//             <Route
//               path="/dashboard"
//               element={<AdminDashboard />}
//             />

//             {/* Administration - Future Pages */}
//             {/*
//             <Route
//               path="/users"
//               element={<Users />}
//             />

//             <Route
//               path="/roles-permissions"
//               element={<RolesPermissions />}
//             />

//             <Route
//               path="/settings"
//               element={<Settings />}
//             />

//             <Route
//               path="/audit-logs"
//               element={<AuditLogs />}
//             />
//             */}

//             {/* Existing Admin Management Pages */}
//             <Route
//               path="/employees"
//               element={<Employees />}
//             />

//             <Route
//               path="/employees-temp"
//               element={<EmployeesTemp />}
//             />

//             <Route
//               path="/team-members"
//               element={<TeamMembers />}
//             />

//             <Route
//               path="/countries"
//               element={<Countries />}
//             />

//             {/* Recruitment Pages */}
//             <Route
//               path="/jobs"
//               element={<Jobs />}
//             />

//             <Route
//               path="/candidates"
//               element={<Candidates />}
//             />

//             <Route
//               path="/enquiries"
//               element={<Enquiries />}
//             />

//             {/* Admin Profile */}
//             <Route
//               path="/profile"
//               element={<Profile />}
//             />

//           </Route>
//         </Route>

//         {/* Redirect Unknown Routes */}
//         <Route
//           path="*"
//           element={<Navigate to="/login" replace />}
//         />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;