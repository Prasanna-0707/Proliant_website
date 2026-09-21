import { useEffect, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";

import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const applicationColumns = [
  {
    key: "name",
    label: "Candidate",
  },
  {
    key: "position",
    label: "Position",
  },
  {
    key: "experience",
    label: "Experience",
  },
  {
    key: "date",
    label: "Applied",
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
          row.status === "New"
            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
            : row.status === "Shortlisted"
              ? "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400"
              : "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400"
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

const jobColumns = [
  {
    key: "title",
    label: "Job",
    render: (row) => (
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">
          {row.title}
        </p>

        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {row.department}
        </p>
      </div>
    ),
  },
  {
    key: "location",
    label: "Location",
  },
  {
    key: "type",
    label: "Type",
  },
  {
    key: "date",
    label: "Posted",
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
          row.status === "Published"
            ? "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400"
            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const authHeaders = {
          Authorization: `Bearer ${token}`,
        };

        /*
         * Fetch dashboard statistics,
         * jobs and candidates in parallel.
         */
        const [
          statsResponse,
          jobsResponse,
          candidatesResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: authHeaders,
          }),

          fetch(`${API_BASE_URL}/jobs`, {
            headers: authHeaders,
          }),

          fetch(`${API_BASE_URL}/candidates`, {
            headers: authHeaders,
          }),
        ]);

        /*
         * If any protected API returns 401,
         * the token is no longer valid.
         */
        if (
          statsResponse.status === 401 ||
          jobsResponse.status === 401 ||
          candidatesResponse.status === 401
        ) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          window.location.href = "/login";
          return;
        }

        if (!statsResponse.ok) {
          throw new Error(
            "Failed to load dashboard statistics."
          );
        }

        if (!jobsResponse.ok) {
          throw new Error("Failed to load jobs.");
        }

        if (!candidatesResponse.ok) {
          throw new Error("Failed to load candidates.");
        }

        const statsResult =
          await statsResponse.json();

        const jobsResult =
          await jobsResponse.json();

        const candidatesResult =
          await candidatesResponse.json();

        /*
         * ---------------------------------------------------------
         * DASHBOARD STATS
         * ---------------------------------------------------------
         */

        const dashboardStats =
          statsResult?.stats || statsResult;

        const employeeCount =
          dashboardStats?.employees ??
          dashboardStats?.employeeCount ??
          0;

        const candidateCount =
          dashboardStats?.candidates ??
          dashboardStats?.candidateCount ??
          0;

        const enquiryCount =
          dashboardStats?.enquiries ??
          dashboardStats?.enquiryCount ??
          dashboardStats?.unreadEnquiries ??
          0;

        setStats([
          {
            title: "Active Employees",
            value: employeeCount,
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
            value: candidateCount,
            type: "candidates",
            description: "Recently received applications",
          },
          {
            title: "New Enquiries",
            value: enquiryCount,
            type: "enquiries",
            description: "Unread contact enquiries",
          },
        ]);

        /*
         * ---------------------------------------------------------
         * RECENT JOBS
         * ---------------------------------------------------------
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

        const formattedJobs = sortedJobs.map((job) => ({
          id: job._id,
          title: job.title,
          department: job.department,
          location: job.location,
          type: job.employmentType,
          date: formatDate(job.createdAt),
          status: job.status,
        }));

        setRecentlyPostedJobs(formattedJobs);

        /*
         * ---------------------------------------------------------
         * RECENT APPLICATIONS
         * ---------------------------------------------------------
         */

        const candidates =
          candidatesResult?.candidates ||
          candidatesResult?.data ||
          [];

        const sortedCandidates = [...candidates]
          .sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          )
          .slice(0, 5);

        const formattedApplications =
          sortedCandidates.map((candidate) => ({
            id: candidate._id,
            name: candidate.name,
            position: candidate.position,
            experience: formatExperience(candidate),
            date: formatDate(candidate.createdAt),
            status: candidate.status || "New",
          }));

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

  return (
    <div className="min-h-screen bg-gray-200 p-5 transition-colors dark:bg-gray-950 sm:p-6">
      {/* Page Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your Proliant administration portal.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={isLoading ? "..." : stat.value}
            type={stat.type}
            description={stat.description}
          />
        ))}
      </div>

      {/* Recently Posted Jobs */}
      <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Recently Posted Jobs
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Latest job openings created in the portal
            </p>
          </div>

          <a
            href="/jobs"
            className="flex items-center gap-1 text-sm font-medium text-[#EF3B3A] hover:text-red-600"
          >
            View all
            <ArrowRight size={15} />
          </a>
        </div>

        <DataTable
          columns={jobColumns}
          data={recentlyPostedJobs}
        />
      </section>

      {/* Applications & Quick Actions */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Applications */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900 xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Recent Applications
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Latest candidate applications
              </p>
            </div>

            <a
              href="/candidates"
              className="flex items-center gap-1 text-sm font-medium text-[#EF3B3A] hover:text-red-600"
            >
              View all
              <ArrowRight size={15} />
            </a>
          </div>

          <DataTable
            columns={applicationColumns}
            data={recentApplications}
          />
        </section>

        {/* Quick Actions */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 transition-colors dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Frequently used administration actions
            </p>
          </div>

          <div className="space-y-3">
            <a
              href="/employees"
              className="group flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-red-100 hover:bg-red-50 dark:border-gray-700 dark:hover:border-red-900 dark:hover:bg-red-950/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#EF3B3A] transition-colors group-hover:bg-white dark:bg-red-950/50 dark:group-hover:bg-gray-800">
                <Plus size={17} />
              </span>

              <span>
                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Add Employee
                </span>

                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  Add a new employee
                </span>
              </span>
            </a>

            <a
              href="/jobs"
              className="group flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-red-100 hover:bg-red-50 dark:border-gray-700 dark:hover:border-red-900 dark:hover:bg-red-950/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#EF3B3A] transition-colors group-hover:bg-white dark:bg-red-950/50 dark:group-hover:bg-gray-800">
                <Plus size={17} />
              </span>

              <span>
                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Post Job
                </span>

                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  Create a new opening
                </span>
              </span>
            </a>

            <a
              href="/candidates"
              className="group flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-red-100 hover:bg-red-50 dark:border-gray-700 dark:hover:border-red-900 dark:hover:bg-red-950/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#EF3B3A] transition-colors group-hover:bg-white dark:bg-red-950/50 dark:group-hover:bg-gray-800">
                <ArrowRight size={17} />
              </span>

              <span>
                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  View Candidates
                </span>

                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  Review applications
                </span>
              </span>
            </a>

            <a
              href="/enquiries"
              className="group flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-red-100 hover:bg-red-50 dark:border-gray-700 dark:hover:border-red-900 dark:hover:bg-red-950/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#EF3B3A] transition-colors group-hover:bg-white dark:bg-red-950/50 dark:group-hover:bg-gray-800">
                <ArrowRight size={17} />
              </span>

              <span>
                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  View Enquiries
                </span>

                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  Check website messages
                </span>
              </span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;