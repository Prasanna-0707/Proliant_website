function DataTable({ columns, data, emptyMessage = "No data available." }) {
  return (
    <div className="overflow-x-auto">
      {data.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <table className="w-full min-w-max text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="border-b border-gray-100 last:border-b-0"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-5 py-4 text-sm text-gray-700"
                  >
                    {column.render
                      ? column.render(row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DataTable;