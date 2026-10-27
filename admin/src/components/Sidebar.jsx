
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";

import blackLogo from "../assets/logo/Proliant Black/proliant_black.png";
import whiteLogo from "../assets/logo/ProliantWhite/proliant_white.png";

import {
  sidebarConfig,
  normalizeUserRole,
} from "../config/sidebarConfig";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("adminUser") || "null");
  } catch {
    return null;
  }
}

function Sidebar({ user: userProp, onLogout }) {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const user = userProp ?? getStoredUser();
  const role = normalizeUserRole(user);
  const sections = sidebarConfig[role] || sidebarConfig.HR;

  const closeMobileMenu = () => setMobileOpen(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      if (onLogout) {
        await onLogout();
      } else {
        const token = localStorage.getItem("adminToken");

        if (token) {
          const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            console.error("Logout API failed:", response.status);
          }
        }
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");

      setLoggingOut(false);
      setMobileOpen(false);

      navigate("/admin/login", { replace: true });
    }
  };

  const navLinkClass = ({ isActive }) =>
    [
      "group flex w-full items-center gap-3 rounded-xl",
      "px-3 py-3 text-sm font-medium transition-colors duration-200",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF3B3A]/40",
      isActive
        ? "bg-[#EF3B3A] text-white shadow-sm"
        : [
            "text-gray-700 hover:bg-gray-100 hover:text-gray-950",
            "dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
          ].join(" "),
    ].join(" ");

  const renderSections = (mobile = false) => (
    <nav className="space-y-6">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
            {section.title}
          </h2>

          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={mobile ? closeMobileMenu : undefined}
                  className={navLinkClass}
                >
                  <Icon
                    size={19}
                    strokeWidth={1.9}
                    className="shrink-0"
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>

                  <ChevronRight
                    size={15}
                    className="shrink-0 opacity-0 transition-opacity group-hover:opacity-60"
                  />
                </NavLink>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );

  const renderLogo = (mobile = false) => (
    <NavLink
      to="/dashboard"
      onClick={mobile ? closeMobileMenu : undefined}
      className="inline-flex items-center"
      aria-label="Go to Dashboard"
    >
      <img
        src={blackLogo}
        alt="Proliant Data"
        className={
          mobile
            ? "h-9 max-w-full object-contain dark:hidden"
            : "h-10 max-w-full object-contain dark:hidden"
        }
      />

      <img
        src={whiteLogo}
        alt="Proliant Data"
        className={
          mobile
            ? "hidden h-9 max-w-full object-contain dark:block"
            : "hidden h-10 max-w-full object-contain dark:block"
        }
      />
    </NavLink>
  );

  const renderLogoutButton = () => (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className={[
        "flex w-full items-center gap-3 rounded-xl px-3 py-3",
        "text-sm font-medium transition-colors",
        "text-gray-600 hover:bg-red-50 hover:text-[#EF3B3A]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "dark:text-gray-300 dark:hover:bg-red-950/30",
      ].join(" ")}
    >
      <LogOut size={19} className="shrink-0" />
      <span>{loggingOut ? "Logging out..." : "Logout"}</span>
    </button>
  );

  const mobileItems = sections
    .flatMap((section) => section.items)
    .filter(
      (item, index, items) =>
        items.findIndex((other) => other.path === item.path) === index
    )
    .slice(0, 4);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-gray-200 bg-white md:flex dark:border-gray-800 dark:bg-gray-950">
        <div className="flex h-20 shrink-0 items-center border-b border-gray-100 px-5 dark:border-gray-800">
          {renderLogo()}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          {renderSections()}
        </div>

        <div className="shrink-0 border-t border-gray-100 p-3 dark:border-gray-800">
          {renderLogoutButton()}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950 md:hidden">
        {renderLogo(true)}

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[min(300px,85vw)] flex-col",
          "border-r border-gray-200 bg-white shadow-xl",
          "transition-transform duration-200 md:hidden",
          "dark:border-gray-800 dark:bg-gray-950",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-hidden={!mobileOpen}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-5 dark:border-gray-800">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Navigation
          </span>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="shrink-0 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {user?.name || user?.fullName || "User"}
          </p>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {String(role || "user").replaceAll("_", " ")}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          {renderSections(true)}
        </div>

        <div className="shrink-0 border-t border-gray-100 p-3 dark:border-gray-800">
          {renderLogoutButton()}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-gray-800 dark:bg-gray-950 md:hidden">
        <div className="flex h-16 items-center justify-around px-1">
          {mobileItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  [
                    "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2",
                    "text-[10px] font-medium",
                    isActive
                      ? "text-[#EF3B3A]"
                      : "text-gray-500 dark:text-gray-400",
                  ].join(" ")
                }
              >
                <Icon size={19} strokeWidth={1.9} />
                <span className="max-w-full truncate">{item.label}</span>
              </NavLink>
            );
          })}

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium text-gray-500 dark:text-gray-400"
          >
            <Menu size={19} />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default Sidebar;
