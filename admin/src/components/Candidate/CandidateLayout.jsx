import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  BriefcaseBusiness,
  UserRound,
  LogOut,
  Search,
  Moon,
  ChevronDown,
  X,
} from "lucide-react";

import NotificationBell from "../../pages/Candidate/NotificationBell.jsx";
import { getToken } from "../../services/http.js";
import {
  getCandidateUser,
  logoutCandidate,
} from "../../services/candidatePortal.js";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/candidate-dashboard" },
  {
    label: "My Applications",
    icon: ClipboardList,
    path: "/candidate-applications",
  },
  { label: "All Jobs", icon: BriefcaseBusiness, path: "/candidate-all-jobs" },
  { label: "Profile", icon: UserRound, path: "/candidate-profile" },
];

// Shared shell for every candidate portal page: sidebar, top bar,
// notifications and sign-out. Pages that are not signed in are sent to
// the candidate login page.
export default function CandidateLayout({
  active,
  children,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
}) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(() => getCandidateUser());

  // Keep the name in sync if the profile page updates it.
  useEffect(() => {
    const sync = () => setUser(getCandidateUser());

    window.addEventListener("candidate-user-updated", sync);

    return () => window.removeEventListener("candidate-user-updated", sync);
  }, []);

  if (!getToken("candidate")) {
    return <Navigate to="/candidate/login" replace />;
  }

  const name = user?.name || "Candidate";

  const signOut = () => {
    logoutCandidate();
    navigate("/candidate/login");
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-slate-950 text-white" : "bg-[#f7f9fc] text-[#101c30]"
      }`}
    >
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-[252px] flex-col border-r lg:static ${
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-gray-200 bg-white"
          }`}
        >
          <div
            className={`flex h-[70px] shrink-0 items-center border-b px-6 ${
              darkMode ? "border-slate-800" : "border-gray-100"
            }`}
          >
            <div>
              <div className="mb-1 h-[6px] w-[44px] bg-[#f2383d]" />
              <span
                className={`text-[23px] font-extrabold tracking-tight ${
                  darkMode ? "text-white" : "text-black"
                }`}
              >
                Proliant Data
              </span>
            </div>
          </div>

          <div className="px-3 pt-7">
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Candidate Portal
            </p>

            <nav className="space-y-1.5">
              {navigation.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[14px] font-medium transition-colors ${
                    active === label
                      ? "bg-[#f2383d] text-white shadow-sm"
                      : darkMode
                        ? "text-slate-300 hover:bg-slate-800"
                        : "text-slate-700 hover:bg-red-50 hover:text-[#f2383d]"
                  }`}
                >
                  <Icon size={19} strokeWidth={1.9} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div
            className={`mt-auto border-t p-3 ${
              darkMode ? "border-slate-800" : "border-gray-100"
            }`}
          >
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-[#f2383d]"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={`sticky top-0 z-20 flex h-[70px] items-center gap-4 border-b px-5 sm:px-8 ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-gray-200 bg-white"
            }`}
          >
            {onSearchChange ? (
              <div
                className={`flex h-[42px] w-full max-w-[490px] items-center gap-3 rounded-full px-4 ${
                  darkMode ? "bg-slate-800" : "bg-[#f3f5f9]"
                }`}
              >
                <Search size={18} className="shrink-0 text-slate-500" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    aria-label="Clear search"
                  >
                    <X size={16} className="text-slate-500" />
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-5">
              <NotificationBell />

              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                aria-label="Toggle dark mode"
                className="rounded-full p-2 text-slate-500 hover:bg-gray-100"
              >
                <Moon size={20} />
              </button>

              <div
                className={`hidden h-8 w-px sm:block ${
                  darkMode ? "bg-slate-700" : "bg-gray-200"
                }`}
              />

              <button
                type="button"
                onClick={() => navigate("/candidate-profile")}
                className="flex items-center gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2383d] text-sm font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </span>

                <span className="hidden text-left sm:block">
                  <span className="block max-w-[140px] truncate text-sm font-semibold">
                    {name}
                  </span>
                  <span className="block text-xs text-slate-500">
                    Candidate
                  </span>
                </span>

                <ChevronDown
                  size={16}
                  className="hidden text-slate-500 sm:block"
                />
              </button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1600px] flex-1 px-5 py-6 sm:px-8 sm:py-7">
            {children({ darkMode })}
          </main>
        </div>
      </div>
    </div>
  );
}

export function PageState({ loading, error, onRetry, children }) {
  if (loading) {
    return (
      <p className="py-16 text-center text-sm text-slate-500" role="status">
        Loading...
      </p>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center" role="alert">
        <p className="text-sm text-red-600">{error}</p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-lg border border-[#f2383d] px-4 py-2 text-sm font-semibold text-[#f2383d] hover:bg-[#f2383d] hover:text-white"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return children;
}
