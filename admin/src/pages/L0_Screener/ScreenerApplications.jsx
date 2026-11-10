
import { useEffect, useMemo, useState } from "react";
import { Search, Eye, FileText, History, Play, Filter } from "lucide-react";
import {
  SCREENER_STORAGE_KEY,
  SCREENING_STATUS,
  getScreenerApplications,
  saveScreenerApplications,
  addScreeningHistory,
} from "../../data/screenerPortalData";

import CandidateResumeViewer from "../../components/Screener/CandidateResumeViewer";
import ScreeningChecklist from "../../components/Screener/ScreeningChecklist";
import ScreeningDecisionModal from "../../components/Screener/ScreeningDecisionModal";
import ScreeningHistoryModal from "../../components/Screener/ScreeningHistory";

const statusStyles = {
  ASSIGNED_TO_L0: "bg-blue-100 text-blue-700",
  L0_IN_PROGRESS: "bg-amber-100 text-amber-700",
  L0_SHORTLISTED: "bg-green-100 text-green-700",
  L0_REJECTED: "bg-red-100 text-red-700",
  L0_ON_HOLD: "bg-orange-100 text-orange-700",
  HR_REVIEW_REQUIRED: "bg-purple-100 text-purple-700",
};

const statusLabels = {
  ASSIGNED_TO_L0: "Assigned",
  L0_IN_PROGRESS: "In Progress",
  L0_SHORTLISTED: "Shortlisted",
  L0_REJECTED: "Rejected",
  L0_ON_HOLD: "On Hold",
  HR_REVIEW_REQUIRED: "HR Review",
};

const statusTransitions = {
  SHORTLIST: {
    status: SCREENING_STATUS.SHORTLISTED,
    currentStage: "L1_INTERVIEW",
    action: "Candidate shortlisted and moved to L1 Interview",
  },
  REJECT: {
    status: SCREENING_STATUS.REJECTED,
    currentStage: "L0_SCREENING",
    action: "Candidate rejected during L0 Screening",
  },
  ON_HOLD: {
    status: SCREENING_STATUS.ON_HOLD,
    currentStage: "L0_SCREENING",
    action: "Application put on hold for HR review",
  },
  ESCALATE: {
    status: SCREENING_STATUS.HR_REVIEW,
    currentStage: "L0_SCREENING",
    action: "Application escalated to HR for review",
  },
};

