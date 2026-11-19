
import { Bell, UserCircle } from "lucide-react";
import ThemeTogglerButton from "../ThemeTogglerButton";

export default function ScreenerHeader({ user = {} }) {
  const name =
    user?.name ||
    user?.fullName ||
    user?.user?.name ||
    "L0 Screener";

  const designation =
    user?.designation ||
    user?.role ||
    "L0 Screening Team";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900 lg:px-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Screener Portal
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage and review assigned applications
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Bell size={20} />
        </button>

        <ThemeTogglerButton />

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center gap-3">
          <UserCircle
            size={40}
            strokeWidth={1.8}
            className="shrink-0 text-gray-500 dark:text-gray-300"
          />

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {name}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {designation}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
