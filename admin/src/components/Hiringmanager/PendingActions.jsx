import { AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PendingActions({ actions = [] }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-5 flex items-center gap-3">
        <AlertCircle className="text-[#EF3B3A]" size={21} />

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pending Actions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Items that require your attention
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            to={action.path}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-4 transition hover:border-red-200 hover:bg-red-50/40 dark:border-gray-800 dark:hover:bg-gray-800"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {action.title}
                </h3>

                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    action.priority === "High"
                      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {action.priority}
                </span>
              </div>

              <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                {action.description}
              </p>
            </div>

            <ArrowRight
              size={17}
              className="shrink-0 text-gray-400"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}