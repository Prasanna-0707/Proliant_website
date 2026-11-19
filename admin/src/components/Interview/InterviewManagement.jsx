import { useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";

import useApi from "../../services/useApi.js";
import {
  listManagedInterviews,
  getManagedInterview,
  cancelInterview,
} from "../../services/interviews.js";
import { listScreeningQueue } from "../../services/hrScreeners.js";
import { formatDateTime } from "../../services/format.js";

import DataState, { EmptyState } from "../StateMessage";
import Modal, {
  Field,
  inputClass,
  primaryButton,
  secondaryButton,
} from "../common/Modal";
import ScheduleInterviewModal from "./ScheduleInterviewModal";

const STATUS_STYLES = {
  Scheduled: "bg-blue-50 text-blue-700",
  Confirmed: "bg-emerald-50 text-emerald-700",
  Rescheduled: "bg-amber-50 text-amber-700",
  Completed: "bg-gray-100 text-gray-700",
  Cancelled: "bg-red-50 text-red-700",
  "No-Show": "bg-red-50 text-red-700",
};

const ACTIVE = ["Scheduled", "Confirmed", "Rescheduled"];

// Candidates that are ready for this stage to be scheduled.
const isReadyForStage = (application, stageCode) => {
  if (["Rejected", "L0_REJECTED", "Selected"].includes(application.status)) {
    return false;
  }

  if (application.status === "Interview") return false;

  if (stageCode === "L1") {
    return (
      application.status === "L0_SHORTLISTED" ||
      application.currentStage === "L1_INTERVIEW" ||
      application.currentStage === "L1"
    );
  }

  return application.currentStage === stageCode;
};

// HR / Global Administrator view of one interview stage (L1, L2, ...):
// schedule, reschedule, reassign, cancel and see the history.
export default function InterviewManagement({ stageCode, title }) {
  const interviews = useApi(
    (signal) => listManagedInterviews({ stageCode }, signal),
    [stageCode]
  );

  const queue = useApi(
    (signal) => listScreeningQueue({ scope: "assigned", limit: 500 }, signal),
    []
  );

  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [picked, setPicked] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const rows = useMemo(() => {
    const list = interviews.data?.interviews || [];
    const needle = search.trim().toLowerCase();

    return list.filter((item) => {
      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesSearch =
        !needle ||
        [item.application?.name, item.application?.email, item.assignedTo?.name]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(needle));

      return matchesStatus && matchesSearch;
    });
  }, [interviews.data, statusFilter, search]);

  const stats = useMemo(() => {
    const list = interviews.data?.interviews || [];

    return {
      total: list.length,
      upcoming: list.filter((item) => ACTIVE.includes(item.status)).length,
      completed: list.filter((item) => item.status === "Completed").length,
      cancelled: list.filter((item) => item.status === "Cancelled").length,
    };
  }, [interviews.data]);

  const readyCandidates = useMemo(
    () =>
      (queue.data?.applications || []).filter((item) =>
        isReadyForStage(item, stageCode)
      ),
    [queue.data, stageCode]
  );

  const flash = (type, text) => setMessage({ type, text });

  const refresh = () => {
    interviews.reload();
    queue.reload();
  };

  const finish = (result, text) => {
    setModal(null);
    setPicked("");

    const email = result?.emailStatus;
    const mail =
      email && (email.interviewer === "failed" || email.candidate === "failed")
        ? " (some email notifications could not be sent)"
        : "";

    flash("success", `${text}${mail}`);
    refresh();
  };

  const openHistory = async (item) => {
    try {
      const data = await getManagedInterview(item._id);
      setModal({ type: "history", interview: data.interview });
    } catch (requestError) {
      flash("error", requestError.message);
    }
  };

  const submitCancel = async (event) => {
    event.preventDefault();
    setBusy(true);

    try {
      const result = await cancelInterview(
        modal.interview._id,
        cancelReason
      );

      setCancelReason("");
      finish(result, "Interview cancelled.");
    } catch (requestError) {
      flash("error", requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const pickedApplication = readyCandidates.find((item) => item._id === picked);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <CalendarDays size={24} className="text-red-500" />
            {title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Schedule, reschedule, reassign and cancel {stageCode} interviews.
            The interviewer and candidate are emailed for every change.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModal({ type: "pick" })}
          className={`${primaryButton} flex items-center gap-2`}
        >
          <Plus size={16} />
          Schedule interview
        </button>
      </div>

      {message.text && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Total", stats.total],
          ["Upcoming", stats.upcoming],
          ["Completed", stats.completed],
          ["Cancelled", stats.cancelled],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search candidate or interviewer"
            className={`${inputClass} sm:w-72`}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={`${inputClass} sm:w-48`}
          >
            {["All", ...Object.keys(STATUS_STYLES)].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>

        <DataState
          loading={interviews.loading}
          error={interviews.error}
          onRetry={interviews.reload}
        >
          {rows.length === 0 ? (
            <EmptyState text="No interviews found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
                  <tr>
                    {["Candidate", "Position", "Interviewer", "When", "Mode", "Status", "Actions"].map(
                      (heading) => (
                        <th key={heading} className="px-4 py-3 font-semibold">
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((item) => {
                    const active = ACTIVE.includes(item.status);

                    return (
                      <tr key={item._id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {item.application?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.application?.email}
                          </p>
                        </td>
                        <td className="px-4 py-3">{item.job?.title}</td>
                        <td className="px-4 py-3">{item.assignedTo?.name}</td>
                        <td className="px-4 py-3">
                          {formatDateTime(item.scheduledAt)}
                        </td>
                        <td className="px-4 py-3">{item.mode}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              STATUS_STYLES[item.status] || "bg-gray-100"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2 text-xs font-medium">
                            <button
                              type="button"
                              onClick={() => openHistory(item)}
                              className="text-gray-600 hover:underline"
                            >
                              History
                            </button>

                            {active && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setModal({ type: "reschedule", interview: item })
                                  }
                                  className="text-blue-600 hover:underline"
                                >
                                  Reschedule
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setModal({ type: "reassign", interview: item })
                                  }
                                  className="text-amber-600 hover:underline"
                                >
                                  Reassign
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setModal({ type: "cancel", interview: item })
                                  }
                                  className="text-red-600 hover:underline"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DataState>
      </div>

      {modal?.type === "pick" && !pickedApplication && (
        <Modal title={`Schedule ${stageCode} interview`} onClose={() => setModal(null)}>
          {queue.loading ? (
            <p className="text-sm text-gray-500">Loading candidates...</p>
          ) : readyCandidates.length === 0 ? (
            <p className="text-sm text-gray-600">
              No candidates are ready for {stageCode}. Candidates appear here
              after the L0 screener shortlists them
              {stageCode !== "L1" ? " and the previous stage is advanced" : ""}.
            </p>
          ) : (
            <div className="space-y-4">
              <Field label="Candidate">
                <select
                  value={picked}
                  onChange={(event) => setPicked(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a candidate</option>
                  {readyCandidates.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} — {item.position}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}
        </Modal>
      )}

      {modal?.type === "pick" && pickedApplication && (
        <ScheduleInterviewModal
          mode="schedule"
          application={pickedApplication}
          stageCode={stageCode}
          onClose={() => {
            setModal(null);
            setPicked("");
          }}
          onDone={(result) => finish(result, "Interview scheduled.")}
        />
      )}

      {modal?.type === "reschedule" && (
        <ScheduleInterviewModal
          mode="reschedule"
          interview={modal.interview}
          onClose={() => setModal(null)}
          onDone={(result) => finish(result, "Interview rescheduled.")}
        />
      )}

      {modal?.type === "reassign" && (
        <ScheduleInterviewModal
          mode="reassign"
          interview={modal.interview}
          onClose={() => setModal(null)}
          onDone={(result) => finish(result, "Interviewer reassigned.")}
        />
      )}

      {modal?.type === "cancel" && (
        <Modal title="Cancel interview" onClose={() => setModal(null)}>
          <form onSubmit={submitCancel} className="space-y-4">
            <p className="text-sm text-gray-600">
              Cancel the {modal.interview.stageName} interview with{" "}
              <strong>{modal.interview.application?.name}</strong>? Both
              parties will be emailed.
            </p>

            <Field label="Reason (required)">
              <textarea
                required
                rows={3}
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModal(null)}
                className={secondaryButton}
              >
                Keep interview
              </button>
              <button type="submit" disabled={busy} className={primaryButton}>
                {busy ? "Cancelling..." : "Cancel interview"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.type === "history" && (
        <Modal
          title={`${modal.interview.stageName} history`}
          onClose={() => setModal(null)}
        >
          <ol className="space-y-3">
            {(modal.interview.history || []).map((entry, index) => (
              <li
                key={index}
                className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
              >
                <p className="font-semibold">{entry.action}</p>
                <p className="text-xs text-gray-500">
                  {formatDateTime(entry.at)}
                  {entry.performedByName ? ` by ${entry.performedByName}` : ""}
                </p>
                {entry.newScheduledAt && (
                  <p className="mt-1">
                    Scheduled for {formatDateTime(entry.newScheduledAt)}
                  </p>
                )}
                {entry.reason && (
                  <p className="mt-1 text-gray-600">Reason: {entry.reason}</p>
                )}
              </li>
            ))}
          </ol>
        </Modal>
      )}
    </div>
  );
}
