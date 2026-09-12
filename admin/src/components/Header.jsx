import { useState } from "react";
import { Bell, UserCircle, LogOut } from "lucide-react";

function Header() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="relative flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6 max-[767px]:h-[68px] max-[767px]:px-4">
      {/* Page Title */}
      <div>
        {/* Desktop / Tablet */}
        <h1 className="text-xl font-semibold text-gray-900 max-[767px]:hidden">
          Admin Portal
        </h1>

        <p className="mt-1 text-sm text-gray-500 max-[767px]:hidden">
          Manage your Proliant operations
        </p>

        {/* Mobile */}
        <h1 className="hidden text-xl font-bold tracking-tight text-gray-900 max-[767px]:block">
          Dashboard
        </h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4 max-[767px]:gap-2">
        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 max-[767px]:p-2"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={2} />
        </button>

        {/* Admin Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-3 border-l border-gray-200 pl-4 max-[767px]:gap-2 max-[767px]:border-l-0 max-[767px]:pl-0"
            aria-label="Admin profile"
            aria-expanded={profileOpen}
          >
            <UserCircle
              size={36}
              strokeWidth={1.7}
              className="text-gray-500 max-[767px]:h-9 max-[767px]:w-9"
            />

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                Admin
              </p>

              <p className="text-xs text-gray-500">
                Administrator
              </p>
            </div>
          </button>

          {/* =====================================================
              MOBILE PROFILE MENU
              Logout appears inside Admin / Administrator
          ====================================================== */}
          {profileOpen && (
            <div className="absolute right-0 top-full z-[60] mt-3 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg max-[767px]:w-48">
              {/* Admin information */}
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">
                  Admin
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  Administrator
                </p>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut size={18} strokeWidth={2} />

                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;