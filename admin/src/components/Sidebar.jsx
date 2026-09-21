import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BriefcaseBusiness,
  UserRoundSearch,
  MessageSquareText,
  Globe2,
  LogOut,
} from "lucide-react";

import proliantBlackLogo from "../assets/logo/proliant black/proliant_black.png";
import proliantWhiteLogo from "../assets/logo/ProliantWhite/proliant_white.png";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const managementLinks = [
  {
    name: "Employees",
    path: "/employees",
    icon: Users,
  },
  {
    name: "Team Members",
    path: "/team-members",
    icon: UserCog,
  },
  {
    name: "Jobs",
    path: "/jobs",
    icon: BriefcaseBusiness,
  },
  // {
  //   name: "Countries",
  //   path: "/countries",
  //   icon: Globe2,
  // },
];

const recruitmentLinks = [
  {
    name: "Candidates",
    path: "/candidates",
    icon: UserRoundSearch,
  },
];

const communicationLinks = [
  {
    name: "Enquiries",
    path: "/enquiries",
    icon: MessageSquareText,
  },
];

const mobileLinks = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Employees",
    path: "/employees",
    icon: Users,
  },
  {
    name: "Team Members",
    path: "/team-members",
    icon: UserCog,
  },
  {
    name: "Jobs",
    path: "/jobs",
    icon: BriefcaseBusiness,
  },
  // {
  //   name: "Countries",
  //   path: "/countries",
  //   icon: Globe2,
  // },
  {
    name: "Candidates",
    path: "/candidates",
    icon: UserRoundSearch,
  },
  {
    name: "Enquiries",
    path: "/enquiries",
    icon: MessageSquareText,
  },
];

