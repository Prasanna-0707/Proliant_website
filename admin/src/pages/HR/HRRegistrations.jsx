import { useMemo, useState } from "react";
import { UserRoundSearch, Download } from "lucide-react";

import useApi from "../../services/useApi.js";
import {
  listRegistrations,
  getRegistration,
  updateRegistration,
  deleteRegistration,
  exportRegistrations,
  confirmJoining,
  correctJoiningDate,
  getJoiningHistory,
  getApplicationDetail,
  getApplicationScreenings,
  downloadApplicationResume,
} from "../../services/registrations.js";
import { formatDate, formatDateTime } from "../../services/format.js";

import DataState, { EmptyState } from "../../components/StateMessage";
import Modal, {
  Field,
  inputClass,
  primaryButton,
  secondaryButton,
} from "../../components/common/Modal";

const NOTICE_PERIODS = ["Immediately", "30 Days", "60 Days", "90 Days"];

const saveBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

// HR / Global Administrator: registration candidates (collection
// "candidates"), application details, resume, joining and history.
export default function HRRegistrations() {
  const registrations = useApi((signal) => listRegistrations({}, signal), []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState({ loading: false, error: "", data: null });
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const list = useMemo(
    () => registrations.data?.candidates || [],
    [registrations.data]
  );

  const statuses = useMemo(
    () => ["All", ...new Set(list.map((item) => item.status).filter(Boolean))],
    [list]
  );

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return list.filter((item) => {
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;

      const matchesSearch =
        !needle ||
        [item.name, item.email, item.position, item.phone]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));

      return matchesStatus && matchesSearch;
    });
  }, [list, search, statusFilter]);

  const flash = (type, text) => setMessage({ type, text });

  const openDetail = async (item) => {
    setModal({ type: "detail", candidate: item });
    setDetail({ loading: true, error: "", data: null });

    try {
      const [registration, application, screenings, joining] =
        await Promise.all([
          getRegistration(item._id),
          getApplicationDetail(item._id).catch(() => null),
          getApplicationScreenings(item._id).catch(() => null),
          getJoiningHistory(item._id).catch(() => null),
        ]);

      setDetail({
        loading: false,
        error: "",
        data: { registration, application, screenings, joining },
      });
    } catch (requestError) {
      setDetail({ loading: false, error: requestError.message, data: null });
    }
  };

  const openEdit = (item) => {
    setForm({
      name: item.name || "",
      phone: item.phone || "",
      location: item.location || "",
      currentCompany: item.currentCompany || "",
      yearsOfExperience: item.yearsOfExperience ?? "",
      noticePeriod: item.noticePeriod || "",
    });
    setModal({ type: "edit", candidate: item });
  };

  const openJoining = (item, correcting) => {
    setForm({ joiningDate: "", reason: "" });
    setModal({ type: correcting ? "correct" : "confirm", candidate: item });
  };

  const run = async (action, successText) => {
    setSaving(true);

    try {
      await action();
      setModal(null);
      flash("success", successText);
      registrations.reload();
    } catch (requestError) {
      flash("error", requestError.message);
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = (event) => {
    event.preventDefault();

    const body = { ...form };

    if (body.yearsOfExperience === "") delete body.yearsOfExperience;
    else body.yearsOfExperience = Number(body.yearsOfExperience);

    if (!body.noticePeriod) delete body.noticePeriod;

    return run(
      () => updateRegistration(modal.candidate._id, body),
      "Candidate updated."
    );
  };

  const submitJoining = (event) => {
    event.preventDefault();

    const call = modal.type === "correct" ? correctJoiningDate : confirmJoining;

    return run(
      () => call(modal.candidate._id, form),
      modal.type === "correct" ? "Joining date corrected." : "Joining confirmed."
    );
  };

  const handleExport = async () => {
    try {
      const blob = await exportRegistrations();
      saveBlob(blob, "registrations.xlsx");
    } catch (requestError) {
      flash("error", requestError.message);
    }
  };

  const handleResume = async () => {
    try {
      const blob = await downloadApplicationResume(modal.candidate._id);
      saveBlob(blob, `${modal.candidate.name}-resume`);
    } catch (requestError) {
      flash("error", requestError.message);
    }
  };

  const setField = (key) => (event) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <UserRoundSearch size={24} className="text-red-500" />
            Registrations
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Candidates who registered through the careers site or the candidate
            portal, with their screening and joining records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className={`${secondaryButton} flex items-center gap-2`}
        >
          <Download size={16} />
          Export Excel
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

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, position or phone"
            className={`${inputClass} sm:w-80`}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={`${inputClass} sm:w-56`}
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>

        <DataState
          loading={registrations.loading}
          error={registrations.error}
          onRetry={registrations.reload}
        >
          {rows.length === 0 ? (
            <EmptyState text="No registrations found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
                  <tr>
                    {["Candidate", "Position", "Department", "Status", "Applied", "Joined", "Actions"].map(
                      (heading) => (
                        <th key={heading} className="px-4 py-3 font-semibold">
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.email}</p>
                      </td>
                      <td className="px-4 py-3">{item.position}</td>
                      <td className="px-4 py-3">{item.department || "—"}</td>
                      <td className="px-4 py-3">{item.status}</td>
                      <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3">
                        {item.joinedAt ? formatDate(item.joinedAt) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-3 text-xs font-medium">
                          <button
                            type="button"
                            onClick={() => openDetail(item)}
                            className="text-gray-700 hover:underline dark:text-gray-200"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openJoining(item, Boolean(item.joinedAt))}
                            className="text-emerald-600 hover:underline"
                          >
                            {item.joinedAt ? "Correct joining" : "Confirm joining"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setModal({ type: "delete", candidate: item })}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataState>
      </div>

      {modal?.type === "detail" && (
        <Modal title={modal.candidate.name} wide onClose={() => setModal(null)}>
          <DataState loading={detail.loading} error={detail.error}>
            {detail.data && (
              <div className="space-y-5 text-sm">
                <dl className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Email", modal.candidate.email],
                    ["Phone", modal.candidate.phone],
                    ["Position", modal.candidate.position],
                    ["Department", modal.candidate.department],
                    ["Location", modal.candidate.location],
                    ["Experience (years)", modal.candidate.yearsOfExperience],
                    ["Qualification", modal.candidate.highestQualification],
                    ["Notice period", modal.candidate.noticePeriod],
                    ["Status", modal.candidate.status],
                    ["Stage", modal.candidate.currentStage],
                    ["Source", modal.candidate.source || "WEBSITE"],
                    ["Joined", modal.candidate.joinedAt ? formatDate(modal.candidate.joinedAt) : "—"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-gray-500">{label}</dt>
                      <dd className="font-medium">{value || "—"}</dd>
                    </div>
                  ))}
                </dl>

                <div className="flex gap-3">
                  <button type="button" onClick={handleResume} className={secondaryButton}>
                    Download resume
                  </button>
                </div>

                <section>
                  <h3 className="mb-2 font-semibold">Screening</h3>
                  {detail.data.screenings?.screenings?.length ? (
                    <ul className="space-y-2">
                      {detail.data.screenings.screenings.map((entry) => (
                        <li
                          key={entry._id}
                          className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                        >
                          <p className="font-medium">
                            {entry.level} — {entry.status}
                            {entry.decision ? ` (${entry.decision})` : ""}
                          </p>
                          {entry.feedback && (
                            <p className="text-gray-600">{entry.feedback}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No screening records.</p>
                  )}
                </section>

                <section>
                  <h3 className="mb-2 font-semibold">Joining history</h3>
                  {detail.data.joining?.history?.length ? (
                    <ul className="space-y-2">
                      {detail.data.joining.history.map((entry, index) => (
                        <li
                          key={index}
                          className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                        >
                          <p className="font-medium">
                            {entry.action || entry.type || "Joining update"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {entry.joiningDate || ""}
                            {entry.previousJoiningDate
                              ? ` (was ${entry.previousJoiningDate})`
                              : ""}
                            {entry.createdAt ? ` · ${formatDateTime(entry.createdAt)}` : ""}
                          </p>
                          {entry.reason && (
                            <p className="text-gray-600">{entry.reason}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No joining events.</p>
                  )}
                </section>
              </div>
            )}
          </DataState>
        </Modal>
      )}

      {modal?.type === "edit" && (
        <Modal title="Edit candidate" onClose={() => setModal(null)}>
          <form onSubmit={submitEdit} className="space-y-4">
            {[
              ["name", "Name"],
              ["phone", "Phone"],
              ["location", "Location"],
              ["currentCompany", "Current company"],
            ].map(([key, label]) => (
              <Field key={key} label={label}>
                <input value={form[key]} onChange={setField(key)} className={inputClass} />
              </Field>
            ))}

            <Field label="Years of experience">
              <input
                type="number"
                min="0"
                value={form.yearsOfExperience}
                onChange={setField("yearsOfExperience")}
                className={inputClass}
              />
            </Field>

            <Field label="Notice period">
              <select
                value={form.noticePeriod}
                onChange={setField("noticePeriod")}
                className={inputClass}
              >
                <option value="">—</option>
                {NOTICE_PERIODS.map((period) => (
                  <option key={period}>{period}</option>
                ))}
              </select>
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

      {(modal?.type === "confirm" || modal?.type === "correct") && (
        <Modal
          title={modal.type === "correct" ? "Correct joining date" : "Confirm joining"}
          onClose={() => setModal(null)}
        >
          <form onSubmit={submitJoining} className="space-y-4">
            <p className="text-sm text-gray-600">{modal.candidate.name}</p>

            <Field label="Joining date">
              <input
                required
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={form.joiningDate}
                onChange={setField("joiningDate")}
                className={inputClass}
              />
            </Field>

            <Field label={modal.type === "correct" ? "Reason (required)" : "Reason"}>
              <textarea
                rows={2}
                required={modal.type === "correct"}
                value={form.reason}
                onChange={setField("reason")}
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

      {modal?.type === "delete" && (
        <Modal title="Delete candidate" onClose={() => setModal(null)}>
          <p className="text-sm text-gray-600">
            Permanently delete <strong>{modal.candidate.name}</strong>? This
            cannot be undone.
          </p>

          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={() => setModal(null)} className={secondaryButton}>
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                run(() => deleteRegistration(modal.candidate._id), "Candidate deleted.")
              }
              className={primaryButton}
            >
              {saving ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
