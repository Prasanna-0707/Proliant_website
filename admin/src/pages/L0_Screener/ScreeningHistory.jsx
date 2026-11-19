import { useState } from "react";
import { History } from "lucide-react";

import ScreenerApplicationTable from "../../components/Screener/ScreenerApplicationTable";
import ScreeningHistoryModal from "../../components/Screener/ScreeningHistory";
import { getScreenerApplications } from "../../data/screenerPortalData";

const ScreeningHistoryPage = () => {
  const [applications] = useState(getScreenerApplications);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const historyApplications = applications.filter(
    (item) => item.history?.length
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
          <History size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Screening History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View your previous screening activities and decisions.
          </p>
        </div>
      </div>

      <ScreenerApplicationTable
        applications={historyApplications}
        onOpen={setSelectedApplication}
        onHistory={setSelectedApplication}
      />

      {selectedApplication && (
        <ScreeningHistoryModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
};

export default ScreeningHistoryPage;