function Sidebar() {
  const handleLogout = async () => {
    const token = localStorage.getItem("adminToken");

    try {
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
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");

      window.location.href = "/login";
    }
  };

  /* =========================================================
     DESKTOP / TABLET NAV LINK
  ========================================================== */

  const navLinkClass = ({ isActive }) =>
    [
      "group flex items-center gap-3 rounded-lg px-3 py-2.5",
      "text-sm font-medium transition-colors",
      "focus:outline-none",
      "focus-visible:ring-2 focus-visible:ring-[#EF3B3A]/40",

      isActive
        ? [
            "bg-red-50",
            "!text-[#EF3B3A]",
            "hover:bg-red-50",

            /* DARK MODE */
            "dark:bg-red-950/60",
            "dark:!text-white",
            "dark:hover:bg-red-950/70",
            "dark:hover:!text-white",
          ].join(" ")
        : [
            /* LIGHT MODE */
            "!text-gray-600",
            "hover:bg-gray-50",
            "hover:!text-gray-900",

            /* DARK MODE */
            "dark:!text-white",
            "dark:hover:bg-gray-800",
            "dark:hover:!text-white",
          ].join(" "),
    ].join(" ");

  return (
    <>
      {/* =========================================================
          DESKTOP / TABLET SIDEBAR
      ========================================================== */}

      <aside
        className="
          fixed inset-y-0 left-0 z-40
          flex h-screen w-64 shrink-0 flex-col
          border-r border-gray-200
          bg-white
          transition-colors duration-200

          dark:border-gray-800
          dark:bg-gray-900

          max-[767px]:hidden
        "
      >
        {/* =====================================================
            LOGO
        ====================================================== */}

        <div
          className="
            flex h-20 items-center
            border-b border-gray-200
            px-6
            dark:border-gray-800
          "
        >
          <div className="flex flex-col">
            {/* LIGHT MODE */}

            <img
              src={proliantBlackLogo}
              alt="Proliant Data"
              className="
                block
                h-9
                w-auto
                max-w-36
                object-contain
                dark:hidden
              "
            />

            {/* DARK MODE */}

            <img
              src={proliantWhiteLogo}
              alt="Proliant Data"
              className="
                hidden
                h-9
                w-auto
                max-w-36
                object-contain
                dark:block
              "
            />

            <p
              className="
                mt-1
                text-xs
                font-medium

                text-gray-500
                dark:text-white!
              "
            >
              Admin Portal
            </p>
          </div>
        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {/* ===================================================
              DASHBOARD
          ==================================================== */}

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              [
                "group mb-5 flex items-center gap-3 rounded-lg px-3 py-2.5",
                "text-sm font-medium transition-colors",
                "focus:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[#EF3B3A]/40",

                isActive
                  ? [
                      "bg-red-50",
                      "text-[#EF3B3A]!",
                      "hover:bg-red-50",

                      "dark:bg-red-950/60",
                      "dark:text-white!",
                      "dark:hover:bg-red-950/70",
                      "dark:hover:text-white!",
                    ].join(" ")
                  : [
                      "text-gray-600!",
                      "hover:bg-gray-50",
                      "hover:text-gray-900!",

                      "dark:text-white!",
                      "dark:hover:bg-gray-800",
                      "dark:hover:text-white!",
                    ].join(" "),
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard
                  size={19}
                  strokeWidth={2}
                  className="
                    shrink-0
                    text-gray-600
                    group-hover:text-gray-900
                    dark:text-white!
                    dark:group-hover:text-white!
                  "
                />

                <span className="dark:text-white!">
                  Dashboard
                </span>
              </>
            )}
          </NavLink>

          {/* ===================================================
              MANAGEMENT
          ==================================================== */}

          <div className="mb-5">
            <p
              className="
                mb-2 px-3
                text-xs font-semibold uppercase tracking-wider

                text-gray-400
                dark:text-white!
              "
            >
              Management
            </p>

            <div className="space-y-1">
              {managementLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={navLinkClass}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={19}
                          strokeWidth={2}
                          className={`
                            shrink-0
                            ${
                              isActive
                                ? "text-[#EF3B3A] dark:text-white!"
                                : "text-gray-600 dark:text-white!"
                            }
                          `}
                        />

                        <span className="dark:text-white!">
                          {link.name}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* ===================================================
              RECRUITMENT
          ==================================================== */}

          <div className="mb-5">
            <p
              className="
                mb-2 px-3
                text-xs font-semibold uppercase tracking-wider

                text-gray-400
                dark:text-white!
              "
            >
              Recruitment
            </p>

            <div className="space-y-1">
              {recruitmentLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={navLinkClass}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={19}
                          strokeWidth={2}
                          className={`
                            shrink-0
                            ${
                              isActive
                                ? "text-[#EF3B3A] dark:text-white!"
                                : "text-gray-600 dark:text-white!"
                            }
                          `}
                        />

                        <span className="dark:text-white!">
                          {link.name}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* ===================================================
              COMMUNICATION
          ==================================================== */}

          <div>
            <p
              className="
                mb-2 px-3
                text-xs font-semibold uppercase tracking-wider

                text-gray-400
                dark:text-white!
              "
            >
              Communication
            </p>

            <div className="space-y-1">
              {communicationLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={navLinkClass}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={19}
                          strokeWidth={2}
                          className={`
                            shrink-0
                            ${
                              isActive
                                ? "text-[#EF3B3A] dark:text-white!"
                                : "text-gray-600 dark:text-white!"
                            }
                          `}
                        />

                        <span className="dark:text-white!">
                          {link.name}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        {/* =====================================================
            LOGOUT
        ====================================================== */}

        <div
          className="
            border-t border-gray-200
            p-3
            dark:border-gray-800
          "
        >
          <button
            type="button"
            onClick={handleLogout}
            className="
              group
              flex w-full items-center gap-3
              rounded-lg
              px-3 py-2.5
              text-sm font-medium
              transition-colors

              text-gray-600
              hover:bg-gray-50
              hover:text-gray-900

              dark:text-white!
              dark:hover:bg-gray-800
              dark:hover:text-white!
            "
          >
            <LogOut
              size={19}
              strokeWidth={2}
              className="
                shrink-0
                text-gray-600
                group-hover:text-gray-900
                dark:text-white!
                dark:group-hover:text-white!
              "
            />

            <span className="dark:text-white!">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* =========================================================
          MOBILE BOTTOM NAVIGATION
      ========================================================== */}

      <nav
        className="
          fixed bottom-0 left-0 right-0 z-50
          hidden h-18
          border-t border-gray-800
          bg-black
          shadow-[0_-2px_10px_rgba(0,0,0,0.25)]
          max-[767px]:block
        "
      >
        <div className="flex h-full w-full items-center justify-around px-1">
          {mobileLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `
                    flex h-full min-w-0 flex-1
                    flex-col items-center
                    justify-center gap-1 px-1
                    transition-colors

                    ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.8 : 2.5}
                      className={
                        isActive
                          ? "text-white"
                          : "text-gray-400"
                      }
                    />

                    <span
                      className={`
                        truncate
                        text-[10px]
                        leading-3

                        ${
                          isActive
                            ? "font-bold text-white"
                            : "font-semibold text-gray-400"
                        }
                      `}
                    >
                      {link.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default Sidebar;