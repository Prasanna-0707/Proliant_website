
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function getAdminUser() {
  const storageKeys = [
    "adminUser",
    "currentUser",
    "user",
  ];

  for (const key of storageKeys) {
    try {
      const storedValue = localStorage.getItem(key);

      if (!storedValue) continue;

      const parsed = JSON.parse(storedValue);

      const user =
        parsed?.user ??
        parsed?.data?.user ??
        parsed?.data ??
        parsed;

      if (user && typeof user === "object") {
        return user;
      }
    } catch {
      continue;
    }
  }

  return {};
}

function AdminLayout() {
  const adminUser = getAdminUser();

  return (
    <div className="min-h-screen bg-[#fafafa] transition-colors dark:bg-gray-950">
      <Sidebar user={adminUser} role="ADMIN" />

      <div className="min-w-0 flex-1 md:ml-64">
        <Header />

        <main className="min-h-screen min-w-0 px-4 py-5 pt-16 pb-20 transition-colors dark:bg-gray-950 sm:px-6 lg:px-8 lg:py-7 md:pt-5 md:pb-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;