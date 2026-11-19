import { useEffect, useState } from "react";

import Modal, {
  Field,
  inputClass,
  primaryButton,
  secondaryButton,
} from "../common/Modal";
import {
  listEligibleInterviewers,
  scheduleInterview,
  rescheduleInterview,
  reassignInterviewer,
} from "../../services/interviews.js";

const toLocalInput = (value) => {
  if (!value) return "";

  const date = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// mode: "schedule" | "reschedule" | "reassign"
// application: { _id, name, position }   interview: existing interview (reschedule / reassign)
export default function ScheduleInterviewModal({
  mode = "schedule",
  application,
  stageCode,
  interview,
  onClose,
  onDone,
}) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const stage = stageCode || interview?.stageCode;

  const [interviewers, setInterviewers] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    interviewerId: interview?.assignedTo?._id || "",
    scheduledAt: toLocalInput(interview?.scheduledAt),
    durationMinutes: interview?.durationMinutes || 60,
    interviewMode: interview?.mode || "Online",
    meetingLink: interview?.meetingLink || "",
    location: interview?.location || "",
    instructions: interview?.instructions || "",
    reason: "",
  });

  useEffect(() => {
    let active = true;

    listEligibleInterviewers(stage)
      .then((data) => {
        if (active) setInterviewers(data.interviewers || []);
      })
      .catch((requestError) => {
        if (active) setLoadError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, [stage]);

  const set = (key) => (event) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      let result;

      if (mode === "reassign") {
        result = await reassignInterviewer(interview._id, {
          interviewerId: form.interviewerId,
          reason: form.reason,
        });
      } else {
        const body = {
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          timeZone,
          durationMinutes: Number(form.durationMinutes),
          mode: form.interviewMode,
          meetingLink: form.meetingLink,
          location: form.location,
          instructions: form.instructions,
        };

        result =
          mode === "reschedule"
            ? await rescheduleInterview(interview._id, {
                ...body,
                interviewerId: form.interviewerId,
                reason: form.reason,
              })
            : await scheduleInterview({
                ...body,
                applicationId: application._id,
                stageCode: stage,
                interviewerId: form.interviewerId,
              });
      }

      onDone(result);
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  };

  const titles = {
    schedule: `Schedule ${stage} interview`,
    reschedule: `Reschedule ${stage} interview`,
    reassign: `Reassign interviewer`,
  };

  const candidateName = application?.name || interview?.application?.name;

  return (
    <Modal title={titles[mode]} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {candidateName && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Candidate: <strong>{candidateName}</strong>
            {(application?.position || interview?.job?.title) &&
              ` — ${application?.position || interview?.job?.title}`}
          </p>
        )}

        {loadError && <p className="text-sm text-red-600">{loadError}</p>}

        <Field label="Interviewer">
          <select
            required
            value={form.interviewerId}
            onChange={set("interviewerId")}
            className={inputClass}
          >
            <option value="">Select an interviewer</option>
            {interviewers.map((person) => (
              <option key={person._id} value={person._id}>
                {person.name}
                {person.department ? ` (${person.department})` : ""}
              </option>
            ))}
          </select>
        </Field>

        {mode !== "reassign" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date and time" hint={`Time zone: ${timeZone}`}>
                <input
                  required
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={set("scheduledAt")}
                  className={inputClass}
                />
              </Field>

              <Field label="Duration (minutes)">
                <input
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={form.durationMinutes}
                  onChange={set("durationMinutes")}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Mode">
              <select
                value={form.interviewMode}
                onChange={set("interviewMode")}
                className={inputClass}
              >
                <option>Online</option>
                <option>In Person</option>
                <option>Phone</option>
              </select>
            </Field>

            {form.interviewMode === "Online" && (
              <Field label="Meeting link">
                <input
                  type="url"
                  placeholder="https://"
                  value={form.meetingLink}
                  onChange={set("meetingLink")}
                  className={inputClass}
                />
              </Field>
            )}

            {form.interviewMode === "In Person" && (
              <Field label="Location">
                <input
                  value={form.location}
                  onChange={set("location")}
                  className={inputClass}
                />
              </Field>
            )}

            <Field label="Instructions for the interviewer and candidate">
              <textarea
                rows={3}
                maxLength={3000}
                value={form.instructions}
                onChange={set("instructions")}
                className={inputClass}
              />
            </Field>
          </>
        )}

        {mode !== "schedule" && (
          <Field label={mode === "reschedule" ? "Reason (required)" : "Reason"}>
            <textarea
              rows={2}
              required={mode === "reschedule"}
              value={form.reason}
              onChange={set("reason")}
              className={inputClass}
            />
          </Field>
        )}

        <p className="text-xs text-gray-500">
          The interviewer and the candidate are notified by email.
        </p>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={primaryButton}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
