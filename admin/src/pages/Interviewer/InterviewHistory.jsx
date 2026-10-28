export default function InterviewHistory() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Interview History</h1>
      <p className="mt-2">
        View completed interviews and previously submitted evaluations.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-3">Candidate</th>
              <th className="border p-3">Interview Date</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Evaluation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="border p-4 text-center">
                Interview history will appear here once connected to the API.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}