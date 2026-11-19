import { Activity, Clock } from "lucide-react";

// `activities` comes from GET /api/screenings/dashboard/recent-activity.
const ScreenerActivity = ({ activities = [] }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Activity size={19} className="text-red-500" />
        <h2 className="font-semibold text-gray-900">Recent Activity</h2>
      </div>

      <div className="space-y-4">
        {activities.length ? (
          activities.slice(0, 6).map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-800">
                  {String(activity.action || "").replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {activity.resourceLabel || activity.resourceType}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  {activity.createdAt
                    ? new Date(activity.createdAt).toLocaleString()
                    : "Date unavailable"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No recent activity.</p>
        )}
      </div>
    </div>
  );
};

export default ScreenerActivity;