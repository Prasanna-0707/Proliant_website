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

const managementLinks = [
  {
    name: "Employees",
    path: "/employees",
    icon: Users,
  },
  {
  name: "EmployeesTemp",
  path: "/employees-temp",
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
  {
    name: "Countries",
    path: "/countries",
    icon: Globe2,
  },
];
>>>>>>> origin/lavanya-dev

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
      navigate("/login", { replace: true });
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

  const renderLogoutButton = (mobile = false) => (
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
      {/* Desktop sidebar */}
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

      {/* Mobile top header */}
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

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Mobile drawer */}
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
            {role.replaceAll("_", " ")}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          {renderSections(true)}
        </div>

        <div className="shrink-0 border-t border-gray-100 p-3 dark:border-gray-800">
          {renderLogoutButton(true)}
        </div>
      </aside>

      {/* Mobile bottom navigation */}
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





// import { NavLink } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Users,
//   UserCog,
//   BriefcaseBusiness,
//   UserRoundSearch,
//   MessageSquareText,
//   Globe2,
//   LogOut,
// } from "lucide-react";

// import proliantBlackLogo from "../assets/logo/Proliant Black/proliant_black.png";
// import proliantWhiteLogo from "../assets/logo/ProliantWhite/proliant_white.png";

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// const managementLinks = [
//   {
//     name: "Employees",
//     path: "/employees",
//     icon: Users,
//   },
//   {
//   name: "EmployeesTemp",
//   path: "/employees-temp",
//   icon: Users,
// },
//   {
//     name: "Team Members",
//     path: "/team-members",
//     icon: UserCog,
//   },
//   {
//     name: "Jobs",
//     path: "/jobs",
//     icon: BriefcaseBusiness,
//   },
//   {
//     name: "Countries",
//     path: "/countries",
//     icon: Globe2,
//   },
// ];

// const recruitmentLinks = [
//   {
//     name: "Candidates",
//     path: "/candidates",
//     icon: UserRoundSearch,
//   },
// ];

// const communicationLinks = [
//   {
//     name: "Enquiries",
//     path: "/enquiries",
//     icon: MessageSquareText,
//   },
// ];

// const mobileLinks = [
//   {
//     name: "Dashboard",
//     path: "/dashboard",
//     icon: LayoutDashboard,
//   },
//   {
//     name: "Employees",
//     path: "/employees",
//     icon: Users,
//   },
//   {
//     name: "Team Members",
//     path: "/team-members",
//     icon: UserCog,
//   },
//   {
//     name: "Jobs",
//     path: "/jobs",
//     icon: BriefcaseBusiness,
//   },
//   {
//     name: "Countries",
//     path: "/countries",
//     icon: Globe2,
//   },
//   {
//     name: "Candidates",
//     path: "/candidates",
//     icon: UserRoundSearch,
//   },
//   {
//     name: "Enquiries",
//     path: "/enquiries",
//     icon: MessageSquareText,
//   },
// ];

// function Sidebar() {
//   const handleLogout = async () => {
//     const token = localStorage.getItem("adminToken");

//     try {
//       if (token) {
//         const response = await fetch(`${API_BASE_URL}/auth/logout`, {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           console.error("Logout API failed:", response.status);
//         }
//       }
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       localStorage.removeItem("adminToken");
//       localStorage.removeItem("adminUser");

//       window.location.href = "/login";
//     }
//   };

//   /* =========================================================
//      DESKTOP / TABLET NAV LINK
//   ========================================================== */

//   const navLinkClass = ({ isActive }) =>
//     [
//       "group flex items-center gap-3 rounded-lg px-3 py-2.5",
//       "text-sm font-medium transition-colors",
//       "focus:outline-none",
//       "focus-visible:ring-2 focus-visible:ring-[#EF3B3A]/40",

//       isActive
//         ? [
//             "bg-red-50",
//             "!text-[#EF3B3A]",
//             "hover:bg-red-50",

//             /* DARK MODE */
//             "dark:bg-red-950/60",
//             "dark:!text-white",
//             "dark:hover:bg-red-950/70",
//             "dark:hover:!text-white",
//           ].join(" ")
//         : [
//             /* LIGHT MODE */
//             "!text-gray-600",
//             "hover:bg-gray-50",
//             "hover:!text-gray-900",

//             /* DARK MODE */
//             "dark:!text-white",
//             "dark:hover:bg-gray-800",
//             "dark:hover:!text-white",
//           ].join(" "),
//     ].join(" ");

//   return (
//     <>
//       {/* =========================================================
//           DESKTOP / TABLET SIDEBAR
//       ========================================================== */}

//       <aside
//         className="
//           fixed inset-y-0 left-0 z-40
//           flex h-screen w-64 shrink-0 flex-col
//           border-r border-gray-200
//           bg-white
//           transition-colors duration-200

//           dark:border-gray-800
//           dark:bg-gray-900

//           max-[767px]:hidden
//         "
//       >
//         {/* =====================================================
//             LOGO
//         ====================================================== */}

//         <div
//           className="
//             flex h-20 items-center
//             border-b border-gray-200
//             px-6
//             dark:border-gray-800
//           "
//         >
//           <div className="flex flex-col">
//             {/* LIGHT MODE */}
//             <img
//               src={proliantBlackLogo}
//               alt="Proliant Data"
//               className="
//                 block
//                 h-9
//                 w-auto
//                 max-w-36
//                 object-contain
//                 dark:hidden
//               "
//             />

//             {/* DARK MODE */}
//             <img
//               src={proliantWhiteLogo}
//               alt="Proliant Data"
//               className="
//                 hidden
//                 h-9
//                 w-auto
//                 max-w-36
//                 object-contain
//                 dark:block
//               "
//             />

//             <p
//               className="
//                 mt-1
//                 text-xs
//                 font-medium
//                 text-gray-500
//                 dark:text-white!
//               "
//             >
//               Admin Portal
//             </p>
//           </div>
//         </div>

//         {/* =====================================================
//             NAVIGATION
//         ====================================================== */}

//         <nav className="flex-1 overflow-y-auto px-3 py-5">
//           {/* ===================================================
//               DASHBOARD
//           ==================================================== */}

//           <NavLink
//             to="/dashboard"
//             className={({ isActive }) =>
//               [
//                 "group mb-5 flex items-center gap-3 rounded-lg px-3 py-2.5",
//                 "text-sm font-medium transition-colors",
//                 "focus:outline-none",
//                 "focus-visible:ring-2 focus-visible:ring-[#EF3B3A]/40",

//                 isActive
//                   ? [
//                       "bg-red-50",
//                       "text-[#EF3B3A]!",
//                       "hover:bg-red-50",

//                       "dark:bg-red-950/60",
//                       "dark:text-white!",
//                       "dark:hover:bg-red-950/70",
//                       "dark:hover:text-white!",
//                     ].join(" ")
//                   : [
//                       "text-gray-600!",
//                       "hover:bg-gray-50",
//                       "hover:text-gray-900!",

//                       "dark:text-white!",
//                       "dark:hover:bg-gray-800",
//                       "dark:hover:text-white!",
//                     ].join(" "),
//               ].join(" ")
//             }
//           >
//             {({ isActive }) => (
//               <>
//                 <LayoutDashboard
//                   size={19}
//                   strokeWidth={2}
//                   className="
//                     shrink-0
//                     text-gray-600
//                     group-hover:text-gray-900
//                     dark:text-white!
//                     dark:group-hover:text-white!
//                   "
//                 />

//                 <span className="dark:text-white!">
//                   Dashboard
//                 </span>
//               </>
//             )}
//           </NavLink>

//           {/* ===================================================
//               MANAGEMENT
//           ==================================================== */}

//           <div className="mb-5">
//             <p
//               className="
//                 mb-2 px-3
//                 text-xs font-semibold uppercase tracking-wider
//                 text-gray-400
//                 dark:text-white!
//               "
//             >
//               Management
//             </p>

//             <div className="space-y-1">
//               {managementLinks.map((link) => {
//                 const Icon = link.icon;

//                 return (
//                   <NavLink
//                     key={link.path}
//                     to={link.path}
//                     className={navLinkClass}
//                   >
//                     {({ isActive }) => (
//                       <>
//                         <Icon
//                           size={19}
//                           strokeWidth={2}
//                           className={`
//                             shrink-0
//                             ${
//                               isActive
//                                 ? "text-[#EF3B3A] dark:text-white!"
//                                 : "text-gray-600 dark:text-white!"
//                             }
//                           `}
//                         />

//                         <span className="dark:text-white!">
//                           {link.name}
//                         </span>
//                       </>
//                     )}
//                   </NavLink>
//                 );
//               })}
//             </div>
//           </div>

//           {/* ===================================================
//               RECRUITMENT
//           ==================================================== */}

//           <div className="mb-5">
//             <p
//               className="
//                 mb-2 px-3
//                 text-xs font-semibold uppercase tracking-wider
//                 text-gray-400
//                 dark:text-white!
//               "
//             >
//               Recruitment
//             </p>

//             <div className="space-y-1">
//               {recruitmentLinks.map((link) => {
//                 const Icon = link.icon;

//                 return (
//                   <NavLink
//                     key={link.path}
//                     to={link.path}
//                     className={navLinkClass}
//                   >
//                     {({ isActive }) => (
//                       <>
//                         <Icon
//                           size={19}
//                           strokeWidth={2}
//                           className={`
//                             shrink-0
//                             ${
//                               isActive
//                                 ? "text-[#EF3B3A] dark:text-white!"
//                                 : "text-gray-600 dark:text-white!"
//                             }
//                           `}
//                         />

//                         <span className="dark:text-white!">
//                           {link.name}
//                         </span>
//                       </>
//                     )}
//                   </NavLink>
//                 );
//               })}
//             </div>
//           </div>

//           {/* ===================================================
//               COMMUNICATION
//           ==================================================== */}

//           <div>
//             <p
//               className="
//                 mb-2 px-3
//                 text-xs font-semibold uppercase tracking-wider
//                 text-gray-400
//                 dark:text-white!
//               "
//             >
//               Communication
//             </p>

//             <div className="space-y-1">
//               {communicationLinks.map((link) => {
//                 const Icon = link.icon;

//                 return (
//                   <NavLink
//                     key={link.path}
//                     to={link.path}
//                     className={navLinkClass}
//                   >
//                     {({ isActive }) => (
//                       <>
//                         <Icon
//                           size={19}
//                           strokeWidth={2}
//                           className={`
//                             shrink-0
//                             ${
//                               isActive
//                                 ? "text-[#EF3B3A] dark:text-white!"
//                                 : "text-gray-600 dark:text-white!"
//                             }
//                           `}
//                         />

//                         <span className="dark:text-white!">
//                           {link.name}
//                         </span>
//                       </>
//                     )}
//                   </NavLink>
//                 );
//               })}
//             </div>
//           </div>
//         </nav>

//         {/* =====================================================
//             LOGOUT
//         ====================================================== */}

//         <div
//           className="
//             border-t border-gray-200
//             p-3
//             dark:border-gray-800
//           "
//         >
//           <button
//             type="button"
//             onClick={handleLogout}
//             className="
//               group
//               flex w-full items-center gap-3
//               rounded-lg
//               px-3 py-2.5
//               text-sm font-medium
//               transition-colors

//               text-gray-600
//               hover:bg-gray-50
//               hover:text-gray-900

//               dark:text-white!
//               dark:hover:bg-gray-800
//               dark:hover:text-white!
//             "
//           >
//             <LogOut
//               size={19}
//               strokeWidth={2}
//               className="
//                 shrink-0
//                 text-gray-600
//                 group-hover:text-gray-900
//                 dark:text-white!
//                 dark:group-hover:text-white!
//               "
//             />

//             <span className="dark:text-white!">
//               Logout
//             </span>
//           </button>
//         </div>
//       </aside>

//       {/* =========================================================
//           MOBILE BOTTOM NAVIGATION
//       ========================================================== */}

//       <nav
//         className="
//           fixed bottom-0 left-0 right-0 z-50
//           hidden h-18
//           border-t border-gray-800
//           bg-black
//           shadow-[0_-2px_10px_rgba(0,0,0,0.25)]
//           max-[767px]:block
//         "
//       >
//         <div className="flex h-full w-full items-center justify-around px-1">
//           {mobileLinks.map((link) => {
//             const Icon = link.icon;

//             return (
//               <NavLink
//                 key={link.path}
//                 to={link.path}
//                 className={({ isActive }) =>
//                   `
//                     flex h-full min-w-0 flex-1
//                     flex-col items-center
//                     justify-center gap-1 px-1
//                     transition-colors

//                     ${
//                       isActive
//                         ? "text-white"
//                         : "text-gray-400 hover:text-white"
//                     }
//                   `
//                 }
//               >
//                 {({ isActive }) => (
//                   <>
//                     <Icon
//                       size={22}
//                       strokeWidth={isActive ? 2.8 : 2.5}
//                       className={
//                         isActive
//                           ? "text-white"
//                           : "text-gray-400"
//                       }
//                     />

//                     <span
//                       className={`
//                         truncate
//                         text-[10px]
//                         leading-3

//                         ${
//                           isActive
//                             ? "font-bold text-white"
//                             : "font-semibold text-gray-400"
//                         }
//                       `}
//                     >
//                       {link.name}
//                     </span>
//                   </>
//                 )}
//               </NavLink>
//             );
//           })}
//         </div>
//       </nav>
//     </>
//   );
// }

// export default Sidebar;