export default function ScreenerApplications({
  title = "My Applications",
  description = "Review and manage your assigned candidate applications.",
  filterStatus = "ALL",
}) {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showCandidate, setShowCandidate] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setApplications(getScreenerApplications());
  }, []);

  const refreshApplications = () => {
    setApplications(getScreenerApplications());
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        application.candidateName?.toLowerCase().includes(searchText) ||
        application.email?.toLowerCase().includes(searchText) ||
        application.jobTitle?.toLowerCase().includes(searchText) ||
        application.applicationId?.toLowerCase().includes(searchText) ||
        application.id?.toLowerCase().includes(searchText);

      const matchesBaseStatus =
        filterStatus === "ALL" ||
        (Array.isArray(filterStatus)
          ? filterStatus.includes(application.status)
          : application.status === filterStatus);

      const matchesSelectedStatus =
        status === "ALL" || application.status === status;

      return (
        matchesSearch &&
        matchesBaseStatus &&
        matchesSelectedStatus
      );
    });
  }, [applications, search, status, filterStatus]);

  const openCandidate = (application) => {
    setSelectedApplication(application);
    setShowCandidate(true);
  };

  const openHistory = (application) => {
    setSelectedApplication(application);
    setShowHistory(true);
  };

  const startScreening = (application) => {
    const updatedApplications = applications.map((item) => {
      if (item.id !== application.id) return item;

      if (item.status === SCREENING_STATUS.IN_PROGRESS) {
        return item;
      }

      return {
        ...item,
        status: SCREENING_STATUS.IN_PROGRESS,
        currentStage: "L0_SCREENING",
        history: addScreeningHistory(item, "L0 Screening started"),
      };
    });

    setApplications(updatedApplications);
    saveScreenerApplications(updatedApplications);

    const updatedSelected = updatedApplications.find(
      (item) => item.id === application.id
    );

    setSelectedApplication(updatedSelected);
    setShowCandidate(false);
    setShowChecklist(true);
  };

  const continueToDecision = () => {
    setShowChecklist(false);
    setShowDecision(true);
  };

  const submitDecision = (result) => {
    if (!selectedApplication || !statusTransitions[result.decision]) {
      return;
    }

    const transition = statusTransitions[result.decision];

    const updatedApplications = applications.map((item) => {
      if (item.id !== selectedApplication.id) return item;

      const updatedItem = {
        ...item,
        status: transition.status,
        currentStage: transition.currentStage,
        remarks: result.remarks,
        rejectionReason: result.rejectionReason || "",
        history: addScreeningHistory(item, transition.action),
      };

      return updatedItem;
    });

    setApplications(updatedApplications);
    saveScreenerApplications(updatedApplications);

    setSelectedApplication(
      updatedApplications.find(
        (item) => item.id === selectedApplication.id
      )
    );

    setShowDecision(false);
    setShowCandidate(false);
    setShowChecklist(false);
  };

  const getStatusLabel = (value) => {
    return statusLabels[value] || value?.replaceAll("_", " ") || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate, email, job or application ID..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-red-500"
            />
          </div>

          <div className="relative md:w-56">
            <Filter
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-red-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED_TO_L0">Assigned</option>
              <option value="L0_IN_PROGRESS">In Progress</option>
              <option value="L0_SHORTLISTED">Shortlisted</option>
              <option value="L0_REJECTED">Rejected</option>
              <option value="L0_ON_HOLD">On Hold</option>
              <option value="HR_REVIEW_REQUIRED">HR Review</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Applications</h2>
            <p className="text-xs text-gray-500">
              {filteredApplications.length} application(s) found
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Candidate</th>
                <th className="px-5 py-4 font-semibold">Job Position</th>
                <th className="px-5 py-4 font-semibold">Experience</th>
                <th className="px-5 py-4 font-semibold">Applied Date</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {application.candidateName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {application.email}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {application.applicationId || application.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {application.jobTitle || "-"}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {application.experience || "-"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {application.appliedDate || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          statusStyles[application.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {getStatusLabel(application.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          title="View application"
                          onClick={() => openCandidate(application)}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                        >
                          <Eye size={16} />
                        </button>

                        {application.resumeUrl && (
                          <a
                            href={application.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="View resume"
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <FileText size={16} />
                          </a>
                        )}

                        <button
                          type="button"
                          title="Screening history"
                          onClick={() => openHistory(application)}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                        >
                          <History size={16} />
                        </button>

                        {(application.status === SCREENING_STATUS.ASSIGNED ||
                          application.status === SCREENING_STATUS.IN_PROGRESS) && (
                          <button
                            type="button"
                            onClick={() => startScreening(application)}
                            className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                          >
                            <Play size={14} />
                            {application.status === SCREENING_STATUS.IN_PROGRESS
                              ? "Continue"
                              : "Start"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center">
                    <p className="font-medium text-gray-700">
                      No applications found
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Try changing your search or status filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCandidate && selectedApplication && (
        <CandidateResumeViewer
          application={selectedApplication}
          onClose={() => setShowCandidate(false)}
          onStartScreening={() => startScreening(selectedApplication)}
        />
      )}

      {showChecklist && selectedApplication && (
        <ScreeningChecklist
          application={selectedApplication}
          onClose={() => setShowChecklist(false)}
          onContinue={continueToDecision}
        />
      )}

      {showDecision && selectedApplication && (
        <ScreeningDecisionModal
          application={selectedApplication}
          onClose={() => setShowDecision(false)}
          onSubmit={submitDecision}
        />
      )}

      {showHistory && selectedApplication && (
        <ScreeningHistoryModal
          application={selectedApplication}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}