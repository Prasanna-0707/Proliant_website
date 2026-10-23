import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Users,
  ShieldCheck,
  Settings,
  ClipboardList,
  UserRoundCog,
  ArrowRight,
  CalendarDays,
  Activity,
  UserCheck,
  UserX,
} from "lucide-react";

const adminQuickActions = [
  {
    title: "Manage Users",
    description: "View and manage portal users",
    href: "/users",
    icon: Users,
    iconColor: "text-blue-600",
    wrapperColor:
      "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50",
  },
  {
    title: "Roles & Permissions",
    description: "Manage roles and access permissions",
    href: "/roles-permissions",
    icon: ShieldCheck,
    iconColor: "text-green-600",
    wrapperColor:
      "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50",
  },
  {
    title: "Audit Logs",
    description: "Review recent system activities",
    href: "/audit-logs",
    icon: ClipboardList,
    iconColor: "text-purple-600",
    wrapperColor:
      "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50",
  },
  {
    title: "System Settings",
    description: "Configure portal settings",
    href: "/settings",
    icon: Settings,
    iconColor: "text-orange-600",
    wrapperColor:
      "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50",
  },
];

function getAdminName() {
  try {
    const storedUser = localStorage.getItem("adminUser");

    if (!storedUser) {
      return "Administrator";
    }

    const user = JSON.parse(storedUser);

    return (
      user.name ||
      user.fullName ||
      user.firstName ||
      user.username ||
      user.email?.split("@")[0] ||
      "Administrator"
    );
  } catch {
    return "Administrator";
  }
}

