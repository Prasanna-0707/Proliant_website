import { ArrowRight, Users } from "lucide-react";

export default function HiringPipelineOverview({ stages = [] }) {
  const total = stages.reduce(
    (sum, stage) => sum + stage.count,
    0
  );

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Interview Pipeline
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Candidate distribution across hiring stages
          </p>
        </div>

        <Users className="text-gray-400" size={21} />
      </div>

      <div className="space-y-5">
        {stages.map((stage) => {
          const percentage =
            total > 0 ? (stage.count / total) * 100 : 0;

          return (
            <div key={stage.stage}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stage.stage}
                </span>

                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stage.count}
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className={`h-full rounded-full ${stage.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <a
        href="/hiring-manager/interview-pipeline"
        className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#EF3B3A] hover:underline"
      >
        View complete pipeline
        <ArrowRight size={16} />
      </a>
    </section>
  );
}