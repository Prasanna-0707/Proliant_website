import { CalendarDays, Clock, Video } from "lucide-react";
import { Link } from "react-router-dom";

export default function UpcomingInterviews({ interviews = [] }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Interviews
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your upcoming interview schedule
          </p>
        </div>

        <CalendarDays size={21} className="text-gray-400" />
      </div>

      <div className="space-y-4">
        {interviews.slice(0, 4).map((interview) => (
          <div
            key={interview.id}
            className="rounded-lg border border-gray-100 p-4 dark:border-gray-800"
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {interview.candidate}
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {interview.position}
                </p>

                <p className="mt-2 text-xs font-medium text-[#EF3B3A]">
                  {interview.stage}
                </p>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300 sm:text-right">
                <p className="flex items-center gap-2 sm:justify-end">
                  <CalendarDays size={14} />
                  {interview.date}
                </p>

                <p className="mt-2 flex items-center gap-2 sm:justify-end">
                  <Clock size={14} />
                  {interview.time}
                </p>

                <p className="mt-2 flex items-center gap-2 sm:justify-end">
                  <Video size={14} />
                  {interview.mode}
                </p>
              </div>
            </div>

            <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
              Interviewer: {interview.interviewer}
            </p>
          </div>
        ))}
      </div>

      <Link
        to="/hiring-manager/interview-schedule"
        className="mt-5 inline-flex text-sm font-semibold text-[#EF3B3A] hover:underline"
      >
        View full schedule
      </Link>
    </section>
  );
}