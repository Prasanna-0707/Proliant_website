import { X, User, Mail, Phone, Briefcase, GraduationCap, Clock } from "lucide-react";

const CandidateResumeViewer = ({ application, onClose, onStartScreening }) => {
  if (!application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Candidate Application
            </h2>
            <p className="mt-1 text-sm text-gray-500">{application.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          {[
            { label: "Candidate", value: application.candidateName, icon: User },
            { label: "Email", value: application.email, icon: Mail },
            { label: "Phone", value: application.phone, icon: Phone },
            { label: "Applied Position", value: application.jobTitle, icon: Briefcase },
            { label: "Experience", value: application.experience, icon: Clock },
            { label: "Education", value: application.education, icon: GraduationCap },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label}>
                <p className="mb-2 text-xs font-medium uppercase text-gray-500">
                  {item.label}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-800">
                  <Icon size={17} className="text-gray-400" />
                  {item.value || "—"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t p-5">
          <h3 className="mb-3 font-semibold text-gray-900">Resume</h3>

          {application.resumeUrl ? (
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Open Candidate Resume
            </a>
          ) : (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              No resume URL is available in this demo record. The actual resume
              viewer will use the candidate's uploaded resume after backend integration.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>

          {["ASSIGNED_TO_L0", "L0_IN_PROGRESS"].includes(application.status) && (
            <button
              type="button"
              onClick={() => onStartScreening(application)}
              className="rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Review Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateResumeViewer;