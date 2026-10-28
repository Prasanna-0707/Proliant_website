import { useState } from "react";

export default function InterviewEvaluation() {
  const [form, setForm] = useState({
    technicalSkills: "",
    communication: "",
    problemSolving: "",
    rating: "3",
    comments: "",
    recommendation: "Pending",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // API submission will be added after confirming the backend contract.
    console.log("Evaluation draft:", form);
    alert("Evaluation form validated locally. API submission is not connected yet.");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Interview Evaluation</h1>
      <p className="mt-2">Enter your feedback for the candidate.</p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
        <div>
          <label htmlFor="technicalSkills" className="block font-medium">
            Technical Skills
          </label>
          <textarea
            id="technicalSkills"
            name="technicalSkills"
            value={form.technicalSkills}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border p-2"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="communication" className="block font-medium">
            Communication
          </label>
          <textarea
            id="communication"
            name="communication"
            value={form.communication}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border p-2"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="problemSolving" className="block font-medium">
            Problem Solving
          </label>
          <textarea
            id="problemSolving"
            name="problemSolving"
            value={form.problemSolving}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border p-2"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="rating" className="block font-medium">
            Overall Rating
          </label>
          <select
            id="rating"
            name="rating"
            value={form.rating}
            onChange={handleChange}
            className="mt-1 w-full rounded border p-2"
          >
            <option value="1">1 - Poor</option>
            <option value="2">2 - Below expectations</option>
            <option value="3">3 - Meets expectations</option>
            <option value="4">4 - Very good</option>
            <option value="5">5 - Excellent</option>
          </select>
        </div>

        <div>
          <label htmlFor="comments" className="block font-medium">
            Comments
          </label>
          <textarea
            id="comments"
            name="comments"
            value={form.comments}
            onChange={handleChange}
            className="mt-1 w-full rounded border p-2"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="recommendation" className="block font-medium">
            Recommendation
          </label>
          <select
            id="recommendation"
            name="recommendation"
            value={form.recommendation}
            onChange={handleChange}
            className="mt-1 w-full rounded border p-2"
          >
            <option value="Pending">Pending</option>
            <option value="Strong Hire">Strong Hire</option>
            <option value="Hire">Hire</option>
            <option value="Hold">Hold</option>
            <option value="Reject">Reject</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded bg-red-600 px-5 py-2 text-white"
        >
          Submit Evaluation
        </button>
      </form>
    </div>
  );
}