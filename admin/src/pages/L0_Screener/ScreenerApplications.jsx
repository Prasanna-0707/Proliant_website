import { useMemo, useState } from "react";
import {
  Search,
  Eye,
  History,
  Play,
  CalendarPlus,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { SCREENING_STATUS } from "../../data/screenerPortalData";
import useApi from "../../services/useApi.js";
import {
  listScreeningApplications,
  getChecklist,
  getScreeningApplication,
  saveChecklist,
  startScreening as startScreeningRequest,
  submitDecision as submitDecisionRequest,
} from "../../services/screening.js";
import { toScreenerApplication } from "../../services/screenerAdapter.js";

import CandidateResumeViewer from "../../components/Screener/CandidateResumeViewer";
import ScreeningChecklist from "../../components/Screener/ScreeningChecklist";
import ScreeningDecisionModal from "../../components/Screener/ScreeningDecisionModal";
import ScreeningHistoryModal from "../../components/Screener/ScreeningHistory";
import ScheduleInterviewModal from "../../components/Interview/ScheduleInterviewModal";

const statusStyles = {
  ASSIGNED_TO_L0: "bg-blue-100 text-blue-700",
  L0_IN_PROGRESS: "bg-amber-100 text-amber-700",
  L0_SHORTLISTED: "bg-green-100 text-green-700",
  L0_REJECTED: "bg-red-100 text-red-700",
  L0_ON_HOLD: "bg-orange-100 text-orange-700",
  HR_REVIEW_REQUIRED: "bg-purple-100 text-purple-700",
  Interview: "bg-indigo-100 text-indigo-700",
};

const statusLabels = {
  ASSIGNED_TO_L0: "Assigned",
  L0_IN_PROGRESS: "In Progress",
  L0_SHORTLISTED: "Shortlisted",
  L0_REJECTED: "Rejected",
  L0_ON_HOLD: "On Hold",
  HR_REVIEW_REQUIRED: "HR Review",
  Interview: "Interview Scheduled",
};

export default function ScreenerApplications({
  title = "My Applications",
  description = "Review and manage your assigned candidate applications.",
  filterStatus = "ALL",
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showCandidate, setShowCandidate] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [notice, setNotice] = useState("");

  const [action, setAction] = useState({ busy: false, error: "" });

  const { data, loading, error, reload } = useApi(
    (signal) => listScreeningApplications({ page }, signal),
    [page]
  );

  const applications = useMemo(
    () => (data?.applications || []).map(toScreenerApplication),
    [data]
  );

  const filteredApplications = useMemo(() => {
    const searchText = search.toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !searchText ||
        application.candidateName?.toLowerCase().includes(searchText) ||
        application.email?.toLowerCase().includes(searchText) ||
        application.jobTitle?.toLowerCase().includes(searchText) ||
        application.id?.toLowerCase().includes(searchText);

      const matchesBaseStatus =
        filterStatus === "ALL" ||
        (Array.isArray(filterStatus)
          ? filterStatus.includes(application.status)
          : application.status === filterStatus);

      const matchesSelectedStatus =
        status === "ALL" || application.status === status;

      return matchesSearch && matchesBaseStatus && matchesSelectedStatus;
    });
  }, [applications, search, status, filterStatus]);

  // Opens the application, then refreshes it with the saved screening
  // details (checklist, feedback) from GET /screenings/applications/:id.
  const openCandidate = async (application) => {
    setSelectedApplication(application);
    setShowCandidate(true);

    try {
      const detail = await getScreeningApplication(application.id);

      setSelectedApplication((current) =>
        current && current.id === application.id
          ? {
              ...current,
              checklist: detail.screening?.checklist || current.checklist,
              remarks: detail.screening?.feedback || current.remarks,
            }
          : current
      );
    } catch {
      /* the list data is enough to show the application */
    }
  };

  const openHistory = (application) => {
    setSelectedApplication(application);
    setShowHistory(true);
  };

  // PATCH /api/screenings/applications/:id/start, then show the checklist.
  const startScreening = async (application) => {
    setAction({ busy: true, error: "" });

    try {
      if (application.status === SCREENING_STATUS.ASSIGNED) {
        await startScreeningRequest(application.id);
      }

      // Pre-fill the checklist with what was already saved.
      let saved = null;

      try {
        saved = (await getChecklist(application.id)).checklist;
      } catch {
        saved = null;
      }

      setSelectedApplication({
        ...application,
        checklist: saved || application.checklist,
        status: SCREENING_STATUS.IN_PROGRESS,
      });
      setShowCandidate(false);
      setShowChecklist(true);
      setAction({ busy: false, error: "" });
    } catch (requestError) {
      setAction({ busy: false, error: requestError.message });
    }
  };

  // PUT /api/screenings/applications/:id/checklist
  const continueToDecision = async (checklist) => {
    setAction({ busy: true, error: "" });

    try {
      await saveChecklist(selectedApplication.id, checklist);

      setShowChecklist(false);
      setShowDecision(true);
      setAction({ busy: false, error: "" });
    } catch (requestError) {
      setAction({ busy: false, error: requestError.message });
    }
  };

  // POST /api/screenings/applications/:id/decision
  const submitDecision = async (result) => {
    if (!selectedApplication) return;

    setAction({ busy: true, error: "" });

    try {
      await submitDecisionRequest(selectedApplication.id, {
        decision: result.decision,
        feedback: result.remarks,
        remarks: result.remarks,
        rejectionReason: result.rejectionReason || "",
        escalationReason:
          result.decision === "ESCALATE" ? result.remarks : "",
      });

      setShowDecision(false);
      setShowCandidate(false);
      setShowChecklist(false);
      setSelectedApplication(null);
      setAction({ busy: false, error: "" });
      reload();
    } catch (requestError) {
      setAction({ busy: false, error: requestError.message });
    }
  };

  const getStatusLabel = (value) =>
    statusLabels[value] || value?.replaceAll("_", " ") || "Unknown";

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {notice}
        </p>
      )}

      {action.error && !showChecklist && !showDecision && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {action.error}
        </p>
      )}

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

        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500" role="status">
            Loading applications...
          </p>
        ) : error ? (
          <div className="px-5 py-12 text-center" role="alert">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-3 text-sm font-medium text-red-500 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
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
                        <p className="text-xs text-gray-500">{application.email}</p>
                        <p className="mt-1 text-xs text-gray-400">{application.id}</p>
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

                          <button
                            type="button"
                            title="Screening history"
                            onClick={() => openHistory(application)}
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <History size={16} />
                          </button>

                          {application.status === "L0_SHORTLISTED" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowSchedule(true);
                              }}
                              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                            >
                              <CalendarPlus size={14} />
                              Schedule L1
                            </button>
                          )}

                          {(application.status === SCREENING_STATUS.ASSIGNED ||
                            application.status === SCREENING_STATUS.IN_PROGRESS) && (
                            <button
                              type="button"
                              disabled={action.busy}
                              onClick={() => startScreening(application)}
                              className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
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
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
                aria-label="Previous page"
                className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => value + 1)}
                aria-label="Next page"
                className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCandidate && selectedApplication && (
        <CandidateResumeViewer
          application={selectedApplication}
          onClose={() => setShowCandidate(false)}
          onStartScreening={() => startScreening(selectedApplication)}
        />
      )}

      {showChecklist && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <ScreeningChecklist
              application={selectedApplication}
              saving={action.busy}
              error={action.error}
              onContinue={continueToDecision}
            />

            <button
              type="button"
              onClick={() => {
                setShowChecklist(false);
                reload();
              }}
              className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showDecision && selectedApplication && (
        <ScreeningDecisionModal
          application={selectedApplication}
          onClose={() => setShowDecision(false)}
          onSubmit={submitDecision}
          submitting={action.busy}
          error={action.error}
        />
      )}

      {showSchedule && selectedApplication && (
        <ScheduleInterviewModal
          mode="schedule"
          application={{
            _id: selectedApplication.id,
            name: selectedApplication.candidateName,
            position: selectedApplication.jobTitle,
          }}
          onClose={() => setShowSchedule(false)}
          onDone={(result) => {
            setShowSchedule(false);
            setSelectedApplication(null);
            setNotice(
              `L1 interview scheduled with ${
                result.interview?.assignedTo?.name || "the interviewer"
              }. The interviewer and candidate were notified by email.`
            );
            reload();
          }}
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