import { useState } from "react";
import { CalendarDays, X } from "lucide-react";

import InterviewStats from "../../components/Interview/InterviewStats";
import InterviewTable from "../../components/Interview/InterviewTable";
import CandidateInterviewDetails from "../../components/Interview/CandidateInterviewDetails";
import InterviewEvaluationForm from "../../components/Interview/InterviewEvaluationForm";
import InterviewHistory from "../../components/Interview/InterviewHistory";

import { initialL2Interviews } from "../../data/interviewData";

const L2Interview = () => {
  const [interviews, setInterviews] = useState(initialL2Interviews);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    interviewer: "",
    interviewDate: "",
    interviewTime: "",
  });

  const openSchedule = (candidate) => {
    setSelectedCandidate(candidate);

    setScheduleForm({
      interviewer: candidate.interviewer || "",
      interviewDate: candidate.interviewDate || "",
      interviewTime: candidate.interviewTime || "",
    });

    setShowSchedule(true);
  };

  const saveSchedule = (e) => {
    e.preventDefault();

    if (!scheduleForm.interviewer.trim()) {
      window.alert("Please enter interviewer name.");
      return;
    }

    setInterviews((previous) =>
      previous.map((item) =>
        item.id === selectedCandidate.id
          ? {
              ...item,
              ...scheduleForm,
              status: "Scheduled",
              history: [
                ...item.history,
                `L2 interview scheduled with ${scheduleForm.interviewer} on ${scheduleForm.interviewDate} at ${scheduleForm.interviewTime}`,
              ],
            }
          : item
      )
    );

    setShowSchedule(false);
    setSelectedCandidate(null);
  };

  const saveEvaluation = (updatedCandidate) => {
    setInterviews((previous) =>
      previous.map((item) =>
        item.id === updatedCandidate.id
          ? {
              ...updatedCandidate,
              history: [
                ...item.history,
                `L2 interview completed. Decision: ${updatedCandidate.decision}`,
              ],
            }
          : item
      )
    );

    setShowEvaluation(false);
    setSelectedCandidate(null);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            L2 Interview Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage second-round interviews, advanced evaluations and final interview decisions.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-600">
          <CalendarDays size={18} />
          Second Interview Round
        </div>
      </div>

      <InterviewStats interviews={interviews} />

      <InterviewTable
        interviews={interviews}
        onView={(candidate) => {
          setSelectedCandidate(candidate);
          setShowDetails(true);
        }}
        onSchedule={openSchedule}
        onFeedback={(candidate) => {
          setSelectedCandidate(candidate);
          setShowEvaluation(true);
        }}
        onHistory={(candidate) => {
          setSelectedCandidate(candidate);
          setShowHistory(true);
        }}
      />

      {showDetails && (
        <CandidateInterviewDetails
          candidate={selectedCandidate}
          onClose={() => {
            setShowDetails(false);
            setSelectedCandidate(null);
          }}
        />
      )}

      {showEvaluation && (
        <InterviewEvaluationForm
          candidate={selectedCandidate}
          onClose={() => {
            setShowEvaluation(false);
            setSelectedCandidate(null);
          }}
          onSubmit={saveEvaluation}
        />
      )}

      {showHistory && (
        <InterviewHistory
          candidate={selectedCandidate}
          onClose={() => {
            setShowHistory(false);
            setSelectedCandidate(null);
          }}
        />
      )}

      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Schedule L2 Interview
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedCandidate?.candidateName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSchedule(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveSchedule} className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Interviewer Name
                </label>
                <input
                  type="text"
                  value={scheduleForm.interviewer}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      interviewer: e.target.value,
                    })
                  }
                  placeholder="Enter interviewer name"
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Interview Date
                </label>
                <input
                  type="date"
                  value={scheduleForm.interviewDate}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      interviewDate: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Interview Time
                </label>
                <input
                  type="time"
                  value={scheduleForm.interviewTime}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      interviewTime: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-red-400"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowSchedule(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default L2Interview;