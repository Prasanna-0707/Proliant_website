import {
  Users,
  BriefcaseBusiness,
  Building2,
  UserRoundSearch,
  MessageSquareText,
} from "lucide-react";

const icons = {
  employees: Users,
  projects: BriefcaseBusiness,
  deployments: Building2,
  candidates: UserRoundSearch,
  enquiries: MessageSquareText,
};

function StatCard({ title, value, type, description }) {
  const Icon = icons[type];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-[#EF3B3A]">
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>

      {description && (
        <p className="mt-3 text-xs text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}

export default StatCard;