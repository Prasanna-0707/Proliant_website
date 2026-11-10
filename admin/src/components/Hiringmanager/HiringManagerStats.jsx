import {
  Users,
  CalendarDays,
  ClipboardCheck,
  CheckCircle2,
} from "lucide-react";

const iconMap = {
  users: Users,
  calendar: CalendarDays,
  clipboard: ClipboardCheck,
  check: CheckCircle2,
};

export default function HiringManagerStats({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = iconMap[item.icon] || Users;

        return (
          <div
            key={item.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {item.title}
                </p>

                <h3 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                  {item.value}
                </h3>
              </div>

              <div className="rounded-lg bg-red-50 p-3 text-[#EF3B3A] dark:bg-red-950/40">
                <Icon size={21} />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}