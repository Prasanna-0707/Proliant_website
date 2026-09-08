import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  UserRoundSearch,
  MessageSquareText,
  LogOut,
} from "lucide-react";

const managementLinks = [
  {
    name: "Employees",
    path: "/employees",
    icon: Users,
  },
  {
    name: "Jobs",
    path: "/jobs",
    icon: BriefcaseBusiness,
  },
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

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-gray-200 px-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            PROLIANT
          </h1>
          <p className="mt-0.5 text-xs font-medium text-gray-500">
            Admin Portal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `mb-5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-red-50 text-[#EF3B3A]"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <LayoutDashboard size={19} strokeWidth={2} />
          <span>Dashboard</span>
        </NavLink>

        {/* Management */}
        <div className="mb-5">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Management
          </p>

          <div className="space-y-1">
            {managementLinks.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-red-50 text-[#EF3B3A]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <Icon size={19} strokeWidth={2} />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Recruitment */}
        <div className="mb-5">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Recruitment
          </p>

          <div className="space-y-1">
            {recruitmentLinks.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-red-50 text-[#EF3B3A]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <Icon size={19} strokeWidth={2} />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Communication */}
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Communication
          </p>

          <div className="space-y-1">
            {communicationLinks.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-red-50 text-[#EF3B3A]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <Icon size={19} strokeWidth={2} />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut size={19} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;