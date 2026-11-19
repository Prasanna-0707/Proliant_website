import { useState } from "react";
import { CalendarDays, Plus, X } from "lucide-react";

import InterviewStats from "../../components/Interview/InterviewStats";
import InterviewTable from "../../components/Interview/InterviewTable";
import CandidateInterviewDetails from "../../components/Interview/CandidateInterviewDetails";
import InterviewEvaluationForm from "../../components/Interview/InterviewEvaluationForm";
import InterviewHistory from "../../components/Interview/InterviewHistory";

import { initialL1Interviews } from "../../data/interviewData";

const L1Interview = () => {
  const [interviews, setInterviews] = useState(initialL1Interviews);
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
                `L1 interview scheduled with ${scheduleForm.interviewer} on ${scheduleForm.interviewDate} at ${scheduleForm.interviewTime}`,
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
                `L1 interview completed. Decision: ${updatedCandidate.decision}`,
              ],
            }
          : item
      )
    );

    setShowEvaluation(false);
    setSelectedCandidate(null);
  };

  const openEvaluation = (candidate) => {
    setSelectedCandidate(candidate);
    setShowEvaluation(true);
  };

  const openDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetails(true);
  };

  const openHistory = (candidate) => {
    setSelectedCandidate(candidate);
    setShowHistory(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            L1 Interview Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage first-round interviews, interviewer assignments and candidate evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
          <CalendarDays size={18} />
          First Interview Round
        </div>
      </div>

      <InterviewStats interviews={interviews} />

      <InterviewTable
        interviews={interviews}
        onView={openDetails}
        onSchedule={openSchedule}
        onFeedback={openEvaluation}
        onHistory={openHistory}
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
                  Schedule L1 Interview
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

export default L1Interview;