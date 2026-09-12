import { ArrowRight, Plus } from "lucide-react";

import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";

const stats = [
  {
    title: "Active Employees",
    value: 150,
    type: "employees",
    description: "Currently active employees",
  },
  // {
  //   title: "Active Projects",
  //   value: 18,
  //   type: "projects",
  //   description: "Projects currently active",
  // },
  {
    title: "Deployments",
    value: 5,
    type: "deployments",
    description: "Current deployment count",
  },
  {
    title: "New Candidates",
    value: 15,
    type: "candidates",
    description: "Recently received applications",
  },
  {
    title: "New Enquiries",
    value: 8,
    type: "enquiries",
    description: "Unread contact enquiries",
  },
];

const recentApplications = [
  {
    id: 1,
    name: "Rahul Kumar",
    position: "SAP Consultant",
    experience: "3 Years",
    date: "06 Sep 2026",
    status: "New",
  },
  {
    id: 2,
    name: "Priya Sharma",
    position: "HR Executive",
    experience: "2 Years",
    date: "05 Sep 2026",
    status: "Review",
  },
  {
    id: 3,
    name: "Arjun Reddy",
    position: "ABAP Developer",
    experience: "4 Years",
    date: "04 Sep 2026",
    status: "New",
  },
  {
    id: 4,
    name: "Sneha Rao",
    position: "SAP Functional Consultant",
    experience: "3 Years",
    date: "03 Sep 2026",
    status: "Review",
  },
  {
    id: 5,
    name: "Kiran Kumar",
    position: "Basis Administrator",
    experience: "2 Years",
    date: "02 Sep 2026",
    status: "Shortlisted",
  },
];

const recentlyPostedJobs = [
  {
    id: 1,
    title: "SAP ABAP Developer",
    department: "SAP",
    location: "Hyderabad, India",
    type: "Full Time",
    date: "06 Sep 2026",
    status: "Published",
  },
  {
    id: 2,
    title: "SAP SD Consultant",
    department: "SAP",
    location: "Bangalore, India",
    type: "Full Time",
    date: "05 Sep 2026",
    status: "Published",
  },
  {
    id: 3,
    title: "HR Executive",
    department: "Human Resources",
    location: "Hyderabad, India",
    type: "Full Time",
    date: "04 Sep 2026",
    status: "Draft",
  },
  {
    id: 4,
    title: "Business Analyst",
    department: "Business",
    location: "Remote",
    type: "Contract",
    date: "03 Sep 2026",
    status: "Published",
  },
  {
    id: 5,
    title: "Basis Administrator",
    department: "SAP",
    location: "Pune, India",
    type: "Full Time",
    date: "02 Sep 2026",
    status: "Draft",
  },
];

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
            ? "bg-blue-50 text-blue-600"
            : row.status === "Shortlisted"
              ? "bg-green-50 text-green-600"
              : "bg-yellow-50 text-yellow-600"
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
        <p className="font-semibold text-gray-900">
          {row.title}
        </p>

        <p className="mt-0.5 text-xs text-gray-500">
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
            ? "bg-green-50 text-green-600"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-200 p-5 sm:p-6">
      {/* Page Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of your Proliant administration portal.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            type={stat.type}
            description={stat.description}
          />
        ))}
      </div>

      {/* Recently Posted Jobs */}
      <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Recently Posted Jobs
            </h2>

            <p className="mt-1 text-xs text-gray-500">
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
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Recent Applications
              </h2>

              <p className="mt-1 text-xs text-gray-500">
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
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Frequently used administration actions
            </p>
          </div>

          <div className="space-y-3">
            <a
              href="/employees"
              className="group flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-red-100 hover:bg-red-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#EF3B3A] transition-colors group-hover:bg-white">
                <Plus size={17} />
              </span>

              <span>
                <span className="block text-sm font-semibold text-gray-800">
                  Add Employee
                </span>

                <span className="mt-0.5 block text-xs text-gray-500">
                  Add a new employee
                </span>
              </span>
            </a>

            <a
              href="/jobs"
              className="group flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-red-100 hover:bg-red-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#EF3B3A] transition-colors group-hover:bg-white">
                <Plus size={17} />
              </span>

              <span>
                <span className="block text-sm font-semibold text-gray-800">
                  Post Job
                </span>

                <span className="mt-0.5 block text-xs text-gray-500">
                  Create a new opening
                </span>
              </span>
            </a>

            <a
              href="/candidates"
              className="group flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-red-100 hover:bg-red-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#EF3B3A] transition-colors group-hover:bg-white">
                <ArrowRight size={17} />
              </span>

              <span>
                <span className="block text-sm font-semibold text-gray-800">
                  View Candidates
                </span>

                <span className="mt-0.5 block text-xs text-gray-500">
                  Review applications
                </span>
              </span>
            </a>

            <a
              href="/enquiries"
              className="group flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-red-100 hover:bg-red-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#EF3B3A] transition-colors group-hover:bg-white">
                <ArrowRight size={17} />
              </span>

              <span>
                <span className="block text-sm font-semibold text-gray-800">
                  View Enquiries
                </span>

                <span className="mt-0.5 block text-xs text-gray-500">
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