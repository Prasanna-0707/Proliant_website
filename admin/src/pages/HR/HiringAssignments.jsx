import { useMemo, useState } from "react";
import { UserCog } from "lucide-react";

import useApi from "../../services/useApi.js";
import {
  listAssignments,
  listHiringManagers,
  listJobsWithManagers,
  createAssignment,
  reassignAssignment,
  revokeAssignment,
} from "../../services/hiringAssignments.js";

import DataState, { EmptyState } from "../../components/StateMessage";
import Modal, {
  Field,
  inputClass,
  primaryButton,
  secondaryButton,
} from "../../components/common/Modal";

// HR / Global Administrator: view, assign, reassign and revoke Hiring
// Managers for jobs. Uses the same records as the HR Jobs form.
export default function HiringAssignments() {
  const jobs = useApi((signal) => listJobsWithManagers(signal), []);
  const assignments = useApi(
    (signal) => listAssignments({ status: "Active" }, signal),
    []
  );
  const managers = useApi((signal) => listHiringManagers(signal), []);

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [managerId, setManagerId] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const managerList = managers.data?.managers || [];

  const rows = useMemo(() => {
    const byJob = new Map();

    for (const item of assignments.data?.assignments || []) {
      const key = item.job?._id;
      if (!key) continue;
      if (!byJob.has(key)) byJob.set(key, []);
      byJob.get(key).push(item);
    }

    const needle = search.trim().toLowerCase();

    return (jobs.data?.jobs || [])
      .filter(
        (job) =>
          !needle ||
          [job.title, job.department]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(needle))
      )
      .map((job) => ({ job, assignments: byJob.get(job._id) || [] }));
  }, [jobs.data, assignments.data, search]);

  const refresh = () => {
    jobs.reload();
    assignments.reload();
  };

  const close = () => {
    setModal(null);
    setManagerId("");
    setReason("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      let result;

      if (modal.type === "assign") {
        result = await createAssignment({
          jobId: modal.job._id,
          hiringManagerId: managerId,
        });
      } else if (modal.type === "reassign") {
        result = await reassignAssignment(modal.assignment._id, {
          hiringManagerId: managerId,
          reason,
        });
      } else {
        result = await revokeAssignment(modal.assignment._id, reason);
      }

      setMessage({ type: "success", text: result.message });
      close();
      refresh();
    } catch (requestError) {
      setMessage({ type: "error", text: requestError.message });
    } finally {
      setSaving(false);
    }
  };

  const titles = {
    assign: "Assign Hiring Manager",
    reassign: "Reassign Hiring Manager",
    revoke: "Remove Hiring Manager",
  };

  const takenIds = new Set(
    (modal?.job
      ? rows.find((row) => row.job._id === modal.job._id)?.assignments || []
      : []
    ).map((item) => item.hiringManager?._id)
  );

  const loading = jobs.loading || assignments.loading;
  const error = jobs.error || assignments.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <UserCog size={24} className="text-red-500" />
          Hiring Manager Assignments
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Hiring Managers can only see and decide on applications for jobs
          assigned to them. Changes here also appear in the HR Jobs form.
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

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by job or department"
            className={`${inputClass} sm:w-72`}
          />
        </div>

        <DataState
          loading={loading}
          error={error}
          onRetry={() => {
            refresh();
            managers.reload();
          }}
        >
          {rows.length === 0 ? (
            <EmptyState text="No jobs found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
                  <tr>
                    {["Job", "Department", "Status", "Hiring Managers", "Actions"].map(
                      (heading) => (
                        <th key={heading} className="px-4 py-3 font-semibold">
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map(({ job, assignments: active }) => (
                    <tr key={job._id}>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {job.title}
                      </td>
                      <td className="px-4 py-3">{job.department}</td>
                      <td className="px-4 py-3">{job.status}</td>
                      <td className="px-4 py-3">
                        {active.length === 0 ? (
                          <span className="text-amber-600">Not assigned</span>
                        ) : (
                          <ul className="space-y-1">
                            {active.map((item) => (
                              <li key={item._id} className="flex flex-wrap items-center gap-2">
                                <span>{item.hiringManager?.name}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setModal({ type: "reassign", job, assignment: item })
                                  }
                                  className="text-xs font-medium text-blue-600 hover:underline"
                                >
                                  Reassign
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setModal({ type: "revoke", job, assignment: item })
                                  }
                                  className="text-xs font-medium text-red-600 hover:underline"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setModal({ type: "assign", job })}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Assign manager
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataState>
      </div>

      {modal && (
        <Modal title={titles[modal.type]} onClose={close}>
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-gray-600">
              Job: <strong>{modal.job.title}</strong>
            </p>

            {modal.type === "revoke" ? (
              <p className="text-sm text-gray-600">
                Remove <strong>{modal.assignment.hiringManager?.name}</strong>{" "}
                from this job? They will lose access to its applications. The
                assignment stays in the history.
              </p>
            ) : (
              <Field label="Hiring Manager">
                <select
                  required
                  value={managerId}
                  onChange={(event) => setManagerId(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a Hiring Manager</option>
                  {managerList
                    .filter((item) => !takenIds.has(item._id))
                    .map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                        {item.department ? ` (${item.department})` : ""}
                      </option>
                    ))}
                </select>
              </Field>
            )}

            {modal.type !== "assign" && (
              <Field label="Reason">
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className={inputClass}
                />
              </Field>
            )}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={close} className={secondaryButton}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className={primaryButton}>
                {saving ? "Saving..." : modal.type === "revoke" ? "Remove" : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
