import { useState } from "react";
import { ArrowRight, ClipboardList, Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ScreenerStats from "../../components/Screener/ScreenerStats";
import ScreenerApplicationTable from "../../components/Screener/ScreenerApplicationTable";
import ScreenerActivity from "../../components/Screener/ScreenerActivity";
import CandidateResumeViewer from "../../components/Screener/CandidateResumeViewer";
import ScreeningHistoryModal from "../../components/Screener/ScreeningHistory";

import { getScreenerApplications } from "../../data/screenerPortalData";

const ScreenerDashboard = () => {
  const navigate = useNavigate();
  const [applications] = useState(getScreenerApplications);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showResume, setShowResume] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const pending = applications.filter((item) =>
    ["ASSIGNED_TO_L0", "L0_IN_PROGRESS"].includes(item.status)
  );

  const openApplication = (application) => {
    setSelectedApplication(application);
    setShowResume(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Screener Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back. Here is your screening workload and recent activity.
        </p>
      </div>

      <ScreenerStats applications={applications} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Pending Screening
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Applications assigned to you that need review.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/assigned-applications")}
              className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600"
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          <ScreenerApplicationTable
            applications={pending.slice(0, 5)}
            onOpen={openApplication}
            onHistory={(application) => {
              setSelectedApplication(application);
              setShowHistory(true);
            }}
          />
        </div>

        <ScreenerActivity applications={applications} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 size={19} className="text-amber-500" />
          <h2 className="font-semibold text-gray-900">My Workload</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">Pending Tasks</p>
            <p className="mt-2 text-2xl font-bold text-blue-800">
              {pending.length}
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-700">Completed Screening</p>
            <p className="mt-2 text-2xl font-bold text-green-800">
              {applications.filter((item) =>
                ["L0_SHORTLISTED", "L0_REJECTED"].includes(item.status)
              ).length}
            </p>
          </div>

          <div className="rounded-lg bg-purple-50 p-4">
            <p className="text-sm text-purple-700">HR Attention Required</p>
            <p className="mt-2 text-2xl font-bold text-purple-800">
              {applications.filter((item) =>
                ["L0_ON_HOLD", "HR_REVIEW_REQUIRED"].includes(item.status)
              ).length}
            </p>
          </div>
        </div>
      </div>

      {showResume && (
        <CandidateResumeViewer
          application={selectedApplication}
          onClose={() => {
            setShowResume(false);
            setSelectedApplication(null);
          }}
          onStartScreening={() => {
            setShowResume(false);
            navigate("/assigned-applications");
          }}
        />
      )}

      {showHistory && (
        <ScreeningHistoryModal
          application={selectedApplication}
          onClose={() => {
            setShowHistory(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </div>
  );
};

export default ScreenerDashboard;