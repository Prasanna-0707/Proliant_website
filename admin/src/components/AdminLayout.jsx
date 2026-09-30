import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100 transition-colors dark:bg-gray-950">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="ml-64 min-h-screen bg-gray-100 transition-colors dark:bg-gray-950 max-[767px]:ml-0 max-[767px]:pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;