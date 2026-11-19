import { useMemo, useState } from "react";
import { UserCheck } from "lucide-react";

import useApi from "../../services/useApi.js";
import {
  listScreeners,
  listScreeningQueue,
  assignScreener,
  reassignScreener,
  getAssignmentHistory,
} from "../../services/hrScreeners.js";
import { formatDateTime } from "../../services/format.js";

import DataState, { EmptyState } from "../../components/StateMessage";
import Modal, {
  Field,
  inputClass,
  primaryButton,
  secondaryButton,
} from "../../components/common/Modal";

const SCOPES = [
  ["unassigned", "Unassigned"],
  ["assigned", "Assigned"],
  ["all", "All"],
];

// HR: real L0_SCREENER accounts, their workload, and application assignment.
export default function L0Screener() {
  const [scope, setScope] = useState("unassigned");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ screenerId: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const screeners = useApi((signal) => listScreeners({}, signal), []);

  const queue = useApi(
    (signal) => listScreeningQueue({ scope, search, limit: 200 }, signal),
    [scope, search]
  );

  const history = useApi(
    (signal) =>
      modal?.type === "history"
        ? getAssignmentHistory({ applicationId: modal.application._id }, signal)
        : Promise.resolve(null),
    [modal?.type, modal?.application?._id]
  );

  const screenerList = useMemo(
    () => screeners.data?.screeners || [],
    [screeners.data]
  );

  const totals = useMemo(
    () => ({
      active: screenerList.filter((item) => item.status === "Active").length,
      open: screenerList.reduce((sum, item) => sum + item.workload.open, 0),
      completed: screenerList.reduce(
        (sum, item) => sum + item.workload.completed,
        0
      ),
    }),
    [screenerList]
  );

  const openAssign = (application) => {
    setForm({ screenerId: "", reason: "" });
    setModal({
      type: application.assignedScreener ? "reassign" : "assign",
      application,
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const call = modal.type === "reassign" ? reassignScreener : assignScreener;

      const result = await call({
        applicationId: modal.application._id,
        screenerId: form.screenerId,
        reason: form.reason,
      });

      setMessage({
        type: "success",
        text: `${result.message}${
          result.departmentMismatch
            ? " Note: the screener is from a different department."
            : ""
        }`,
      });
      setModal(null);
      screeners.reload();
      queue.reload();
    } catch (requestError) {
      setMessage({ type: "error", text: requestError.message });
    } finally {
      setSaving(false);
    }
  };

  const activeScreeners = screenerList.filter(
    (item) => item.status === "Active" && item._id !== modal?.application?.assignedScreener?._id
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <UserCheck size={24} className="text-red-500" />
          L0 Screening Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Assign candidates to L0 screeners, balance workload and review
          assignment history.
        </p>
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
          ["L0 screeners", screenerList.length],
          ["Active", totals.active],
          ["Open applications", totals.open],
          ["Completed screenings", totals.completed],
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

      <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <h2 className="border-b border-gray-200 px-4 py-3 text-base font-semibold dark:border-gray-800">
          L0 Screeners
        </h2>

        <DataState
          loading={screeners.loading}
          error={screeners.error}
          onRetry={screeners.reload}
        >
          {screenerList.length === 0 ? (
            <EmptyState text="No L0 screeners found. Create L0 Screener accounts in Users." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
                  <tr>
                    {["Screener", "Department", "Status", "Pending", "In progress", "Completed"].map(
                      (heading) => (
                        <th key={heading} className="px-4 py-3 font-semibold">
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {screenerList.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.email}</p>
                      </td>
                      <td className="px-4 py-3">{item.department || "—"}</td>
                      <td className="px-4 py-3">{item.status}</td>
                      <td className="px-4 py-3">{item.workload.pending}</td>
                      <td className="px-4 py-3">{item.workload.inProgress}</td>
                      <td className="px-4 py-3">{item.workload.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataState>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold">Applications</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex gap-2">
              {SCOPES.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScope(value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    scope === value
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search candidate or position"
              className={`${inputClass} sm:w-64`}
            />
          </div>
        </div>

        <DataState
          loading={queue.loading}
          error={queue.error}
          onRetry={queue.reload}
        >
          {(queue.data?.applications || []).length === 0 ? (
            <EmptyState text="No applications in this view." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
                  <tr>
                    {["Candidate", "Position", "Department", "Status", "Screener", "Actions"].map(
                      (heading) => (
                        <th key={heading} className="px-4 py-3 font-semibold">
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {queue.data.applications.map((item) => {
                    const finished = ["L0_SHORTLISTED", "L0_REJECTED", "Interview", "Selected", "Rejected"].includes(item.status) || item.screening?.status === "Completed";

                    return (
                      <tr key={item._id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">{item.email}</p>
                        </td>
                        <td className="px-4 py-3">{item.position}</td>
                        <td className="px-4 py-3">{item.department || "—"}</td>
                        <td className="px-4 py-3">
                          {item.status}
                          {item.screening?.assignmentPending && (
                            <span className="ml-2 text-xs text-amber-600">
                              pending assignment
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.assignedScreener?.name || "Unassigned"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3 text-xs font-medium">
                            {!finished && (
                              <button
                                type="button"
                                onClick={() => openAssign(item)}
                                className="text-red-600 hover:underline"
                              >
                                {item.assignedScreener ? "Reassign" : "Assign"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setModal({ type: "history", application: item })
                              }
                              className="text-gray-600 hover:underline"
                            >
                              History
                            </button>
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
      </section>

      {(modal?.type === "assign" || modal?.type === "reassign") && (
        <Modal
          title={modal.type === "reassign" ? "Reassign screener" : "Assign screener"}
          onClose={() => setModal(null)}
        >
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-gray-600">
              {modal.application.name} — {modal.application.position}
              {modal.application.department
                ? ` (${modal.application.department})`
                : ""}
            </p>

            <Field label="L0 Screener">
              <select
                required
                value={form.screenerId}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, screenerId: event.target.value }))
                }
                className={inputClass}
              >
                <option value="">Select a screener</option>
                {activeScreeners.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} — {item.workload.open} open
                    {item.department ? ` (${item.department})` : ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={modal.type === "reassign" ? "Reason (required)" : "Note"}>
              <textarea
                rows={2}
                required={modal.type === "reassign"}
                value={form.reason}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, reason: event.target.value }))
                }
                className={inputClass}
              />
            </Field>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className={secondaryButton}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className={primaryButton}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.type === "history" && (
        <Modal title="Assignment history" onClose={() => setModal(null)}>
          <DataState
            loading={history.loading}
            error={history.error}
            onRetry={history.reload}
          >
            {(history.data?.history || []).length === 0 ? (
              <EmptyState text="No assignment history yet." />
            ) : (
              <ol className="space-y-3">
                {history.data.history.map((entry, index) => (
                  <li
                    key={index}
                    className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
                  >
                    <p className="font-semibold">
                      {entry.action === "REASSIGNED" ? "Reassigned to" : "Assigned to"}{" "}
                      {entry.screenerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(entry.at)} by{" "}
                      {entry.performedByName || entry.performedByType}
                    </p>
                    {entry.remarks && (
                      <p className="mt-1 text-gray-600">{entry.remarks}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </DataState>
        </Modal>
      )}
    </div>
  );
}
