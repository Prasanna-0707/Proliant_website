import {
  hiringManagerStats,
  hiringPipeline,
  upcomingInterviews,
  pendingActions,
  recentHiringActivity,
} from "../../data/hiringManagerData";

import HiringManagerStats from "../../components/HiringManager/HiringManagerStats";
import HiringPipelineOverview from "../../components/HiringManager/HiringPipelineOverview";
import UpcomingInterviews from "../../components/HiringManager/UpcomingInterviews";
import PendingActions from "../../components/HiringManager/PendingActions";
import RecentHiringActivity from "../../components/HiringManager/RecentHiringActivity";

export default function HiringManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Hiring Manager Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor interview progress, coordinate hiring activities,
          and review candidate decisions.
        </p>
      </div>

      <HiringManagerStats stats={hiringManagerStats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <HiringPipelineOverview stages={hiringPipeline} />
        <PendingActions actions={pendingActions} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <UpcomingInterviews interviews={upcomingInterviews} />
        <RecentHiringActivity activities={recentHiringActivity} />
      </div>
    </div>
  );
}