import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import { getStoredUser } from "../../services/http.js";
import StaffNotificationBell from "../StaffNotificationBell";

export default function InterviewerLayout() {
  const user = getStoredUser("staff") || {};

  return (
    <div className="min-h-screen bg-[#fafafa] transition-colors dark:bg-gray-950">
      <Sidebar user={user} role="INTERVIEWER" />

      <div className="min-w-0 flex-1 md:ml-64">
        <main className="min-h-screen min-w-0 overflow-x-hidden px-4 pt-20 pb-20 transition-colors sm:px-6 md:pt-6 md:pb-6 lg:px-8 lg:py-7 dark:bg-gray-950">
          <div className="mb-4 flex justify-end">
            <StaffNotificationBell />
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
