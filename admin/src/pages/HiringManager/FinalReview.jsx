import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import {
  getApplicationFeedback,
  getHiringApplication,
  getHiringPipeline,
  listDecisions,
  submitHiringDecision,
} from "../../services/hiring.js";
import { formatDateTime } from "../../services/format.js";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500";

// Candidate picker (when no ?application= is given)
function CandidatePicker() {
  const { data, loading, error, reload } = useApi(
    (signal) => getHiringPipeline(undefined, signal),
    []
  );

  const candidates = (data?.jobs || []).flatMap((job) =>
    job.stages.flatMap((stage) =>
      stage.candidates.map((candidate) => ({ ...candidate, jobTitle: job.jobTitle, stageName: stage.stageName }))
    )
  );

  return (
    <DataState loading={loading} error={error} onRetry={reload}>
      {candidates.length === 0 ? (
        <EmptyState text="There are no candidates to review." />
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {candidates.map((candidate) => (
            <li key={candidate._id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-gray-900">{candidate.name}</p>
                <p className="text-xs text-gray-500">{candidate.jobTitle} · {candidate.stageName}</p>
              </div>
              <Link
                to={`/hiring-manager/final-review?application=${candidate._id}`}
                className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500 hover:text-white"
              >
                Review
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DataState>
  );
}

// GET /api/applications/:id, /:id/feedback, /:id/decisions
// POST /api/applications/:id/decisions
function Review({ applicationId }) {
  const loaded = useApi(
    async (signal) => {
      const [application, feedback, decisions] = await Promise.all([
        getHiringApplication(applicationId, signal),
        getApplicationFeedback(applicationId, signal),
        listDecisions(applicationId, signal),
      ]);

      return { application, feedback, decisions };
    },
    [applicationId]
  );

  const [form, setForm] = useState({ stageCode: "", decision: "Advance", reason: "" });
  const [submit, setSubmit] = useState({ busy: false, error: "", done: false });

  const application = loaded.data?.application?.application;
  const job = loaded.data?.application?.job;
  const feedback = loaded.data?.feedback?.feedback || [];
  const decisions = loaded.data?.decisions?.decisions || [];

  const stages = (job?.interviewWorkflow || []).filter((stage) => stage.isEnabled);
  const stageCode = form.stageCode || stages.find((stage) => stage.stageType === "INTERVIEW")?.stageCode || stages[0]?.stageCode || "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmit({ busy: true, error: "", done: false });

    try {
      await submitHiringDecision(applicationId, {
        stageCode,
        decision: form.decision,
        reason: form.reason,
      });

      setForm({ ...form, reason: "" });
      setSubmit({ busy: false, error: "", done: true });
      loaded.reload();
    } catch (error) {
      setSubmit({ busy: false, error: error.message, done: false });
    }
  };

  return (
    <DataState loading={loaded.loading} error={loaded.error} onRetry={loaded.reload}>
      {application && (
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">{application.name}</h2>
            <p className="text-sm text-gray-500">{job?.title} · {job?.department}</p>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
              {[
                ["Email", application.email],
                ["Phone", application.phone],
                ["Qualification", application.highestQualification],
                ["Notice period", application.noticePeriod],
                ["Current company", application.currentCompany],
                ["Status", application.status],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase text-gray-500">{label}</dt>
                  <dd className="mt-1 text-gray-900">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Interviewer Feedback</h2>
            {feedback.length === 0 ? (
              <p className="text-sm text-gray-500">No feedback has been submitted yet.</p>
            ) : (
              <ul className="space-y-4">
                {feedback.map((item) => (
                  <li key={item.interviewId} className="rounded-lg border border-gray-100 p-4 text-sm">
                    <p className="font-medium text-gray-900">
                      {item.stageName} · {item.interviewer?.name}
                    </p>
                    <p className="mt-1 text-gray-600">
                      {item.evaluation?.recommendation} · rating {item.evaluation?.overallRating ?? "—"}/5
                    </p>
                    {item.evaluation?.feedback && <p className="mt-2 text-gray-700">{item.evaluation.feedback}</p>}
                    {item.evaluation?.strengths && <p className="mt-1 text-xs text-gray-500">Strengths: {item.evaluation.strengths}</p>}
                    {item.evaluation?.concerns && <p className="mt-1 text-xs text-gray-500">Concerns: {item.evaluation.concerns}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Record a Decision</h2>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
              <div>
                <label htmlFor="decision-stage" className="block text-sm font-medium">Stage</label>
                <select
                  id="decision-stage"
                  value={stageCode}
                  onChange={(event) => setForm({ ...form, stageCode: event.target.value })}
                  className={inputClass}
                >
                  {stages.map((stage) => (
                    <option key={stage.stageCode} value={stage.stageCode}>{stage.stageName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="decision-value" className="block text-sm font-medium">Decision</label>
                <select
                  id="decision-value"
                  value={form.decision}
                  onChange={(event) => setForm({ ...form, decision: event.target.value })}
                  className={inputClass}
                >
                  <option>Advance</option>
                  <option>Hold</option>
                  <option>Reject</option>
                  <option value="Select">Select (complete hiring)</option>
                </select>
              </div>

              <div>
                <label htmlFor="decision-reason" className="block text-sm font-medium">
                  Reason {form.decision !== "Advance" && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  id="decision-reason"
                  rows={3}
                  required={form.decision !== "Advance"}
                  value={form.reason}
                  onChange={(event) => setForm({ ...form, reason: event.target.value })}
                  className={inputClass}
                />
              </div>

              {submit.error && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submit.error}</p>
              )}
              {submit.done && (
                <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Decision recorded.
                </p>
              )}

              <button
                type="submit"
                disabled={submit.busy || !stageCode}
                className="rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {submit.busy ? "Saving..." : "Record Decision"}
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Decision History</h2>
            {decisions.length === 0 ? (
              <p className="text-sm text-gray-500">No decisions have been recorded yet.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {decisions.map((item) => (
                  <li key={item._id} className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 last:border-0">
                    <span>
                      <span className="font-medium">{item.decision}</span> · {item.stageName}
                      {item.reason && <span className="text-gray-500"> — {item.reason}</span>}
                    </span>
                    <span className="text-xs text-gray-400">
                      {item.decidedBy?.name} · {formatDateTime(item.decidedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </DataState>
  );
}

export default function FinalReview() {
  const [params] = useSearchParams();
  const applicationId = params.get("application");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Final Review</h1>
        <p className="mt-1 text-sm text-gray-500">Review interview feedback and record your hiring decision.</p>
      </div>

      {applicationId ? <Review applicationId={applicationId} /> : <CandidatePicker />}
    </div>
  );
}
