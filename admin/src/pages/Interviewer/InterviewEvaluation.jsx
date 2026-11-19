import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import DataState from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import {
  getEvaluationForm,
  getInterview,
  submitEvaluation,
  updateEvaluation,
} from "../../services/interviews.js";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500";

// POST /api/interviews/:id/evaluation   (first submission)
// PATCH /api/interviews/:id/evaluation  (correction of a submitted one)
//
// When HR has published an evaluation form for this job and stage, its
// questions are shown; otherwise the interviewer gives free-form feedback.
export default function InterviewEvaluation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const loaded = useApi(async (signal) => {
    const { interview } = await getInterview(id, signal);

    let form = null;

    try {
      form = (
        await getEvaluationForm(
          interview.stageCode,
          { jobId: interview.job?._id },
          signal
        )
      ).form;
    } catch (error) {
      // 404 simply means no published form exists yet.
      if (error.status !== 404) throw error;
    }

    return { interview, form };
  }, [id]);

  const [state, setState] = useState({});
  const [submit, setSubmit] = useState({ busy: false, error: "" });

  const interview = loaded.data?.interview;
  const form = loaded.data?.form;
  const alreadySubmitted = interview?.evaluation?.status === "Submitted";

  const field = (name, fallback = "") =>
    state[name] ?? interview?.evaluation?.[name] ?? fallback;

  const answerFor = (code) =>
    state.answers?.[code] ??
    interview?.evaluation?.criteria?.find((item) => item.questionCode === code) ??
    {};

  const setAnswer = (code, patch) =>
    setState((previous) => ({
      ...previous,
      answers: {
        ...previous.answers,
        [code]: { ...answerFor(code), ...patch },
      },
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmit({ busy: true, error: "" });

    const criteria = (form?.questions || []).map((question) => {
      const answer = answerFor(question.questionCode);

      return {
        questionCode: question.questionCode,
        rating: answer.rating ? Number(answer.rating) : undefined,
        answer: answer.answer || "",
        comments: answer.comments || "",
      };
    });

    const body = {
      overallRating: Number(field("overallRating", 3)),
      strengths: field("strengths"),
      concerns: field("concerns"),
      feedback: field("feedback"),
      recommendation: field("recommendation", "Advance"),
      criteria,
    };

    try {
      if (alreadySubmitted) {
        await updateEvaluation(id, {
          ...body,
          correctionReason: field("correctionReason", "Evaluation updated"),
        });
      } else {
        await submitEvaluation(id, body);
      }

      navigate(`/interviewer/interview/${id}`);
    } catch (error) {
      setSubmit({ busy: false, error: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <Link to={`/interviewer/interview/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-500">
        <ArrowLeft size={16} /> Back to interview
      </Link>

      <DataState loading={loaded.loading} error={loaded.error} onRetry={loaded.reload}>
        {interview && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interview Evaluation</h1>
              <p className="mt-1 text-sm text-gray-500">
                {interview.application?.name} · {interview.stageName} · {interview.job?.title}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {form?.questions?.length > 0 && (
                <fieldset className="space-y-5">
                  <legend className="font-semibold text-gray-900">{form.formName}</legend>

                  {form.questions.map((question) => {
                    const answer = answerFor(question.questionCode);
                    const needsRating = ["RATING", "RATING_AND_TEXT"].includes(question.responseType);
                    const needsText = ["TEXT", "RATING_AND_TEXT"].includes(question.responseType);

                    return (
                      <div key={question.questionCode} className="rounded-lg border border-gray-100 p-4">
                        <p className="text-sm font-medium text-gray-900">
                          {question.questionText}
                          {question.isRequired && <span className="text-red-500"> *</span>}
                        </p>
                        {question.helpText && <p className="mt-1 text-xs text-gray-500">{question.helpText}</p>}

                        {needsRating && (
                          <select
                            aria-label={`Rating for ${question.questionCode}`}
                            value={answer.rating || ""}
                            onChange={(event) => setAnswer(question.questionCode, { rating: event.target.value })}
                            className={inputClass}
                          >
                            <option value="">Select rating</option>
                            {[1, 2, 3, 4, 5].map((value) => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                        )}

                        {needsText && (
                          <textarea
                            aria-label={`Answer for ${question.questionCode}`}
                            rows={2}
                            value={answer.answer || ""}
                            onChange={(event) => setAnswer(question.questionCode, { answer: event.target.value })}
                            className={inputClass}
                          />
                        )}

                        {question.responseType === "YES_NO" && (
                          <select
                            aria-label={`Answer for ${question.questionCode}`}
                            value={answer.answer || ""}
                            onChange={(event) => setAnswer(question.questionCode, { answer: event.target.value })}
                            className={inputClass}
                          >
                            <option value="">Select</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                </fieldset>
              )}

              <div>
                <label htmlFor="overallRating" className="block text-sm font-medium">Overall Rating</label>
                <select
                  id="overallRating"
                  value={field("overallRating", 3)}
                  onChange={(event) => setState({ ...state, overallRating: event.target.value })}
                  className={inputClass}
                >
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Below expectations</option>
                  <option value="3">3 - Meets expectations</option>
                  <option value="4">4 - Very good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>

              {["strengths", "concerns", "feedback"].map((name) => (
                <div key={name}>
                  <label htmlFor={name} className="block text-sm font-medium capitalize">{name}</label>
                  <textarea
                    id={name}
                    rows={3}
                    value={field(name)}
                    onChange={(event) => setState({ ...state, [name]: event.target.value })}
                    className={inputClass}
                  />
                </div>
              ))}

              <div>
                <label htmlFor="recommendation" className="block text-sm font-medium">Recommendation</label>
                <select
                  id="recommendation"
                  value={field("recommendation", "Advance")}
                  onChange={(event) => setState({ ...state, recommendation: event.target.value })}
                  className={inputClass}
                >
                  <option>Advance</option>
                  <option>Hold</option>
                  <option>Reject</option>
                </select>
              </div>

              {alreadySubmitted && (
                <div>
                  <label htmlFor="correctionReason" className="block text-sm font-medium">Reason for correction</label>
                  <input
                    id="correctionReason"
                    required
                    value={field("correctionReason")}
                    onChange={(event) => setState({ ...state, correctionReason: event.target.value })}
                    className={inputClass}
                  />
                </div>
              )}

              {submit.error && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submit.error}
                </p>
              )}

              <button
                type="submit"
                disabled={submit.busy}
                className="rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {submit.busy ? "Saving..." : alreadySubmitted ? "Update Evaluation" : "Submit Evaluation"}
              </button>
            </form>
          </>
        )}
      </DataState>
    </div>
  );
}
