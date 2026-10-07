import { useEffect, useState } from "react";

import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  MoreVertical,
  Server,
  UserRoundPlus,
  UserSearch,
  Users,
  Zap,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

/*
 * =========================================================
 * FORMAT DATE
 * =========================================================
 */

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/*
 * =========================================================
 * FORMAT EXPERIENCE
 * =========================================================
 */

const formatExperience = (candidate) => {
  if (candidate.isFresher) {
    return "Fresher";
  }

  if (
    candidate.yearsOfExperience !== undefined &&
    candidate.yearsOfExperience !== null
  ) {
    return `${candidate.yearsOfExperience} ${
      candidate.yearsOfExperience === 1
        ? "Year"
        : "Years"
    }`;
  }

  return "-";
};

/*
 * =========================================================
 * DASHBOARD
 * =========================================================
 */

function Dashboard() {
  const [stats, setStats] = useState([
    {
      title: "Active Employees",
      value: 0,
      type: "employees",
      description: "Currently active employees",
    },

    {
      title: "Deployments",
      value: 5,
      type: "deployments",
      description: "Current deployment count",
    },

    {
      title: "New Candidates",
      value: 0,
      type: "candidates",
      description: "Recently received applications",
    },

    {
      title: "New Enquiries",
      value: 0,
      type: "enquiries",
      description: "Unread contact enquiries",
    },
  ]);

  const [recentApplications, setRecentApplications] =
    useState([]);

  const [recentlyPostedJobs, setRecentlyPostedJobs] =
    useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  /*
   * =========================================================
   * GET LOGGED-IN USER NAME
   * =========================================================
   */

  const getUserName = () => {
    try {
      const adminUser =
        localStorage.getItem("adminUser");

      if (!adminUser) {
        return "Admin";
      }

      const user = JSON.parse(adminUser);

      return (
        user.name ||
        user.fullName ||
        user.firstName ||
        user.username ||
        user.email?.split("@")[0] ||
        "Admin"
      );
    } catch {
      return "Admin";
    }
  };

  const userName = getUserName();

  /*
   * =========================================================
   * FETCH DASHBOARD DATA
   * =========================================================
   */

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token =
        localStorage.getItem("adminToken");

      if (!token) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const authHeaders = {
          Authorization: `Bearer ${token}`,
        };

        const [
          statsResponse,
          jobsResponse,
          candidatesResponse,
          enquiriesResponse,
        ] = await Promise.all([
          fetch(
            `${API_BASE_URL}/dashboard/stats`,
            {
              headers: authHeaders,
            }
          ),

          fetch(
            `${API_BASE_URL}/jobs`,
            {
              headers: authHeaders,
            }
          ),

          fetch(
            `${API_BASE_URL}/candidates`,
            {
              headers: authHeaders,
            }
          ),

          fetch(
            `${API_BASE_URL}/contacts`,
            {
              headers: authHeaders,
            }
          ),
        ]);

        /*
         * -----------------------------------------------------
         * TOKEN VALIDATION
         * -----------------------------------------------------
         */

        if (
          statsResponse.status === 401 ||
          jobsResponse.status === 401 ||
          candidatesResponse.status === 401 ||
          enquiriesResponse.status === 401
        ) {
          localStorage.removeItem(
            "adminToken"
          );

          localStorage.removeItem(
            "adminUser"
          );

          window.location.href = "/login";

          return;
        }

        /*
         * -----------------------------------------------------
         * RESPONSE VALIDATION
         * -----------------------------------------------------
         */

        if (!statsResponse.ok) {
          throw new Error(
            "Failed to load dashboard statistics."
          );
        }

        if (!jobsResponse.ok) {
          throw new Error(
            "Failed to load jobs."
          );
        }

        if (!candidatesResponse.ok) {
          throw new Error(
            "Failed to load candidates."
          );
        }

        if (!enquiriesResponse.ok) {
          throw new Error(
            "Failed to load enquiries."
          );
        }

        /*
         * -----------------------------------------------------
         * PARSE RESPONSES
         * -----------------------------------------------------
         */

        const statsResult =
          await statsResponse.json();

        const jobsResult =
          await jobsResponse.json();

        const candidatesResult =
          await candidatesResponse.json();

        const enquiriesResult =
          await enquiriesResponse.json();

        /*
         * -----------------------------------------------------
         * DASHBOARD STATS
         * -----------------------------------------------------
         */

        const dashboardStats =
          statsResult?.stats ||
          statsResult;

        const employeeCount =
          dashboardStats?.employees ??
          dashboardStats?.employeeCount ??
          0;

        let candidateCount =
          dashboardStats?.candidates ??
          dashboardStats?.candidateCount ??
          0;

        /*
         * -----------------------------------------------------
         * NEW CANDIDATES
         * Existing logic preserved.
         * -----------------------------------------------------
         */

        try {
          const savedCandidates =
            localStorage.getItem(
              "proliantCandidates"
            );

          if (savedCandidates) {
            const savedCandidateList =
              JSON.parse(
                savedCandidates
              );

            if (
              Array.isArray(
                savedCandidateList
              )
            ) {
              candidateCount =
                savedCandidateList.filter(
                  (candidate) =>
                    candidate.status ===
                    "New"
                ).length;
            }
          }
        } catch (storageError) {
          console.error(
            "Failed to read saved candidate data:",
            storageError
          );
        }

        /*
         * -----------------------------------------------------
         * NEW ENQUIRIES
         * -----------------------------------------------------
         */

        const enquiries =
          enquiriesResult?.contacts ||
          enquiriesResult?.enquiries ||
          enquiriesResult?.data ||
          [];

        const enquiryCount =
          Array.isArray(enquiries)
            ? enquiries.filter(
                (enquiry) =>
                  enquiry.status ===
                  "Unread"
              ).length
            : 0;

        /*
         * -----------------------------------------------------
         * SET STATS
         * -----------------------------------------------------
         */

        setStats([
          {
            title: "Active Employees",
            value: employeeCount,
            type: "employees",
            description:
              "Currently active employees",
          },

          {
            title: "Deployments",
            value: 5,
            type: "deployments",
            description:
              "Current deployment count",
          },

          {
            title: "New Candidates",
            value: candidateCount,
            type: "candidates",
            description:
              "Recently received applications",
          },

          {
            title: "New Enquiries",
            value: enquiryCount,
            type: "enquiries",
            description:
              "Unread contact enquiries",
          },
        ]);

        /*
         * -----------------------------------------------------
         * RECENT JOBS
         * -----------------------------------------------------
         */

        const jobs =
          jobsResult?.jobs ||
          jobsResult?.data ||
          [];

        const sortedJobs = [...jobs]
          .sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          )
          .slice(0, 5);

        const formattedJobs =
          sortedJobs.map((job) => ({
            id: job._id,
            title: job.title,
            department: job.department,
            location: job.location,
            type: job.employmentType,
            date: formatDate(
              job.createdAt
            ),
            status: job.status,
          }));

        setRecentlyPostedJobs(
          formattedJobs
        );

        /*
         * -----------------------------------------------------
         * RECENT APPLICATIONS
         * -----------------------------------------------------
         */

        const candidates =
          candidatesResult?.candidates ||
          candidatesResult?.data ||
          [];

        const sortedCandidates =
          [...candidates]
            .sort(
              (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
            )
            .slice(0, 5);

        const formattedApplications =
          sortedCandidates.map(
            (candidate) => ({
              id: candidate._id,
              name: candidate.name,
              position:
                candidate.position,
              experience:
                formatExperience(
                  candidate
                ),
              date: formatDate(
                candidate.createdAt
              ),
              status:
                candidate.status ||
                "New",
            })
          );

        setRecentApplications(
          formattedApplications
        );
      } catch (error) {
        console.error(
          "Dashboard data loading failed:",
          error
        );

        setError(
          "Unable to load dashboard data. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /*
   * =========================================================
   * LIVE CANDIDATE + ENQUIRY COUNT UPDATES
   * =========================================================
   */

  useEffect(() => {
    const updateNewCandidateCount =
      () => {
        try {
          const savedCandidates =
            localStorage.getItem(
              "proliantCandidates"
            );

          if (!savedCandidates) {
            return;
          }

          const candidateList =
            JSON.parse(
              savedCandidates
            );

          if (
            !Array.isArray(
              candidateList
            )
          ) {
            return;
          }

          const newCandidateCount =
            candidateList.filter(
              (candidate) =>
                candidate.status ===
                "New"
            ).length;

          setStats(
            (previousStats) =>
              previousStats.map(
                (stat) =>
                  stat.type ===
                  "candidates"
                    ? {
                        ...stat,
                        value:
                          newCandidateCount,
                      }
                    : stat
              )
          );
        } catch (storageError) {
          console.error(
            "Failed to update new candidate count:",
            storageError
          );
        }
      };

    /*
     * -----------------------------------------------------
     * UPDATE NEW ENQUIRY COUNT
     * -----------------------------------------------------
     */

    const updateNewEnquiryCount =
      async () => {
        try {
          const token =
            localStorage.getItem(
              "adminToken"
            );

          if (!token) {
            return;
          }

          const response =
            await fetch(
              `${API_BASE_URL}/contacts`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          if (
            response.status === 401
          ) {
            localStorage.removeItem(
              "adminToken"
            );

            localStorage.removeItem(
              "adminUser"
            );

            window.location.href =
              "/login";

            return;
          }

          if (!response.ok) {
            throw new Error(
              `Failed to update enquiry count (${response.status})`
            );
          }

          const result =
            await response.json();

          const enquiryList =
            result?.contacts ||
            result?.enquiries ||
            result?.data ||
            [];

          const unreadEnquiryCount =
            Array.isArray(
              enquiryList
            )
              ? enquiryList.filter(
                  (enquiry) =>
                    enquiry.status ===
                    "Unread"
                ).length
              : 0;

          setStats(
            (previousStats) =>
              previousStats.map(
                (stat) =>
                  stat.type ===
                  "enquiries"
                    ? {
                        ...stat,
                        value:
                          unreadEnquiryCount,
                      }
                    : stat
              )
          );
        } catch (enquiryError) {
          console.error(
            "Failed to update new enquiry count:",
            enquiryError
          );
        }
      };

    /*
     * -----------------------------------------------------
     * STORAGE EVENTS
     * -----------------------------------------------------
     */

    const handleStorageChange =
      (event) => {
        if (
          event.key ===
          "proliantCandidates"
        ) {
          updateNewCandidateCount();
        }

        if (
          event.key ===
          "proliantEnquiriesUpdated"
        ) {
          updateNewEnquiryCount();
        }
      };

    /*
     * Same-tab candidate update
     */

    window.addEventListener(
      "candidatesUpdated",
      updateNewCandidateCount
    );

    /*
     * Same-tab enquiry update
     */

    window.addEventListener(
      "enquiriesUpdated",
      updateNewEnquiryCount
    );

    /*
     * Cross-tab storage update
     */

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    /*
     * Initial updates
     */

    updateNewCandidateCount();
    updateNewEnquiryCount();

    return () => {
      window.removeEventListener(
        "candidatesUpdated",
        updateNewCandidateCount
      );

      window.removeEventListener(
        "enquiriesUpdated",
        updateNewEnquiryCount
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div
      className="
        relative
        min-h-full
        bg-slate-50
        px-5
        py-6
        text-slate-900
        transition-colors
        dark:bg-slate-950
        dark:text-slate-100
        sm:px-6
        sm:py-7
        xl:px-8
      "
    >
      <div className="mx-auto w-full max-w-375">
        {/* =================================================
            PAGE HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#EF3B3A]">
              Dashboard
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#071737] dark:text-white">
              Welcome back,{" "}
              <span className="text-[#EF3B3A]">
                {userName}!
              </span>
            </h1>

            <p className="mt-1.5 text-base text-slate-500 dark:text-slate-400">
              Here's what's happening
              across your Proliant
              administration portal.
            </p>
          </div>

          {/* Date Card */}
          <div
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              border
              border-white/80
              bg-white/80
              px-4
              py-3
              shadow-sm
              backdrop-blur-sm

              dark:border-slate-800
              dark:bg-slate-900/80

              xl:w-86.25
            "
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
              <CalendarDays
                size={22}
                strokeWidth={2}
              />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#071737] dark:text-white">
                {new Date().toLocaleDateString(
                  "en-US",
                  {
                    weekday:
                      "long",
                    month:
                      "short",
                    day: "numeric",
                    year:
                      "numeric",
                  }
                )}
              </p>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Have a productive
                day!
              </p>
            </div>

            <div className="ml-auto grid grid-cols-3 gap-2">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <span
                  key={index}
                  className="h-1.5 w-1.5 rounded-full bg-red-200 dark:bg-red-900"
                />
              ))}
            </div>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const statConfig = {
              employees: {
                icon: Users,
                iconBg:
                  "bg-red-50 dark:bg-red-950/40",
                iconText:
                  "text-[#EF3B3A]",
                badgeBg:
                  "bg-red-50 dark:bg-red-950/40",
                badgeText:
                  "text-[#EF3B3A]",
              },

              deployments: {
                icon: Server,
                iconBg:
                  "bg-blue-50 dark:bg-blue-950/40",
                iconText:
                  "text-blue-500 dark:text-blue-400",
                badgeBg:
                  "bg-blue-50 dark:bg-blue-950/40",
                badgeText:
                  "text-blue-500 dark:text-blue-400",
              },

              candidates: {
                icon: UserRoundPlus,
                iconBg:
                  "bg-orange-50 dark:bg-orange-950/40",
                iconText:
                  "text-orange-500 dark:text-orange-400",
                badgeBg:
                  "bg-orange-50 dark:bg-orange-950/40",
                badgeText:
                  "text-orange-500 dark:text-orange-400",
              },

              enquiries: {
                icon: Mail,
                iconBg:
                  "bg-purple-50 dark:bg-purple-950/40",
                iconText:
                  "text-purple-500 dark:text-purple-400",
                badgeBg:
                  "bg-purple-50 dark:bg-purple-950/40",
                badgeText:
                  "text-purple-500 dark:text-purple-400",
              },
            }[stat.type];

            const Icon =
              statConfig?.icon ||
              Users;

            return (
              <div
                key={stat.title}
                className="
                  rounded-xl
                  border
                  border-white/90
                  bg-white/85
                  p-4
                  shadow-sm
                  backdrop-blur-sm
                  transition-colors

                  dark:border-slate-800
                  dark:bg-slate-900/85
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${statConfig?.iconBg} ${statConfig?.iconText}`}
                    >
                      <Icon
                        size={27}
                        strokeWidth={2}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#071737] dark:text-white">
                        {stat.title}
                      </p>

                      <p className="mt-1 text-3xl font-bold leading-none text-[#071737] dark:text-white">
                        {isLoading
                          ? "..."
                          : stat.value}
                      </p>

                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {stat.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${statConfig?.badgeBg} ${statConfig?.badgeText}`}
                  >
                    <Zap
                      size={15}
                      strokeWidth={2}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =================================================
            MAIN DASHBOARD CONTENT
        ================================================== */}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          {/* =================================================
              RECENTLY POSTED JOBS
          ================================================== */}

          <section
            className="
              overflow-hidden
              rounded-xl
              border
              border-white/90
              bg-white/85
              shadow-sm
              backdrop-blur-sm
              transition-colors

              dark:border-slate-800
              dark:bg-slate-900/85

              xl:col-span-5
            "
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
                  <BriefcaseBusiness
                    size={21}
                    strokeWidth={2}
                  />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#071737] dark:text-white">
                    Recently Posted Jobs
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Latest job openings
                    created in the
                    portal.
                  </p>
                </div>
              </div>

              <a
                href="/jobs"
                className="flex items-center gap-1 text-sm font-semibold text-[#EF3B3A] hover:text-red-600"
              >
                View all
                <ArrowRight
                  size={16}
                />
              </a>
            </div>

            <div className="space-y-1 p-3">
              {isLoading ? (
                <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Loading jobs...
                </div>
              ) : recentlyPostedJobs.length ===
                0 ? (
                <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No recent jobs
                  found.
                </div>
              ) : (
                recentlyPostedJobs.map(
                  (job, index) => (
                    <div
                      key={
                        job.id ||
                        index
                      }
                      className="
                        group
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-slate-100
                        bg-white
                        px-3
                        py-3
                        transition-all
                        hover:border-red-100
                        hover:bg-red-50/40

                        dark:border-slate-800
                        dark:bg-slate-800/50
                        dark:hover:border-red-900/50
                        dark:hover:bg-red-950/20
                      "
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          index %
                            4 ===
                          0
                            ? "bg-red-50 text-[#EF3B3A] dark:bg-red-950/40"
                            : index %
                                4 ===
                              1
                            ? "bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400"
                            : index %
                                4 ===
                              2
                            ? "bg-orange-50 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400"
                            : "bg-purple-50 text-purple-500 dark:bg-purple-950/40 dark:text-purple-400"
                        }`}
                      >
                        <BriefcaseBusiness
                          size={20}
                          strokeWidth={
                            2
                          }
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#071737] dark:text-white">
                          {
                            job.title
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {job.department ||
                            "Proliant"}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <MapPin
                              size={12}
                            />

                            {job.location ||
                              "-"}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Clock3
                              size={12}
                            />

                            {job.type ||
                              "-"}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <CalendarDays
                              size={12}
                            />

                            {job.date ||
                              "-"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${
                            job.status ===
                            "Published"
                              ? "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {job.status ||
                            "Draft"}
                        </span>

                        <ChevronRight
                          size={
                            19
                          }
                          className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#EF3B3A]"
                        />
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </section>

          {/* =================================================
              RECENT APPLICATIONS
          ================================================== */}

          <section
            className="
              overflow-hidden
              rounded-xl
              border
              border-white/90
              bg-white/85
              shadow-sm
              backdrop-blur-sm
              transition-colors

              dark:border-slate-800
              dark:bg-slate-900/85

              xl:col-span-4
            "
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
                  <Users
                    size={21}
                    strokeWidth={2}
                  />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#071737] dark:text-white">
                    Recent Applications
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Latest candidate
                    applications.
                  </p>
                </div>
              </div>

              <a
                href="/candidates"
                className="flex items-center gap-1 text-sm font-semibold text-[#EF3B3A] hover:text-red-600"
              >
                View all
                <ArrowRight
                  size={16}
                />
              </a>
            </div>

            <div className="relative px-4 py-2">
              {recentApplications.length >
                0 && (
                <div className="absolute bottom-7 left-7.75 top-7 w-px bg-slate-200 dark:bg-slate-700" />
              )}

              {isLoading ? (
                <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Loading
                  applications...
                </div>
              ) : recentApplications.length ===
                0 ? (
                <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No recent
                  applications
                  found.
                </div>
              ) : (
                recentApplications.map(
                  (
                    candidate,
                    index
                  ) => {
                    const statusConfig =
                      {
                        New: {
                          dot: "bg-blue-500",
                          avatar:
                            "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
                          badge:
                            "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
                        },

                        Shortlisted:
                          {
                            dot: "bg-green-500",
                            avatar:
                              "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400",
                            badge:
                              "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400",
                          },

                        Rejected: {
                          dot: "bg-red-500",
                          avatar:
                            "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
                          badge:
                            "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
                        },

                        Selected: {
                          dot: "bg-orange-500",
                          avatar:
                            "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
                          badge:
                            "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
                        },
                      };

                    const config =
                      statusConfig[
                        candidate.status
                      ] ||
                      statusConfig.New;

                    const initials = (
                      candidate.name ||
                      "C"
                    )
                      .split(
                        " "
                      )
                      .map(
                        (part) =>
                          part[0]
                      )
                      .join("")
                      .slice(
                        0,
                        2
                      )
                      .toUpperCase();

                    return (
                      <div
                        key={
                          candidate.id ||
                          index
                        }
                        className="relative flex items-center gap-3 rounded-xl px-2 py-3"
                      >
                        <span
                          className={`relative z-10 h-2.5 w-2.5 shrink-0 rounded-full ${config.dot}`}
                        />

                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${config.avatar}`}
                        >
                          {
                            initials
                          }
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#071737] dark:text-white">
                            {
                              candidate.name
                            }
                          </p>

                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {candidate.position ||
                              "-"}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {candidate.experience ||
                              "-"}

                            <span className="mx-1">
                              ·
                            </span>

                            Applied on{" "}
                            {candidate.date ||
                              "-"}
                          </p>
                        </div>

                        <span
                          className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${config.badge}`}
                        >
                          {candidate.status ||
                            "New"}
                        </span>

                        <button
                          type="button"
                          className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          aria-label={`More options for ${candidate.name}`}
                        >
                          <MoreVertical
                            size={17}
                          />
                        </button>
                      </div>
                    );
                  }
                )
              )}
            </div>
          </section>

          {/* =================================================
              QUICK ACTIONS
          ================================================== */}

          <section
            className="
              overflow-hidden
              rounded-xl
              border
              border-white/90
              bg-white/85
              p-4
              shadow-sm
              backdrop-blur-sm
              transition-colors

              dark:border-slate-800
              dark:bg-slate-900/85

              xl:col-span-3
            "
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
                <Zap
                  size={21}
                  strokeWidth={2.2}
                />
              </div>

              <div>
                <h2 className="text-base font-bold text-[#071737] dark:text-white">
                  Quick Actions
                </h2>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Frequently used
                  administration
                  actions.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  href: "/employees",
                  title: "Add Employee",
                  description:
                    "Add a new employee",
                  icon: UserRoundPlus,
                  wrapper:
                    "bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50",
                  iconBg:
                    "bg-white dark:bg-slate-800",
                  iconText:
                    "text-[#EF3B3A]",
                  arrow:
                    "text-[#EF3B3A]",
                },

                {
                  href: "/team-members",
                  title:
                    "Add Team Member",
                  description:
                    "Add a new team member",
                  icon: Users,
                  wrapper:
                    "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50",
                  iconBg:
                    "bg-white dark:bg-slate-800",
                  iconText:
                    "text-blue-600 dark:text-blue-400",
                  arrow:
                    "text-blue-600 dark:text-blue-400",
                },

                {
                  href: "/jobs",
                  title: "Post Job",
                  description:
                    "Create a new opening",
                  icon: BriefcaseBusiness,
                  wrapper:
                    "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50",
                  iconBg:
                    "bg-white dark:bg-slate-800",
                  iconText:
                    "text-orange-600 dark:text-orange-400",
                  arrow:
                    "text-orange-600 dark:text-orange-400",
                },

                {
                  href: "/countries",
                  title: "Add Country",
                  description:
                    "Add a new country",
                  icon: Globe2,
                  wrapper:
                    "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50",
                  iconBg:
                    "bg-white dark:bg-slate-800",
                  iconText:
                    "text-purple-600 dark:text-purple-400",
                  arrow:
                    "text-purple-600 dark:text-purple-400",
                },

                {
                  href: "/candidates",
                  title:
                    "View Candidates",
                  description:
                    "Review applications",
                  icon: UserSearch,
                  wrapper:
                    "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50",
                  iconBg:
                    "bg-white dark:bg-slate-800",
                  iconText:
                    "text-green-600 dark:text-green-400",
                  arrow:
                    "text-green-600 dark:text-green-400",
                },

                {
                  href: "/enquiries",
                  title:
                    "View Enquiries",
                  description:
                    "Check website messages",
                  icon: Mail,
                  wrapper:
                    "bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50",
                  iconBg:
                    "bg-white dark:bg-slate-800",
                  iconText:
                    "text-[#EF3B3A]",
                  arrow:
                    "text-[#EF3B3A]",
                },
              ].map((action) => {
                const Icon =
                  action.icon;

                return (
                  <a
                    key={action.href}
                    href={action.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${action.wrapper}`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${action.iconBg} ${action.iconText}`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={2}
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-[#071737] dark:text-white">
                        {
                          action.title
                        }
                      </span>

                      <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                        {
                          action.description
                        }
                      </span>
                    </span>

                    <ArrowRight
                      size={18}
                      className={`${action.arrow} transition-transform group-hover:translate-x-0.5`}
                    />
                  </a>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;