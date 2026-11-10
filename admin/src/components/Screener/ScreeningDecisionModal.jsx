import { useState } from "react";
import { X } from "lucide-react";

const ScreeningDecisionModal = ({
  application,
  onClose,
  onSubmit,
}) => {
  const [decision, setDecision] = useState("");
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  if (!application) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!decision) {
      window.alert("Please select a screening decision.");
      return;
    }

    if (!remarks.trim()) {
      window.alert("Screening remarks are mandatory.");
      return;
    }

    if (decision === "REJECT" && !rejectionReason.trim()) {
      window.alert("Rejection reason is mandatory.");
      return;
    }

    onSubmit({
      decision,
      remarks: remarks.trim(),
      rejectionReason:
        decision === "REJECT" ? rejectionReason.trim() : "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Screening Decision
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {application.candidateName} · {application.jobTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Screening Recommendation
            </label>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "SHORTLIST", label: "Shortlist" },
                { value: "REJECT", label: "Reject" },
                { value: "ON_HOLD", label: "On Hold" },
                { value: "ESCALATE", label: "Escalate to HR" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDecision(option.value)}
                  className={`rounded-lg border px-3 py-3 text-sm font-medium ${
                    decision === option.value
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Screening Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Explain why you selected this recommendation..."
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-red-400"
            />
          </div>

          {decision === "REJECT" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the specific reason for rejection..."
                required
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-red-400"
              />
            </div>
          )}

          {decision === "SHORTLIST" && (
            <p className="rounded-lg bg-green-50 p-3 text-xs text-green-700">
              This application will be marked as shortlisted and moved to the
              L1 Interview queue. No individual HR approval is required under
              the selected workflow.
            </p>
          )}

          {["ON_HOLD", "ESCALATE"].includes(decision) && (
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              This application will be sent to the HR Review queue for
              attention.
            </p>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!decision}
              className="rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:bg-gray-300"
            >
              Submit Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScreeningDecisionModal;