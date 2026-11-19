import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";

function getHiringManagerUser() {
  const storageKeys = [
    "hiringManagerUser",
    "currentUser",
    "adminUser",
    "hrUser",
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

export default function HiringManagerLayout() {
  const hiringManagerUser = getHiringManagerUser();

  return (
    <div className="min-h-screen bg-[#fafafa] transition-colors dark:bg-gray-950">
      <Sidebar
        user={hiringManagerUser}
        role="HIRING_MANAGER"
      />

      <div className="min-w-0 flex-1 md:ml-64">
        <main className="min-h-screen min-w-0 overflow-x-hidden px-4 pt-20 pb-20 transition-colors sm:px-6 md:pt-6 md:pb-6 lg:px-8 lg:py-7 dark:bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}