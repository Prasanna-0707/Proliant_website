function ScreenerStats({ screeners }) {
  const totalScreeners = screeners.length;

  const activeScreeners = screeners.filter(
    (item) => item.isActive
  ).length;

  const inactiveScreeners = totalScreeners - activeScreeners;

  const stats = [
    {
      label: "Total Screeners",
      value: totalScreeners,
      description: "Employees assigned as screeners",
      color: "text-gray-900 dark:text-white",
    },
    {
      label: "Active Screeners",
      value: activeScreeners,
      description: "Currently available screeners",
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Inactive Screeners",
      value: inactiveScreeners,
      description: "Currently unavailable",
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {stat.label}
          </p>

          <h2
            className={`mt-2 text-3xl font-semibold ${stat.color}`}
          >
            {stat.value}
          </h2>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ScreenerStats;