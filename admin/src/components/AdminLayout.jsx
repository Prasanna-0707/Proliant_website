import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="ml-64 min-h-screen bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;