function AdminDashboard() {
  const [adminStats, setAdminStats] = useState({
    totalUsers: null,
    activeUsers: null,
    roles: null,
    recentActivities: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const adminName = getAdminName();

  /*
   * Admin dashboard overview.
   *
   * Admin statistics and activity data can be connected
   * to the corresponding backend endpoints when available.
   *
   * No recruitment API data is used on this dashboard.
   */

  useEffect(() => {
    // Admin dashboard data will be fetched here
    // when the admin statistics and activity APIs are available.
  }, []);

  const overviewCards = [
    {
      title: "Total Users",
      value: adminStats.totalUsers,
      description: "Registered portal users",
      icon: Users,
      iconBg:
        "bg-blue-50 dark:bg-blue-950/40",
      iconText:
        "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Active Users",
      value: adminStats.activeUsers,
      description: "Currently active users",
      icon: UserCheck,
      iconBg:
        "bg-green-50 dark:bg-green-950/40",
      iconText:
        "text-green-600 dark:text-green-400",
    },
    {
      title: "Roles & Permissions",
      value: adminStats.roles,
      description: "Configured access roles",
      icon: ShieldCheck,
      iconBg:
        "bg-purple-50 dark:bg-purple-950/40",
      iconText:
        "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Recent Activities",
      value: adminStats.recentActivities.length,
      description: "Recorded system activities",
      icon: Activity,
      iconBg:
        "bg-orange-50 dark:bg-orange-950/40",
      iconText:
        "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div
      className="
        relative min-h-full
        bg-slate-50 px-5 py-6
        text-slate-900 transition-colors
        dark:bg-slate-950 dark:text-slate-100
        sm:px-6 sm:py-7 xl:px-8
      "
    >
      <div className="mx-auto w-full max-w-375">

        {/* PAGE HEADER */}

        <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#EF3B3A]">
              Administrator
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#071737] dark:text-white">
              Welcome back,{" "}
              <span className="text-[#EF3B3A]">
                {adminName}!
              </span>
            </h1>

            <p className="mt-1.5 text-base text-slate-500 dark:text-slate-400">
              Manage users, access permissions, workflow
              templates and system settings.
            </p>
          </div>

          <div
            className="
              flex w-full items-center gap-3
              rounded-xl border border-white/80
              bg-white/80 px-4 py-3 shadow-sm
              backdrop-blur-sm dark:border-slate-800
              dark:bg-slate-900/80 xl:w-86.25
            "
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
              <CalendarDays size={22} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#071737] dark:text-white">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Have a productive day!
              </p>
            </div>
          </div>
        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* ADMIN OVERVIEW CARDS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="
                  rounded-xl border border-white/90
                  bg-white/85 p-4 shadow-sm
                  backdrop-blur-sm transition-colors
                  dark:border-slate-800
                  dark:bg-slate-900/85
                "
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconText}`}
                  >
                    <Icon size={27} strokeWidth={2} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#071737] dark:text-white">
                      {stat.title}
                    </p>

                    <p className="mt-1 text-3xl font-bold leading-none text-[#071737] dark:text-white">
                      {isLoading
                        ? "..."
                        : stat.value ?? "—"}
                    </p>

                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MAIN ADMIN DASHBOARD CONTENT */}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">

          {/* QUICK ACTIONS */}

          <section
            className="
              overflow-hidden rounded-xl
              border border-white/90 bg-white/85
              p-5 shadow-sm backdrop-blur-sm
              dark:border-slate-800 dark:bg-slate-900/85
              xl:col-span-5
            "
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
                <UserRoundCog size={21} />
              </div>

              <div>
                <h2 className="text-base font-bold text-[#071737] dark:text-white">
                  Administration
                </h2>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Manage your portal configuration and access.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {adminQuickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.title}
                    to={action.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${action.wrapperColor}`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-800 ${action.iconColor}`}
                    >
                      <Icon size={19} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-[#071737] dark:text-white">
                        {action.title}
                      </span>

                      <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                        {action.description}
                      </span>
                    </span>

                    <ArrowRight
                      size={18}
                      className={`${action.iconColor} transition-transform group-hover:translate-x-0.5`}
                    />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* RECENT SYSTEM ACTIVITY */}

          <section
            className="
              overflow-hidden rounded-xl
              border border-white/90 bg-white/85
              shadow-sm backdrop-blur-sm
              dark:border-slate-800 dark:bg-slate-900/85
              xl:col-span-7
            "
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                  <Activity size={21} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#071737] dark:text-white">
                    Recent System Activity
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Latest administrative activities.
                  </p>
                </div>
              </div>

              <Link
                to="/audit-logs"
                className="flex items-center gap-1 text-sm font-semibold text-[#EF3B3A] hover:text-red-600"
              >
                View all
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="p-4">
              {isLoading ? (
                <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Loading activities...
                </div>
              ) : adminStats.recentActivities.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center dark:border-slate-700">
                  <Activity
                    size={30}
                    className="mx-auto mb-3 text-slate-400"
                  />

                  <p className="text-sm font-semibold text-[#071737] dark:text-white">
                    No recent activities found
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    System activity details will appear here
                    when available.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminStats.recentActivities.map(
                    (activity, index) => (
                      <div
                        key={activity.id || index}
                        className="
                          flex items-start gap-3
                          rounded-xl border border-slate-100
                          bg-white px-3 py-3
                          dark:border-slate-800
                          dark:bg-slate-800/50
                        "
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                          <Activity size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#071737] dark:text-white">
                            {activity.title || "System activity"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {activity.description || "-"}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {activity.date || "-"}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          {/* SYSTEM OVERVIEW */}

          <section
            className="
              overflow-hidden rounded-xl
              border border-white/90 bg-white/85
              shadow-sm backdrop-blur-sm
              dark:border-slate-800 dark:bg-slate-900/85
              xl:col-span-12
            "
          >
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#071737] dark:text-white">
                    System Overview
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Manage access, security and system configuration.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/users"
                className="
                  flex items-center gap-3 rounded-xl
                  border border-slate-100 bg-white p-4
                  transition hover:border-red-200 hover:bg-red-50/40
                  dark:border-slate-800 dark:bg-slate-800/50
                  dark:hover:border-red-900/50
                "
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Users size={21} />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#071737] dark:text-white">
                    User Management
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Manage portal users
                  </p>
                </div>
              </Link>

              <Link
                to="/roles-permissions"
                className="
                  flex items-center gap-3 rounded-xl
                  border border-slate-100 bg-white p-4
                  transition hover:border-red-200 hover:bg-red-50/40
                  dark:border-slate-800 dark:bg-slate-800/50
                  dark:hover:border-red-900/50
                "
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#071737] dark:text-white">
                    Access Control
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Configure roles and permissions
                  </p>
                </div>
              </Link>

              <Link
                to="/settings"
                className="
                  flex items-center gap-3 rounded-xl
                  border border-slate-100 bg-white p-4
                  transition hover:border-red-200 hover:bg-red-50/40
                  dark:border-slate-800 dark:bg-slate-800/50
                  dark:hover:border-red-900/50
                "
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                  <Settings size={21} />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#071737] dark:text-white">
                    System Settings
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Configure portal settings
                  </p>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

// import { useEffect, useMemo, useState } from "react";

// import {
//   ArrowRight,
//   BriefcaseBusiness,
//   CalendarDays,
//   ChevronRight,
//   Clock3,
//   Globe2,
//   Mail,
//   MapPin,
//   MoreVertical,
//   Server,
//   UserRoundPlus,
//   UserSearch,
//   Users,
//   Zap,
// } from "lucide-react";

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL ||
//   "http://localhost:5000/api";

// const formatDate = (date) => {
//   if (!date) return "-";

//   const parsedDate = new Date(date);

//   if (Number.isNaN(parsedDate.getTime())) {
//     return "-";
//   }

//   return parsedDate.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const formatExperience = (candidate) => {
//   if (candidate?.isFresher) {
//     return "Fresher";
//   }

//   if (
//     candidate?.yearsOfExperience !== undefined &&
//     candidate?.yearsOfExperience !== null
//   ) {
//     return `${candidate.yearsOfExperience} ${
//       candidate.yearsOfExperience === 1 ? "Year" : "Years"
//     }`;
//   }

//   return "-";
// };

// const getListFromResponse = (result, keys = []) => {
//   for (const key of keys) {
//     if (Array.isArray(result?.[key])) {
//       return result[key];
//     }
//   }

//   return Array.isArray(result) ? result : [];
// };

// const getCandidateStatus = (candidate) =>
//   candidate?.status ||
//   candidate?.applicationStatus ||
//   candidate?.stage ||
//   "New";

// const getInterviewDate = (candidate) =>
//   candidate?.interviewDate ||
//   candidate?.interview?.date ||
//   candidate?.scheduledInterviewDate ||
//   candidate?.interviewSchedule?.date ||
//   null;

// const isUpcomingDate = (date) => {
//   if (!date) return false;

//   const parsedDate = new Date(date);

//   if (Number.isNaN(parsedDate.getTime())) {
//     return false;
//   }

//   return parsedDate >= new Date();
// };

// function AdminDashboard() {
//   const [dashboardStats, setDashboardStats] = useState({});
//   const [recentApplications, setRecentApplications] = useState([]);
//   const [recentlyPostedJobs, setRecentlyPostedJobs] = useState([]);
//   const [candidates, setCandidates] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState("");

//   const getUserName = () => {
//     try {
//       const adminUser = localStorage.getItem("adminUser");

//       if (!adminUser) {
//         return "Admin";
//       }

//       const user = JSON.parse(adminUser);

//       return (
//         user.name ||
//         user.fullName ||
//         user.firstName ||
//         user.username ||
//         user.email?.split("@")[0] ||
//         "Admin"
//       );
//     } catch {
//       return "Admin";
//     }
//   };

//   const userName = getUserName();

//   /*
//    * Fetch dashboard data.
//    *
//    * Existing API base URL, endpoints, authentication headers,
//    * token validation, and backend connections are retained.
//    */

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       const token = localStorage.getItem("adminToken");

//       if (!token) {
//         setIsLoading(false);
//         return;
//       }

//       setIsLoading(true);
//       setError("");

//       try {
//         const authHeaders = {
//           Authorization: `Bearer ${token}`,
//         };

//         const [
//           statsResponse,
//           jobsResponse,
//           candidatesResponse,
//           enquiriesResponse,
//         ] = await Promise.all([
//           fetch(`${API_BASE_URL}/dashboard/stats`, {
//             headers: authHeaders,
//           }),

//           fetch(`${API_BASE_URL}/jobs`, {
//             headers: authHeaders,
//           }),

//           fetch(`${API_BASE_URL}/candidates`, {
//             headers: authHeaders,
//           }),

//           fetch(`${API_BASE_URL}/contacts`, {
//             headers: authHeaders,
//           }),
//         ]);

//         const responses = [
//           statsResponse,
//           jobsResponse,
//           candidatesResponse,
//           enquiriesResponse,
//         ];

//         if (responses.some((response) => response.status === 401)) {
//           localStorage.removeItem("adminToken");
//           localStorage.removeItem("adminUser");

//           window.location.href = "/login";
//           return;
//         }

//         if (!statsResponse.ok) {
//           throw new Error("Failed to load dashboard statistics.");
//         }

//         if (!jobsResponse.ok) {
//           throw new Error("Failed to load jobs.");
//         }

//         if (!candidatesResponse.ok) {
//           throw new Error("Failed to load candidates.");
//         }

//         if (!enquiriesResponse.ok) {
//           throw new Error("Failed to load enquiries.");
//         }

//         const [
//           statsResult,
//           jobsResult,
//           candidatesResult,
//           enquiriesResult,
//         ] = await Promise.all([
//           statsResponse.json(),
//           jobsResponse.json(),
//           candidatesResponse.json(),
//           enquiriesResponse.json(),
//         ]);

//         const statsResultData =
//           statsResult?.stats || statsResult || {};

//         const jobs = getListFromResponse(jobsResult, [
//           "jobs",
//           "data",
//         ]);

//         const candidateList = getListFromResponse(
//           candidatesResult,
//           ["candidates", "data"]
//         );

//         const enquiries = getListFromResponse(
//           enquiriesResult,
//           ["contacts", "enquiries", "data"]
//         );

//         /*
//          * Retain the existing backend stats.
//          * Employee/deployment/enquiry metrics are still fetched,
//          * even though the recruitment dashboard focuses on hiring.
//          */

//         setDashboardStats({
//           ...statsResultData,
//           employees:
//             statsResultData?.employees ??
//             statsResultData?.employeeCount ??
//             0,
//           deployments:
//             statsResultData?.deployments ??
//             statsResultData?.deploymentCount ??
//             5,
//           enquiries: Array.isArray(enquiries)
//             ? enquiries.filter(
//                 (enquiry) => enquiry.status === "Unread"
//               ).length
//             : 0,
//         });

//         /*
//          * Existing localStorage candidate count logic retained.
//          */

//         try {
//           const savedCandidates =
//             localStorage.getItem("proliantCandidates");

//           if (savedCandidates) {
//             const savedCandidateList =
//               JSON.parse(savedCandidates);

//             if (Array.isArray(savedCandidateList)) {
//               const newCandidates =
//                 savedCandidateList.filter(
//                   (candidate) =>
//                     candidate.status === "New"
//                 ).length;

//               setDashboardStats((previous) => ({
//                 ...previous,
//                 newCandidates,
//               }));
//             }
//           }
//         } catch (storageError) {
//           console.error(
//             "Failed to read saved candidate data:",
//             storageError
//           );
//         }

//         /*
//          * Recently posted jobs.
//          */

//         const sortedJobs = [...jobs]
//           .sort(
//             (a, b) =>
//               new Date(b.createdAt || 0) -
//               new Date(a.createdAt || 0)
//           )
//           .slice(0, 5);

//         setRecentlyPostedJobs(
//           sortedJobs.map((job) => ({
//             id: job._id || job.id,
//             title: job.title || "Untitled Job",
//             department: job.department,
//             location: job.location,
//             type: job.employmentType,
//             date: formatDate(job.createdAt),
//             status: job.status || "Draft",
//           }))
//         );

//         /*
//          * Recent applications.
//          */

//         const sortedCandidates = [...candidateList]
//           .sort(
//             (a, b) =>
//               new Date(b.createdAt || 0) -
//               new Date(a.createdAt || 0)
//           )
//           .slice(0, 5);

//         setRecentApplications(
//           sortedCandidates.map((candidate) => ({
//             id: candidate._id || candidate.id,
//             name: candidate.name || "Candidate",
//             position:
//               candidate.position ||
//               candidate.jobTitle ||
//               candidate.appliedFor ||
//               "-",
//             experience: formatExperience(candidate),
//             date: formatDate(candidate.createdAt),
//             status: getCandidateStatus(candidate),
//           }))
//         );

//         setCandidates(candidateList);
//       } catch (fetchError) {
//         console.error(
//           "Dashboard data loading failed:",
//           fetchError
//         );

//         setError(
//           "Unable to load dashboard data. Please try again."
//         );
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   /*
//    * Existing live candidate/enquiry count updates retained.
//    */

//   useEffect(() => {
//     const updateNewCandidateCount = () => {
//       try {
//         const savedCandidates =
//           localStorage.getItem("proliantCandidates");

//         if (!savedCandidates) {
//           return;
//         }

//         const candidateList =
//           JSON.parse(savedCandidates);

//         if (!Array.isArray(candidateList)) {
//           return;
//         }

//         const newCandidateCount =
//           candidateList.filter(
//             (candidate) =>
//               candidate.status === "New"
//           ).length;

//         setDashboardStats((previous) => ({
//           ...previous,
//           newCandidates: newCandidateCount,
//         }));
//       } catch (storageError) {
//         console.error(
//           "Failed to update new candidate count:",
//           storageError
//         );
//       }
//     };

//     const updateNewEnquiryCount = async () => {
//       try {
//         const token =
//           localStorage.getItem("adminToken");

//         if (!token) {
//           return;
//         }

//         const response = await fetch(
//           `${API_BASE_URL}/contacts`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (response.status === 401) {
//           localStorage.removeItem("adminToken");
//           localStorage.removeItem("adminUser");

//           window.location.href = "/login";
//           return;
//         }

//         if (!response.ok) {
//           throw new Error(
//             `Failed to update enquiry count (${response.status})`
//           );
//         }

//         const result = await response.json();

//         const enquiryList = getListFromResponse(
//           result,
//           ["contacts", "enquiries", "data"]
//         );

//         const unreadCount = enquiryList.filter(
//           (enquiry) =>
//             enquiry.status === "Unread"
//         ).length;

//         setDashboardStats((previous) => ({
//           ...previous,
//           enquiries: unreadCount,
//         }));
//       } catch (enquiryError) {
//         console.error(
//           "Failed to update new enquiry count:",
//           enquiryError
//         );
//       }
//     };

//     const handleStorageChange = (event) => {
//       if (event.key === "proliantCandidates") {
//         updateNewCandidateCount();
//       }

//       if (event.key === "proliantEnquiriesUpdated") {
//         updateNewEnquiryCount();
//       }
//     };

//     window.addEventListener(
//       "candidatesUpdated",
//       updateNewCandidateCount
//     );

//     window.addEventListener(
//       "enquiriesUpdated",
//       updateNewEnquiryCount
//     );

//     window.addEventListener(
//       "storage",
//       handleStorageChange
//     );

//     updateNewCandidateCount();
//     updateNewEnquiryCount();

//     return () => {
//       window.removeEventListener(
//         "candidatesUpdated",
//         updateNewCandidateCount
//       );

//       window.removeEventListener(
//         "enquiriesUpdated",
//         updateNewEnquiryCount
//       );

//       window.removeEventListener(
//         "storage",
//         handleStorageChange
//       );
//     };
//   }, []);

//   /*
//    * Recruitment KPI calculations.
//    *
//    * The counts below use the candidate data already fetched
//    * from the existing /candidates backend endpoint.
//    */

//   const recruitmentStats = useMemo(() => {
//     const totalApplications = candidates.length;

//     const newApplications = candidates.filter(
//       (candidate) =>
//         getCandidateStatus(candidate).toLowerCase() === "new"
//     ).length;

//     const pendingL0Candidates = candidates.filter(
//       (candidate) => {
//         const status = getCandidateStatus(candidate)
//           .toLowerCase()
//           .replace(/[_-]/g, " ");

//         return (
//           status.includes("pending l0") ||
//           status.includes("l0 pending") ||
//           status.includes("l0 screening")
//         );
//       }
//     ).length;

//     const upcomingInterviews = candidates.filter(
//       (candidate) =>
//         isUpcomingDate(getInterviewDate(candidate))
//     ).length;

//     const hasInterviewData = candidates.some(
//       (candidate) => getInterviewDate(candidate)
//     );

//     return [
//       {
//         title: "Total Applications",
//         value: totalApplications,
//         description: "All candidate applications",
//         type: "applications",
//         icon: Users,
//         iconBg:
//           "bg-red-50 dark:bg-red-950/40",
//         iconText: "text-[#EF3B3A]",
//       },
//       {
//         title: "New Applications",
//         value: newApplications,
//         description: "Recently received applications",
//         type: "new",
//         icon: UserRoundPlus,
//         iconBg:
//           "bg-orange-50 dark:bg-orange-950/40",
//         iconText:
//           "text-orange-500 dark:text-orange-400",
//       },
//       {
//         title: "Pending L0 Screening",
//         value: pendingL0Candidates,
//         description: "Awaiting initial screening",
//         type: "screening",
//         icon: UserSearch,
//         iconBg:
//           "bg-blue-50 dark:bg-blue-950/40",
//         iconText:
//           "text-blue-500 dark:text-blue-400",
//       },
//       {
//         title: "Upcoming Interviews",
//         value: hasInterviewData
//           ? upcomingInterviews
//           : "—",
//         description: hasInterviewData
//           ? "Scheduled candidate interviews"
//           : "Interview schedule data unavailable",
//         type: "interviews",
//         icon: CalendarDays,
//         iconBg:
//           "bg-purple-50 dark:bg-purple-950/40",
//         iconText:
//           "text-purple-500 dark:text-purple-400",
//       },
//     ];
//   }, [candidates]);

//   const upcomingInterviewCandidates = useMemo(() => {
//     return candidates
//       .filter((candidate) =>
//         isUpcomingDate(getInterviewDate(candidate))
//       )
//       .sort(
//         (a, b) =>
//           new Date(getInterviewDate(a)) -
//           new Date(getInterviewDate(b))
//       )
//       .slice(0, 5);
//   }, [candidates]);

//   return (
//     <div
//       className="
//         relative min-h-full
//         bg-slate-50 px-5 py-6
//         text-slate-900 transition-colors
//         dark:bg-slate-950 dark:text-slate-100
//         sm:px-6 sm:py-7 xl:px-8
//       "
//     >
//       <div className="mx-auto w-full max-w-375">
//         {/* PAGE HEADER */}

//         <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
//           <div>
//             <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#EF3B3A]">
//               Dashboard
//             </p>

//             <h1 className="text-3xl font-bold tracking-tight text-[#071737] dark:text-white">
//               Welcome back,{" "}
//               <span className="text-[#EF3B3A]">
//                 {userName}!
//               </span>
//             </h1>

//             <p className="mt-1.5 text-base text-slate-500 dark:text-slate-400">
//               Here's what's happening across your Proliant
//               recruitment portal.
//             </p>
//           </div>

//           <div
//             className="
//               flex w-full items-center gap-3
//               rounded-xl border border-white/80
//               bg-white/80 px-4 py-3 shadow-sm
//               backdrop-blur-sm dark:border-slate-800
//               dark:bg-slate-900/80 xl:w-86.25
//             "
//           >
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
//               <CalendarDays size={22} />
//             </div>

//             <div className="min-w-0">
//               <p className="text-sm font-semibold text-[#071737] dark:text-white">
//                 {new Date().toLocaleDateString("en-US", {
//                   weekday: "long",
//                   month: "short",
//                   day: "numeric",
//                   year: "numeric",
//                 })}
//               </p>

//               <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
//                 Have a productive day!
//               </p>
//             </div>

//             <div className="ml-auto grid grid-cols-3 gap-2">
//               {Array.from({ length: 6 }).map((_, index) => (
//                 <span
//                   key={index}
//                   className="h-1.5 w-1.5 rounded-full bg-red-200 dark:bg-red-900"
//                 />
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* ERROR */}

//         {error && (
//           <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
//             <p className="text-sm font-medium text-red-600 dark:text-red-400">
//               {error}
//             </p>
//           </div>
//         )}

//         {/* RECRUITMENT KPI CARDS */}

//         <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//           {recruitmentStats.map((stat) => {
//             const Icon = stat.icon;

//             return (
//               <div
//                 key={stat.title}
//                 className="
//                   rounded-xl border border-white/90
//                   bg-white/85 p-4 shadow-sm
//                   backdrop-blur-sm transition-colors
//                   dark:border-slate-800
//                   dark:bg-slate-900/85
//                 "
//               >
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="flex items-start gap-4">
//                     <div
//                       className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconText}`}
//                     >
//                       <Icon size={27} strokeWidth={2} />
//                     </div>

//                     <div>
//                       <p className="text-sm font-semibold text-[#071737] dark:text-white">
//                         {stat.title}
//                       </p>

//                       <p className="mt-1 text-3xl font-bold leading-none text-[#071737] dark:text-white">
//                         {isLoading ? "..." : stat.value}
//                       </p>

//                       <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
//                         {stat.description}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
//                     <Zap size={15} />
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* MAIN DASHBOARD CONTENT */}

//         <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
//           {/* RECENT JOBS */}

//           <section
//             className="
//               overflow-hidden rounded-xl
//               border border-white/90 bg-white/85
//               shadow-sm backdrop-blur-sm
//               dark:border-slate-800 dark:bg-slate-900/85
//               xl:col-span-5
//             "
//           >
//             <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
//               <div className="flex items-start gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
//                   <BriefcaseBusiness size={21} />
//                 </div>

//                 <div>
//                   <h2 className="text-base font-bold text-[#071737] dark:text-white">
//                     Recently Posted Jobs
//                   </h2>

//                   <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
//                     Latest job openings created in the portal.
//                   </p>
//                 </div>
//               </div>

//               <a
//                 href="/jobs"
//                 className="flex items-center gap-1 text-sm font-semibold text-[#EF3B3A] hover:text-red-600"
//               >
//                 View all
//                 <ArrowRight size={16} />
//               </a>
//             </div>

//             <div className="space-y-1 p-3">
//               {isLoading ? (
//                 <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
//                   Loading jobs...
//                 </div>
//               ) : recentlyPostedJobs.length === 0 ? (
//                 <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
//                   No recent jobs found.
//                 </div>
//               ) : (
//                 recentlyPostedJobs.map((job, index) => (
//                   <div
//                     key={job.id || index}
//                     className="
//                       group flex items-center gap-3
//                       rounded-xl border border-slate-100
//                       bg-white px-3 py-3 transition-all
//                       hover:border-red-100 hover:bg-red-50/40
//                       dark:border-slate-800 dark:bg-slate-800/50
//                       dark:hover:border-red-900/50
//                       dark:hover:bg-red-950/20
//                     "
//                   >
//                     <div
//                       className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
//                         index % 4 === 0
//                           ? "bg-red-50 text-[#EF3B3A] dark:bg-red-950/40"
//                           : index % 4 === 1
//                           ? "bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400"
//                           : index % 4 === 2
//                           ? "bg-orange-50 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400"
//                           : "bg-purple-50 text-purple-500 dark:bg-purple-950/40 dark:text-purple-400"
//                       }`}
//                     >
//                       <BriefcaseBusiness size={20} />
//                     </div>

//                     <div className="min-w-0 flex-1">
//                       <p className="truncate text-sm font-bold text-[#071737] dark:text-white">
//                         {job.title}
//                       </p>

//                       <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
//                         {job.department || "Proliant"}
//                       </p>

//                       <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
//                         <span className="inline-flex items-center gap-1">
//                           <MapPin size={12} />
//                           {job.location || "-"}
//                         </span>

//                         <span className="inline-flex items-center gap-1">
//                           <Clock3 size={12} />
//                           {job.type || "-"}
//                         </span>

//                         <span className="inline-flex items-center gap-1">
//                           <CalendarDays size={12} />
//                           {job.date || "-"}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <span
//                         className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${
//                           job.status === "Published"
//                             ? "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"
//                             : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
//                         }`}
//                       >
//                         {job.status || "Draft"}
//                       </span>

//                       <ChevronRight
//                         size={19}
//                         className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#EF3B3A]"
//                       />
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </section>

//           {/* RECENT APPLICATIONS */}

//           <section
//             className="
//               overflow-hidden rounded-xl
//               border border-white/90 bg-white/85
//               shadow-sm backdrop-blur-sm
//               dark:border-slate-800 dark:bg-slate-900/85
//               xl:col-span-4
//             "
//           >
//             <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
//               <div className="flex items-start gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
//                   <Users size={21} />
//                 </div>

//                 <div>
//                   <h2 className="text-base font-bold text-[#071737] dark:text-white">
//                     Recent Applications
//                   </h2>

//                   <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
//                     Latest candidate applications.
//                   </p>
//                 </div>
//               </div>

//               <a
//                 href="/candidates"
//                 className="flex items-center gap-1 text-sm font-semibold text-[#EF3B3A] hover:text-red-600"
//               >
//                 View all
//                 <ArrowRight size={16} />
//               </a>
//             </div>

//             <div className="relative px-4 py-2">
//               {recentApplications.length > 0 && (
//                 <div className="absolute bottom-7 left-7.75 top-7 w-px bg-slate-200 dark:bg-slate-700" />
//               )}

//               {isLoading ? (
//                 <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
//                   Loading applications...
//                 </div>
//               ) : recentApplications.length === 0 ? (
//                 <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
//                   No recent applications found.
//                 </div>
//               ) : (
//                 recentApplications.map((candidate, index) => {
//                   const statusConfig = {
//                     New: {
//                       dot: "bg-blue-500",
//                       avatar:
//                         "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
//                       badge:
//                         "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
//                     },
//                     Shortlisted: {
//                       dot: "bg-green-500",
//                       avatar:
//                         "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400",
//                       badge:
//                         "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400",
//                     },
//                     Rejected: {
//                       dot: "bg-red-500",
//                       avatar:
//                         "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
//                       badge:
//                         "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
//                     },
//                     Selected: {
//                       dot: "bg-orange-500",
//                       avatar:
//                         "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
//                       badge:
//                         "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
//                     },
//                   };

//                   const config =
//                     statusConfig[candidate.status] ||
//                     statusConfig.New;

//                   const initials = (candidate.name || "C")
//                     .split(" ")
//                     .map((part) => part[0])
//                     .join("")
//                     .slice(0, 2)
//                     .toUpperCase();

//                   return (
//                     <div
//                       key={candidate.id || index}
//                       className="relative flex items-center gap-3 rounded-xl px-2 py-3"
//                     >
//                       <span
//                         className={`relative z-10 h-2.5 w-2.5 shrink-0 rounded-full ${config.dot}`}
//                       />

//                       <div
//                         className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${config.avatar}`}
//                       >
//                         {initials}
//                       </div>

//                       <div className="min-w-0 flex-1">
//                         <p className="truncate text-sm font-bold text-[#071737] dark:text-white">
//                           {candidate.name}
//                         </p>

//                         <p className="truncate text-xs text-slate-500 dark:text-slate-400">
//                           {candidate.position || "-"}
//                         </p>

//                         <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
//                           {candidate.experience || "-"}
//                           <span className="mx-1">·</span>
//                           Applied on {candidate.date || "-"}
//                         </p>
//                       </div>

//                       <span
//                         className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${config.badge}`}
//                       >
//                         {candidate.status || "New"}
//                       </span>

//                       <button
//                         type="button"
//                         className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
//                         aria-label={`More options for ${candidate.name}`}
//                       >
//                         <MoreVertical size={17} />
//                       </button>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </section>

//           {/* HR QUICK ACTIONS */}

//           <section
//             className="
//               overflow-hidden rounded-xl
//               border border-white/90 bg-white/85
//               p-4 shadow-sm backdrop-blur-sm
//               dark:border-slate-800 dark:bg-slate-900/85
//               xl:col-span-3
//             "
//           >
//             <div className="mb-4 flex items-start gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
//                 <Zap size={21} strokeWidth={2.2} />
//               </div>

//               <div>
//                 <h2 className="text-base font-bold text-[#071737] dark:text-white">
//                   HR Quick Actions
//                 </h2>

//                 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
//                   Frequently used recruitment actions.
//                 </p>
//               </div>
//             </div>

//             <div className="space-y-2.5">
//               {[
//                 {
//                   href: "/jobs",
//                   title: "Post Job",
//                   description: "Create a new opening",
//                   icon: BriefcaseBusiness,
//                   wrapper:
//                     "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50",
//                   iconText:
//                     "text-orange-600 dark:text-orange-400",
//                 },
//                 {
//                   href: "/candidates",
//                   title: "Review Candidates",
//                   description: "Review applications",
//                   icon: UserSearch,
//                   wrapper:
//                     "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50",
//                   iconText:
//                     "text-green-600 dark:text-green-400",
//                 },
//                 {
//                   href: "/candidates",
//                   title: "Screen Applications",
//                   description: "Review new candidates",
//                   icon: UserRoundPlus,
//                   wrapper:
//                     "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50",
//                   iconText:
//                     "text-blue-600 dark:text-blue-400",
//                 },
//                 {
//                   href: "/jobs",
//                   title: "Manage Jobs",
//                   description: "View and update job posts",
//                   icon: BriefcaseBusiness,
//                   wrapper:
//                     "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50",
//                   iconText:
//                     "text-purple-600 dark:text-purple-400",
//                 },
//               ].map((action) => {
//                 const Icon = action.icon;

//                 return (
//                   <a
//                     key={action.title}
//                     href={action.href}
//                     className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${action.wrapper}`}
//                   >
//                     <span
//                       className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-800 ${action.iconText}`}
//                     >
//                       <Icon size={18} />
//                     </span>

//                     <span className="min-w-0 flex-1">
//                       <span className="block truncate text-sm font-bold text-[#071737] dark:text-white">
//                         {action.title}
//                       </span>

//                       <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
//                         {action.description}
//                       </span>
//                     </span>

//                     <ArrowRight
//                       size={18}
//                       className={`${action.iconText} transition-transform group-hover:translate-x-0.5`}
//                     />
//                   </a>
//                 );
//               })}
//             </div>
//           </section>

//           {/* UPCOMING INTERVIEWS */}

//           <section
//             className="
//               overflow-hidden rounded-xl
//               border border-white/90 bg-white/85
//               shadow-sm backdrop-blur-sm
//               dark:border-slate-800 dark:bg-slate-900/85
//               xl:col-span-12
//             "
//           >
//             <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
//               <div className="flex items-start gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
//                   <CalendarDays size={21} />
//                 </div>

//                 <div>
//                   <h2 className="text-base font-bold text-[#071737] dark:text-white">
//                     Upcoming Interviews
//                   </h2>

//                   <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
//                     Candidates with upcoming interview dates.
//                   </p>
//                 </div>
//               </div>

//               <a
//                 href="/candidates"
//                 className="flex items-center gap-1 text-sm font-semibold text-[#EF3B3A] hover:text-red-600"
//               >
//                 View candidates
//                 <ArrowRight size={16} />
//               </a>
//             </div>

//             <div className="p-4">
//               {isLoading ? (
//                 <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
//                   Loading interview schedule...
//                 </div>
//               ) : upcomingInterviewCandidates.length === 0 ? (
//                 <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center dark:border-slate-700">
//                   <CalendarDays
//                     size={28}
//                     className="mx-auto mb-2 text-slate-400"
//                   />

//                   <p className="text-sm font-semibold text-[#071737] dark:text-white">
//                     No upcoming interviews found
//                   </p>

//                   <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
//                     Interview schedule details will appear here when
//                     available in the candidate data.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
//                   {upcomingInterviewCandidates.map(
//                     (candidate, index) => {
//                       const interviewDate =
//                         getInterviewDate(candidate);

//                       return (
//                         <div
//                           key={candidate._id || candidate.id || index}
//                           className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/50"
//                         >
//                           <div className="flex items-start gap-3">
//                             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
//                               <CalendarDays size={19} />
//                             </div>

//                             <div className="min-w-0">
//                               <p className="truncate text-sm font-bold text-[#071737] dark:text-white">
//                                 {candidate.name || "Candidate"}
//                               </p>

//                               <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
//                                 {candidate.position ||
//                                   candidate.jobTitle ||
//                                   candidate.appliedFor ||
//                                   "-"}
//                               </p>

//                               <p className="mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
//                                 {formatDate(interviewDate)}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     }
//                   )}
//                 </div>
//               )}
//             </div>
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminDashboard;