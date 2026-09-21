import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import TeamMembers from "./pages/TeamMembers";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";
import Enquiries from "./pages/Enquiries";

function App() {
  const token = localStorage.getItem("adminToken");

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={
            token ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/employees" element={<Employees />} />

            <Route
              path="/team-members"
              element={<TeamMembers />}
            />

            <Route path="/jobs" element={<Jobs />} />

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

        {/* Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;