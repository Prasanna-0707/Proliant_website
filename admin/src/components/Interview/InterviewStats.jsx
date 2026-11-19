import {
  Users,
  CalendarDays,
  Clock,
  CheckCircle2,
} from "lucide-react";

const InterviewStats = ({ interviews = [] }) => {
  const total = interviews.length;

  const upcoming = interviews.filter(
    (item) => item.status === "Scheduled"
  ).length;

  const pending = interviews.filter(
    (item) => item.decision === "Pending"
  ).length;

  const completed = interviews.filter(
    (item) => item.status === "Completed"
  ).length;

  const stats = [
    {
      title: "Total Interviews",
      value: total,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Upcoming Interviews",
      value: upcoming,
      icon: CalendarDays,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Pending Feedback",
      value: pending,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Completed Interviews",
      value: completed,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  {stat.value}
                </h3>
              </div>

              <div className={`rounded-lg p-3 ${stat.color}`}>
                <Icon size={22} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InterviewStats;