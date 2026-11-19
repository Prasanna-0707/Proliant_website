import { useState } from "react";

export default function CandidateReview() {
  const [candidate, setCandidate] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Candidate Review</h1>
      <p className="mt-2">
        Review candidate skills, experience, and application details.
      </p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Candidate Information</h2>
        <p>Candidate details will appear here once connected to the API.</p>
      </section>

      <section className="mt-4">
        <h2 className="text-lg font-semibold">Skills and Experience</h2>
        <p>Candidate skills and experience will appear here.</p>
      </section>

      <section className="mt-4">
        <h2 className="text-lg font-semibold">Resume</h2>
        <p>Resume preview will appear here.</p>
      </section>
    </div>
  );
}