import { useParams, Link } from "react-router-dom";

export default function InterviewDetails() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Interview Details</h1>
      <p className="mt-2">Interview ID: {id}</p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Candidate Details</h2>
        <p>Candidate information will appear here.</p>
      </section>

      <section className="mt-4">
        <h2 className="text-lg font-semibold">Job Details</h2>
        <p>Job information will appear here.</p>
      </section>

      <section className="mt-4">
        <h2 className="text-lg font-semibold">Interview Schedule</h2>
        <p>Interview date, time, and status will appear here.</p>
      </section>

      <Link
        to={`/interviewer/interviews/${id}/evaluation`}
        className="mt-6 inline-block rounded bg-red-600 px-4 py-2 text-white"
      >
        Evaluate Interview
      </Link>
    </div>
  );
}