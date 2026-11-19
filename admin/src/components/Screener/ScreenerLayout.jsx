
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import ScreenerHeader from "./ScreenerHeader";

function getScreenerUser() {
  const storageKeys = [
    "adminUser",
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

export default function ScreenerLayout() {
  const screenerUser = getScreenerUser();

  return (
    <div className="min-h-screen bg-[#fafafa] transition-colors dark:bg-gray-950">
      <Sidebar user={screenerUser} role="L0_SCREENER" />

      <div className="min-w-0 md:ml-64">
        <div className="hidden md:block">
          <ScreenerHeader user={screenerUser} />
        </div>

        <main className="min-h-screen min-w-0 overflow-x-hidden px-4 pt-20 pb-20 sm:px-6 md:pt-6 md:pb-6 lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
