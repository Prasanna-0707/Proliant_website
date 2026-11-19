import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Video } from "lucide-react";

import DataState from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { getInterview } from "../../services/interviews.js";
import { formatDateTime } from "../../services/format.js";

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-900">{value || "—"}</p>
  </div>
);

// GET /api/interviews/:id
export default function InterviewDetails() {
  const { id } = useParams();

  const { data, loading, error, reload } = useApi(
    (signal) => getInterview(id, signal),
    [id]
  );

  const interview = data?.interview;
  const submitted = interview?.evaluation?.status === "Submitted";

  return (
    <div className="space-y-6">
      <Link to="/interviewer/my-interviews" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-500">
        <ArrowLeft size={16} /> Back to my interviews
      </Link>

      <DataState loading={loading} error={error} onRetry={reload}>
        {interview && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interview Details</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {interview.stageName} · {interview.job?.title}
                </p>
              </div>

              <Link
                to={`/interviewer/evaluation/${interview._id}`}
                className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                {submitted ? "Update Evaluation" : "Evaluate Interview"}
              </Link>
            </div>

            <section className="grid gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-2">
              <div className="space-y-4">
                <h2 className="font-semibold text-gray-900">Candidate</h2>
                <Field label="Name" value={interview.application?.name} />
                <div className="flex flex-wrap gap-5 text-sm text-gray-700">
                  <span className="flex items-center gap-2"><Mail size={15} className="text-gray-400" />{interview.application?.email}</span>
                  <span className="flex items-center gap-2"><Phone size={15} className="text-gray-400" />{interview.application?.phone}</span>
                </div>
                <Field label="Applied for" value={interview.application?.position} />
              </div>

              <div className="space-y-4">
                <h2 className="font-semibold text-gray-900">Job</h2>
                <Field label="Title" value={interview.job?.title} />
                <Field label="Department" value={interview.job?.department} />
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin size={15} className="text-gray-400" />
                  {interview.job?.location}
                </p>
              </div>
            </section>

            <section className="grid gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-3">
              <Field label="Scheduled" value={formatDateTime(interview.scheduledAt)} />
              <Field label="Duration" value={`${interview.durationMinutes} minutes`} />
              <Field label="Time zone" value={interview.timeZone} />
              <Field label="Mode" value={interview.mode} />
              <Field label="Status" value={interview.status} />
              <Field label="Evaluation" value={interview.evaluation?.status || "Not started"} />

              {interview.meetingLink && (
                <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-red-500 hover:underline">
                  <Video size={16} /> Join meeting
                </a>
              )}
              {interview.location && <Field label="Location" value={interview.location} />}
              {interview.instructions && (
                <div className="md:col-span-3">
                  <Field label="Instructions" value={interview.instructions} />
                </div>
              )}
            </section>
          </>
        )}
      </DataState>
    </div>
  );
}
