import {
  CheckCircle2,
  Clock3,
  CalendarDays,
  Activity,
} from "lucide-react";

const activityIcons = {
  success: CheckCircle2,
  info: Activity,
  primary: CalendarDays,
};

export default function RecentHiringActivity({ activities = [] }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Hiring Activity
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Latest updates from the hiring process
          </p>
        </div>

        <Activity size={21} className="text-gray-400" />
      </div>

      <div className="space-y-5">
        {activities.map((activity) => {
          const Icon =
            activityIcons[activity.type] || Clock3;

          return (
            <div key={activity.id} className="flex gap-3">
              <div className="mt-0.5 rounded-full bg-gray-100 p-2 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <Icon size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {activity.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {activity.description}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                  <span>{activity.user}</span>
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}