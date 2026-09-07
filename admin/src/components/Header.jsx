import { Bell, UserCircle } from "lucide-react";

function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Admin Portal
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your Proliant operations
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={2} />
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <UserCircle
            size={36}
            strokeWidth={1.7}
            className="text-gray-500"
          />

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">
              Admin
            </p>
            <p className="text-xs text-gray-500">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;