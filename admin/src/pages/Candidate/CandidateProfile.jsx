import { useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  IdCard,
  FileText,
  Pencil,
  Trash2,
  ExternalLink,
  Check,
  X,
} from "lucide-react";

import CandidateLayout, {
  PageState,
} from "../../components/Candidate/CandidateLayout.jsx";
import { formatDate } from "../../services/format.js";
import useApi from "../../services/useApi.js";
import { saveSession, getToken } from "../../services/http.js";
import {
  getProfile,
  removeResume,
  saveResume,
  updateProfile,
} from "../../services/candidatePortal.js";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#f2383d]";

const labelClass =
  "mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500";

function Banner({ tone, children }) {
  const style =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`mb-4 rounded-lg border px-4 py-3 text-sm ${style}`}
    >
      {children}
    </p>
  );
}

export default function CandidateProfile() {
  const { data, loading, error, reload } = useApi(
    (signal) => getProfile(signal),
    []
  );

  const candidate = data?.candidate;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [resumeForm, setResumeForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ tone: "", text: "" });

  const startEditing = () => {
    setForm({ name: candidate.name, phone: candidate.phone });
    setNotice({ tone: "", text: "" });
    setEditing(true);
  };

  const run = async (action, successText) => {
    setBusy(true);
    setNotice({ tone: "", text: "" });

    try {
      await action();
      setNotice({ tone: "success", text: successText });
      reload();
    } catch (requestError) {
      setNotice({ tone: "error", text: requestError.message });
      return false;
    } finally {
      setBusy(false);
    }

    return true;
  };

  const submitProfile = async (event) => {
    event.preventDefault();

    const ok = await run(async () => {
      const response = await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
      });

      // Keep the name shown in the header current.
      saveSession("candidate", getToken("candidate"), {
        ...response.candidate,
        role: "CANDIDATE",
      });
      localStorage.setItem("candidateName", response.candidate.name);
      window.dispatchEvent(new Event("candidate-user-updated"));
    }, "Profile updated successfully.");

    if (ok) setEditing(false);
  };

  const submitResume = async (event) => {
    event.preventDefault();

    const ok = await run(
      () =>
        saveResume({
          fileName: resumeForm.fileName.trim(),
          fileUrl: resumeForm.fileUrl.trim(),
          fileType: resumeForm.fileType,
        }),
      "Resume saved successfully."
    );

    if (ok) setResumeForm(null);
  };

  const deleteResume = () => {
    if (!window.confirm("Remove your saved resume?")) return;

    run(() => removeResume(), "Resume removed.");
  };

  const resume = candidate?.resume;
  const hasResume = Boolean(resume?.fileUrl);

  return (
    <CandidateLayout active="Profile">
      {({ darkMode }) => {
        const card = darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white";

        return (
          <>
            <section className="mb-5">
              <p className="mb-2 text-xs font-medium text-slate-500">Profile</p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">
                My Profile
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Keep your details and resume up to date before you apply.
              </p>
            </section>

            {notice.text && <Banner tone={notice.tone}>{notice.text}</Banner>}

            <PageState loading={loading} error={error} onRetry={reload}>
              {candidate && (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  {/* PERSONAL INFORMATION */}
                  <section className={`rounded-xl border p-5 shadow-sm ${card}`}>
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-red-50 text-[#f2383d]">
                          <UserRound size={24} />
                        </div>
                        <h2 className="text-base font-bold sm:text-lg">
                          Personal Information
                        </h2>
                      </div>

                      {!editing && (
                        <button
                          type="button"
                          onClick={startEditing}
                          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      )}
                    </div>

                    {editing ? (
                      <form onSubmit={submitProfile} className="space-y-4">
                        <div>
                          <label htmlFor="profile-name" className={labelClass}>
                            Full Name
                          </label>
                          <input
                            id="profile-name"
                            required
                            value={form.name}
                            onChange={(event) =>
                              setForm({ ...form, name: event.target.value })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label htmlFor="profile-phone" className={labelClass}>
                            Phone Number
                          </label>
                          <input
                            id="profile-phone"
                            required
                            type="tel"
                            value={form.phone}
                            onChange={(event) =>
                              setForm({ ...form, phone: event.target.value })
                            }
                            className={inputClass}
                          />
                        </div>

                        <p className="text-xs text-slate-500">
                          Your email address cannot be changed here.
                        </p>

                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 hover:text-slate-900"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={busy}
                            className="flex items-center gap-2 rounded-xl bg-[#f2383d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                          >
                            <Check size={16} />
                            {busy ? "Saving..." : "Save changes"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <dl className="space-y-4 text-sm">
                        {[
                          [UserRound, "Full name", candidate.name],
                          [Mail, "Email", candidate.email],
                          [Phone, "Phone", candidate.phone],
                          [IdCard, "Candidate ID", candidate.candidateId || "—"],
                        ].map(([Icon, label, value]) => (
                          <div key={label} className="flex items-center gap-3">
                            <Icon size={18} className="text-slate-400" />
                            <div>
                              <dt className="text-xs text-slate-500">{label}</dt>
                              <dd className="font-semibold">{value}</dd>
                            </div>
                          </div>
                        ))}

                        <p className="pt-1 text-xs text-slate-400">
                          Member since {formatDate(candidate.createdAt)}
                        </p>
                      </dl>
                    )}
                  </section>

                  {/* RESUME */}
                  <section className={`rounded-xl border p-5 shadow-sm ${card}`}>
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                          <FileText size={24} />
                        </div>
                        <h2 className="text-base font-bold sm:text-lg">Resume</h2>
                      </div>

                      {!resumeForm && (
                        <button
                          type="button"
                          onClick={() =>
                            setResumeForm({
                              fileName: resume?.fileName || "",
                              fileUrl: resume?.fileUrl || "",
                              fileType: resume?.fileType || "pdf",
                            })
                          }
                          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Pencil size={14} />
                          {hasResume ? "Update" : "Add resume"}
                        </button>
                      )}
                    </div>

                    {resumeForm ? (
                      <form onSubmit={submitResume} className="space-y-4">
                        <div>
                          <label htmlFor="resume-name" className={labelClass}>
                            File name
                          </label>
                          <input
                            id="resume-name"
                            required
                            value={resumeForm.fileName}
                            onChange={(event) =>
                              setResumeForm({ ...resumeForm, fileName: event.target.value })
                            }
                            placeholder="Your_Name_Resume.pdf"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label htmlFor="resume-url" className={labelClass}>
                            Link to your resume
                          </label>
                          <input
                            id="resume-url"
                            required
                            type="url"
                            value={resumeForm.fileUrl}
                            onChange={(event) =>
                              setResumeForm({ ...resumeForm, fileUrl: event.target.value })
                            }
                            placeholder="https://..."
                            className={inputClass}
                          />
                          <p className="mt-1.5 text-xs text-slate-500">
                            Upload your resume to a shared location (for example
                            SharePoint or Google Drive) and paste the link.
                          </p>
                        </div>

                        <div>
                          <label htmlFor="resume-type" className={labelClass}>
                            File type
                          </label>
                          <select
                            id="resume-type"
                            value={resumeForm.fileType}
                            onChange={(event) =>
                              setResumeForm({ ...resumeForm, fileType: event.target.value })
                            }
                            className={inputClass}
                          >
                            <option value="pdf">PDF</option>
                            <option value="docx">DOCX</option>
                          </select>
                        </div>

                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setResumeForm(null)}
                            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={busy}
                            className="rounded-xl bg-[#f2383d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                          >
                            {busy ? "Saving..." : "Save resume"}
                          </button>
                        </div>
                      </form>
                    ) : hasResume ? (
                      <div className="space-y-4 text-sm">
                        <div>
                          <p className="font-semibold">{resume.fileName}</p>
                          <p className="text-xs text-slate-500">
                            {resume.fileType?.toUpperCase()} · added{" "}
                            {formatDate(resume.uploadedAt)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <a
                            href={resume.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-[#f2383d] px-4 py-2 text-xs font-semibold text-[#f2383d] hover:bg-[#f2383d] hover:text-white"
                          >
                            <ExternalLink size={14} />
                            Open resume
                          </a>

                          <button
                            type="button"
                            onClick={deleteResume}
                            disabled={busy}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No resume added yet. A resume is required before you can
                        apply for a job.
                      </p>
                    )}
                  </section>
                </div>
              )}
            </PageState>
          </>
        );
      }}
    </CandidateLayout>
  );
}
