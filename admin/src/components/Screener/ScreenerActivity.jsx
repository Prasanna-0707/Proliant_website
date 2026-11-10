import { Activity, Clock } from "lucide-react";

const ScreenerActivity = ({ applications = [] }) => {
  const activities = applications
    .flatMap((application) =>
      (application.history || []).map((entry) => ({
        ...entry,
        candidateName: application.candidateName,
        applicationId: application.id,
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Activity size={19} className="text-red-500" />
        <h2 className="font-semibold text-gray-900">Recent Activity</h2>
      </div>

      <div className="space-y-4">
        {activities.length ? (
          activities.map((activity, index) => (
            <div key={`${activity.applicationId}-${index}`} className="flex gap-3">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-800">
                  {activity.action}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {activity.candidateName} · {activity.applicationId}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  {activity.date
                    ? new Date(activity.date).toLocaleString()
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