import {
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  PauseCircle,
  AlertCircle,
} from "lucide-react";

const ScreenerStats = ({ applications = [] }) => {
  const stats = [
    {
      label: "Assigned Applications",
      value: applications.length,
      icon: Users,
      style: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending Screening",
      value: applications.filter((item) =>
        ["ASSIGNED_TO_L0", "L0_IN_PROGRESS"].includes(item.status)
      ).length,
      icon: Clock3,
      style: "bg-amber-50 text-amber-600",
    },
    {
      label: "Shortlisted",
      value: applications.filter((item) => item.status === "L0_SHORTLISTED").length,
      icon: CheckCircle2,
      style: "bg-green-50 text-green-600",
    },
    {
      label: "Rejected",
      value: applications.filter((item) => item.status === "L0_REJECTED").length,
      icon: XCircle,
      style: "bg-red-50 text-red-600",
    },
    {
      label: "On Hold",
      value: applications.filter((item) => item.status === "L0_ON_HOLD").length,
      icon: PauseCircle,
      style: "bg-orange-50 text-orange-600",
    },
    {
      label: "HR Review",
      value: applications.filter((item) => item.status === "HR_REVIEW_REQUIRED").length,
      icon: AlertCircle,
      style: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  {stat.value}
                </h3>
              </div>
              <div className={`rounded-lg p-3 ${stat.style}`}>
                <Icon size={22} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScreenerStats;