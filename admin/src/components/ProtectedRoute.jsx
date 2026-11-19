
import { Outlet } from "react-router-dom";

function ProtectedRoute() {
  return <Outlet />;
}

export default ProtectedRoute;


// import { Navigate, Outlet, useLocation } from "react-router-dom";

// function ProtectedRoute() {
//   const token = localStorage.getItem("adminToken");
//   const location = useLocation();

//   if (!token) {
//     return (
//       <Navigate
//         to="/admin/login"
//         replace
//         state={{ from: location }}
//       />
//     );
//   }

//   return <Outlet />;
// }

// export default ProtectedRoute;

// import { Navigate, Outlet } from "react-router-dom";

// function ProtectedRoute() {
//   const token = localStorage.getItem("adminToken");

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   return <Outlet />;
// }

// export default ProtectedRoute;