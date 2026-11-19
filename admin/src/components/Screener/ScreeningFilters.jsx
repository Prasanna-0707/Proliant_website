import { Search, Filter } from "lucide-react";

const ScreeningFilters = ({
  search,
  setSearch,
  status,
  setStatus,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search candidate, email or job..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-red-400"
        />
      </div>

      <div className="relative sm:w-52">
        <Filter
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full appearance-none rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-red-400"
        >
          <option value="ALL">All statuses</option>
          <option value="ASSIGNED_TO_L0">Assigned</option>
          <option value="L0_IN_PROGRESS">In Progress</option>
          <option value="L0_SHORTLISTED">Shortlisted</option>
          <option value="L0_REJECTED">Rejected</option>
          <option value="L0_ON_HOLD">On Hold</option>
          <option value="HR_REVIEW_REQUIRED">HR Review</option>
        </select>
      </div>
    </div>
  );
};

export default ScreeningFilters;