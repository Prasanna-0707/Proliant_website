
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";

function getHRUser() {
  const storageKeys = [
    "hrUser",
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

function HRLayout() {
  const hrUser = getHRUser();

  return (
    <div className="min-h-screen bg-[#fafafa] transition-colors dark:bg-gray-950">
      <Sidebar user={hrUser} role="HR" />

      <div className="min-w-0 flex-1 md:ml-64">
        <main className="min-h-screen min-w-0 px-4 py-5 pt-16 pb-20 transition-colors dark:bg-gray-950 sm:px-6 lg:px-8 lg:py-7 md:pt-5 md:pb-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default HRLayout;