
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CalendarCheck,
  Clock3,
  FileText,
  RefreshCw,
  ShieldCheck,
  Settings,
  UserCheck,
  Users,
  UserRoundCheck,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getList = (result, keys = []) => {
  if (Array.isArray(result)) return result;

  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
  }

  if (Array.isArray(result?.data)) return result.data;

  return [];
};

const getId = (item) =>
  item?._id || item?.id || item?.userId || item?.candidateId;

const getName = (item) =>
  item?.name ||
  item?.fullName ||
  [item?.firstName, item?.lastName].filter(Boolean).join(" ") ||
  item?.candidateName ||
  item?.user?.name ||
  item?.candidate?.name ||
  "Unknown";

const getRole = (item) =>
  String(
    item?.role?.name ||
      item?.role ||
      item?.userRole ||
      item?.userType ||
      item?.designation ||
      ""
  ).toLowerCase();

const getStatus = (item) =>
  String(
    item?.status ||
      item?.accountStatus ||
      item?.applicationStatus ||
      item?.interviewStatus ||
      "Unknown"
  );

const isActive = (item) => {
  const status = getStatus(item).toLowerCase();

  return (
    item?.isActive === true ||
    item?.active === true ||
    ["active", "enabled", "approved"].includes(status)
  );
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInterviewDate = (item) =>
  item?.scheduledAt ||
  item?.scheduledDate ||
  item?.interviewDate ||
  item?.interview?.scheduledAt ||
  item?.interview?.date ||
  item?.interviewSchedule?.date ||
  item?.scheduledInterviewDate ||
  item?.date ||
  null;

const getInterviewer = (item) =>
  item?.interviewer?.name ||
  item?.interviewerName ||
  item?.interviewer?.fullName ||
  item?.assignedInterviewer?.name ||
  item?.interview?.interviewer?.name ||
  item?.interview?.interviewerName ||
  "Not assigned";

const getPosition = (item) =>
  item?.jobTitle ||
  item?.position ||
  item?.appliedFor ||
  item?.job?.title ||
  item?.job?.jobTitle ||
  item?.title ||
  "—";

const getInterviewStatus = (item) => {
  const rawStatus =
    item?.interviewStatus ||
    item?.interview?.status ||
    item?.interviewSchedule?.status ||
    item?.status ||
    "";

  const normalized = String(rawStatus).toLowerCase();

  if (
    normalized.includes("complete") ||
    normalized.includes("evaluated")
  ) {
    return "Completed";
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("reject")
  ) {
    return "Cancelled";
  }

  if (normalized.includes("reschedul")) {
    return "Rescheduled";
  }

  if (
    normalized.includes("progress") ||
    normalized.includes("ongoing")
  ) {
    return "In Progress";
  }

  return "Scheduled";
};

const getInterviewRecords = (items) => {
  const records = [];

  items.forEach((item) => {
    const interviewObjects = [
      item?.interview,
      item?.interviewSchedule,
      ...(Array.isArray(item?.interviews) ? item.interviews : []),
      ...(Array.isArray(item?.interviewSchedules)
        ? item.interviewSchedules
        : []),
    ].filter(Boolean);

    if (interviewObjects.length > 0) {
      interviewObjects.forEach((interview, index) => {
        const date = getInterviewDate(interview) || getInterviewDate(item);

        if (!date) return;

        records.push({
          id: `${getId(item) || getName(item)}-${index}`,
          candidate: getName(item),
          position: getPosition(item),
          interviewer: getInterviewer({
            ...item,
            ...interview,
          }),
          date,
          status: getInterviewStatus(interview),
        });
      });

      return;
    }

    const date = getInterviewDate(item);

    if (!date) return;

    records.push({
      id: getId(item) || `${getName(item)}-${date}`,
      candidate: getName(item),
      position: getPosition(item),
      interviewer: getInterviewer(item),
      date,
      status: getInterviewStatus(item),
    });
  });

  return records.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const getActivityTitle = (item) =>
  item?.title ||
  item?.action ||
  item?.event ||
  item?.activity ||
  item?.actionType ||
  "System activity";

const getActivityDescription = (item) =>
  item?.description ||
  item?.details ||
  item?.message ||
  item?.target ||
  item?.entity ||
  "Activity recorded";

const getActivityDate = (item) =>
  item?.createdAt ||
  item?.timestamp ||
  item?.date ||
  item?.updatedAt;

const getActivityUser = (item) =>
  item?.performedBy?.name ||
  item?.user?.name ||
  item?.actor?.name ||
  item?.performedByName ||
  item?.userName ||
  "System";

const getInitials = (name) =>
  String(name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const statusClasses = (status) => {
  const normalized = String(status).toLowerCase();

  if (
    normalized.includes("complete") ||
    normalized.includes("active") ||
    normalized.includes("approved") ||
    normalized.includes("selected")
  ) {
    return "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950/40 dark:text-green-300";
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("reject") ||
    normalized.includes("inactive") ||
    normalized.includes("disabled")
  ) {
    return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300";
  }

  if (
    normalized.includes("progress") ||
    normalized.includes("reschedul")
  ) {
    return "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300";
  }

  return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300";
};

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBackground,
  loading,
  href,
}) {
  const content = (
    <div className="flex h-full items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {loading ? "..." : value ?? "—"}
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`}
      >
        <Icon size={23} />
      </div>
    </div>
  );

  const className =
    "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900";

  if (href) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function SectionHeader({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
          <Icon size={21} />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="px-5 py-12 text-center">
      <Icon size={30} className="mx-auto mb-3 text-slate-400" />
      <p className="text-sm font-semibold text-slate-800 dark:text-white">
        {title}
      </p>
      <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function AdminDashboard() {
  const [data, setData] = useState({
    users: [],
    roles: [],
    jobs: [],
    candidates: [],
    interviews: [],
    activities: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [adminName, setAdminName] = useState("Administrator");

  useEffect(() => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("adminUser") || "{}"
      );

      setAdminName(
        storedUser.name ||
          storedUser.fullName ||
          storedUser.firstName ||
          storedUser.username ||
          storedUser.email?.split("@")[0] ||
          "Administrator"
      );
    } catch {
      setAdminName("Administrator");
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("adminToken");

    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const request = async (path) => {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        headers,
      });

      if (!response.ok) {
        const apiError = new Error(`Request failed: ${path}`);
        apiError.status = response.status;
        throw apiError;
      }

      return response.json();
    };

    const safeRequest = async (path, keys = []) => {
      try {
        return getList(await request(path), keys);
      } catch (requestError) {
        console.warn(
          `Dashboard data unavailable for ${path}:`,
          requestError.message
        );
        return null;
      }
    };

    try {
      const [
        users,
        roles,
        jobs,
        candidates,
        interviewData,
        activities,
      ] = await Promise.all([
        safeRequest("/users", ["users", "data", "results"]),
        safeRequest("/roles-permissions", [
          "roles",
          "data",
          "results",
        ]),
        safeRequest("/jobs", ["jobs", "data", "results"]),
        safeRequest("/candidates", [
          "candidates",
          "applications",
          "data",
          "results",
        ]),
        safeRequest("/interviews", [
          "interviews",
          "data",
          "results",
        ]),
        safeRequest("/audit-logs", [
          "logs",
          "activities",
          "auditLogs",
          "data",
          "results",
        ]),
      ]);

      const candidateList = candidates || [];
      const interviewsFromCandidates =
        getInterviewRecords(candidateList);

      const directInterviews = (interviewData || [])
        .map((item, index) => {
          const date = getInterviewDate(item);

          if (!date) return null;

          return {
            id: getId(item) || `interview-${index}`,
            candidate:
              item?.candidate?.name ||
              item?.candidateName ||
              item?.applicant?.name ||
              getName(item),
            position: getPosition(item),
            interviewer: getInterviewer(item),
            date,
            status: getInterviewStatus(item),
          };
        })
        .filter(Boolean);

      const combinedInterviews =
        directInterviews.length > 0
          ? directInterviews
          : interviewsFromCandidates;

      setData({
        users: users || [],
        roles: roles || [],
        jobs: jobs || [],
        candidates: candidateList,
        interviews: combinedInterviews,
        activities: activities || [],
      });

      setLastUpdated(new Date());

      const hasApiFailure = [
        users,
        roles,
        jobs,
        candidates,
        interviewData,
        activities,
      ].some((result) => result === null);

      if (hasApiFailure) {
        setError(
          "Some dashboard information could not be loaded. Please check the API routes and backend server."
        );
      }
    } catch (fetchError) {
      console.error("Admin dashboard error:", fetchError);
      setError("Dashboard data could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const users = data.users;

  const hrUsers = users.filter((user) => {
    const role = getRole(user);

    return (
      role === "hr" ||
      role.includes("human resource") ||
      role.includes("recruiter")
    );
  });

  const activeUsers = users.filter(isActive).length;

  const activeJobs = data.jobs.filter((job) => {
    const status = getStatus(job).toLowerCase();

    return (
      job?.isActive === true ||
      ["active", "open", "published"].includes(status)
    );
  }).length;

  const closedJobs = data.jobs.filter((job) =>
  ["closed", "inactive", "archived", "expired"].includes(
    getStatus(job).toLowerCase()
  )
  ).length;

const pendingApplications = data.candidates.filter((candidate) =>
  ["pending", "applied", "under review", "screening"].includes(
    getStatus(candidate).toLowerCase()
  )
  ).length;

const shortlistedApplications = data.candidates.filter((candidate) =>
  ["shortlisted", "selected", "interview scheduled"].includes(
    getStatus(candidate).toLowerCase()
  )
  ).length;

const rejectedApplications = data.candidates.filter((candidate) =>
  getStatus(candidate).toLowerCase().includes("reject")
  ).length;

  const upcomingInterviews = data.interviews.filter((interview) => {
    const date = new Date(interview.date);

    return (
      !Number.isNaN(date.getTime()) &&
      date >= new Date() &&
      !["Completed", "Cancelled"].includes(interview.status)
    );
  });

  const sortedInterviews = [...data.interviews].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const sortedActivities = [...data.activities]
    .sort((a, b) => {
      const dateA = new Date(getActivityDate(a) || 0).getTime();
      const dateB = new Date(getActivityDate(b) || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 6);

  const statCards = [
    {
      title: "Total Users",
      value: users.length,
      description: "Registered portal accounts",
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBackground: "bg-blue-50 dark:bg-blue-950/40",
      href: "/admin/users",
    },
    {
      title: "Active Users",
      value: activeUsers,
      description: "Enabled accounts",
      icon: UserCheck,
      iconColor: "text-green-600 dark:text-green-400",
      iconBackground: "bg-green-50 dark:bg-green-950/40",
      href: "/admin/users",
    },
    {
      title: "HR Team",
      value: hrUsers.length,
      description: "HR and recruitment users",
      icon: UserRoundCheck,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBackground: "bg-purple-50 dark:bg-purple-950/40",
      href: "/admin/users",
    },
    {
      title: "Active Jobs",
      value: activeJobs,
      description: "Currently open or published",
      icon: BriefcaseBusiness,
      iconColor: "text-orange-600 dark:text-orange-400",
      iconBackground: "bg-orange-50 dark:bg-orange-950/40",
      href: "/hr/jobs",
    },
    {
      title: "Total Applications",
      value: data.candidates.length,
      description: "Candidate application records",
      icon: FileText,
      iconColor: "text-cyan-600 dark:text-cyan-400",
      iconBackground: "bg-cyan-50 dark:bg-cyan-950/40",
      href: "/hr/candidates",
    },
    {
      title: "Scheduled Interviews",
      value: upcomingInterviews.length,
      description: "Upcoming interview sessions",
      icon: CalendarCheck,
      iconColor: "text-red-600 dark:text-red-400",
      iconBackground: "bg-red-50 dark:bg-red-950/40",
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "Manage HR and portal accounts",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Roles & Permissions",
      description: "Review role access",
      href: "/admin/roles-permissions",
      icon: ShieldCheck,
    },
    {
      title: "System Settings",
      description: "Configure portal settings",
      href: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Audit Logs",
      description: "Review system activities",
      href: "/admin/audit-logs",
      icon: Activity,
    },
  ];

  return (
    <main className="min-h-full bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:px-2 sm:py-2 xl:px-2">
      <div className="w-full">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {/* <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#EF3B3A]">
              Administrator Portal
            </p> */}
            <h1 className="text-2xl font-bold tracking-tight text-[#071737] dark:text-white sm:text-3xl">
              Welcome back, {adminName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Monitor the HR team, recruitment progress, interviews and portal activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <CalendarDays className="text-[#EF3B3A]" size={21} />
              <div>
                <p className="text-sm font-semibold">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {lastUpdated
                    ? `Updated ${lastUpdated.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Dashboard overview"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EF3B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
            <button
              type="button"
              onClick={fetchDashboardData}
              className="text-sm font-semibold text-red-700 underline dark:text-red-300"
            >
              Try again
            </button>
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {statCards.map((stat) => (
            <StatCard key={stat.title} {...stat} loading={loading} />
          ))}
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-8">
            <SectionHeader
              icon={CalendarCheck}
              title="Scheduled Interviews"
              description="View scheduled and completed interviews across the hiring portal"
              action={
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  View only
                </span>
              }
            />

            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                Loading interviews...
              </div>
            ) : sortedInterviews.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No interview records found"
                description="Interview information will appear here when the connected API returns scheduled or completed interviews."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-190 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Candidate</th>
                      <th className="px-5 py-3 font-semibold">Position</th>
                      <th className="px-5 py-3 font-semibold">Interviewer</th>
                      <th className="px-5 py-3 font-semibold">Date & Time</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedInterviews.slice(0, 10).map((interview) => (
                      <tr
                        key={interview.id}
                        className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-[#EF3B3A] dark:bg-red-950/40">
                              {getInitials(interview.candidate)}
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              {interview.candidate}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {interview.position}
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {interview.interviewer}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-300">
                          {formatDateTime(interview.date)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses(interview.status)}`}
                          >
                            {interview.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sortedInterviews.length > 10 && (
                  <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    Showing 10 of {sortedInterviews.length} interview records.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-4">
            <SectionHeader
              icon={UserRoundCheck}
              title="HR Team Overview"
              description="HR accounts and current status"
              action={
                <Link
                  to="/admin/users"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#EF3B3A] hover:text-red-600"
                >
                  View all <ArrowRight size={14} />
                </Link>
              }
            />

            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                Loading HR team...
              </div>
            ) : hrUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No HR users found"
                description="HR team members will appear here when user records contain their role."
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {hrUsers.slice(0, 6).map((user, index) => (
                  <div
                    key={getId(user) || index}
                    className="flex items-center gap-3 px-5 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {getInitials(getName(user))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {getName(user)}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                        {user.email || "No email provided"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses(isActive(user) ? "Active" : getStatus(user))}`}
                    >
                      {isActive(user) ? "Active" : getStatus(user)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-7">
            <SectionHeader
              icon={Activity}
              title="Recent System Activity"
              description="Latest administrative and recruitment activity records"
              action={
                <Link
                  to="/admin/audit-logs"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#EF3B3A] hover:text-red-600"
                >
                  View audit logs <ArrowRight size={14} />
                </Link>
              }
            />

            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                Loading activities...
              </div>
            ) : sortedActivities.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No recent activities available"
                description="The activity feed will display records returned by the audit logs API."
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedActivities.map((activity, index) => (
                  <div
                    key={getId(activity) || index}
                    className="flex items-start gap-3 px-5 py-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
                      <Activity size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {getActivityTitle(activity)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {getActivityDescription(activity)}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {getActivityUser(activity)} ·{" "}
                        {formatDateTime(getActivityDate(activity))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-5">
            <SectionHeader
              icon={BriefcaseBusiness}
              title="Recruitment Overview"
              description="Current jobs and candidate application progress"
            />

            <div className="space-y-5 p-5">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Job Overview
                  </h3>
                  <Link
                    to="/hr/jobs"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#EF3B3A] hover:text-red-600"
                  >
                    View jobs <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-950/30">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Active Jobs
                    </p>
                    <p className="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {loading ? "..." : activeJobs}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Closed Jobs
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-200">
                      {loading ? "..." : closedJobs}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Application Overview
                  </h3>
                  <Link
                    to="/hr/candidates"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#EF3B3A] hover:text-red-600"
                  >
                    View applications <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      Total Applications
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {loading ? "..." : data.candidates.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      Pending / Screening
                    </span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      {loading ? "..." : pendingApplications}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      Shortlisted / Selected
                    </span>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-300">
                      {loading ? "..." : shortlistedApplications}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      Rejected Applications
                    </span>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                      {loading ? "..." : rejectedApplications}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Proliant Data · Administrator Dashboard</p>
          <p>
            {lastUpdated
              ? `Last refreshed ${formatDateTime(lastUpdated)}`
              : "Waiting for dashboard data"}
          </p>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;