import { useEffect, useRef, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const JobApplicationForm = ({ selectedJob, onClose }) => {
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submissionError, setSubmissionError] = useState("");

  const [areaOfInterest, setAreaOfInterest] = useState("");
  const [otherAreaOfInterest, setOtherAreaOfInterest] = useState("");
  const [isFresher, setIsFresher] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");

  const resumeInputRef = useRef(null);

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  // Freshers have an immediate notice period.
  useEffect(() => {
    if (isFresher === "yes") {
      setNoticePeriod("Immediately");
    } else if (isFresher === "no") {
      setNoticePeriod("");
    }
  }, [isFresher]);

  // Lock background scrolling while the application modal is open.
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;

    const previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.left = previousBodyStyles.left;
      body.style.right = previousBodyStyles.right;
      body.style.width = previousBodyStyles.width;
      body.style.overflow = previousBodyStyles.overflow;

      window.scrollTo(0, scrollY);
    };
  }, []);

  // Validate the selected resume without uploading or storing it.
  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];

    setResumeError("");
    setResumeFile(null);

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setResumeError("Resume size must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setResumeError("Only PDF, DOC, and DOCX files are allowed.");
      event.target.value = "";
      return;
    }

    setResumeFile(file);
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeError("");

    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  };

  // Submit the application to the backend.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitStatus === "loading") return;

    setSubmissionError("");
    setResumeError("");

    // Resume storage is not connected yet, so resume attachment is optional.
    if (resumeFile && resumeFile.size > MAX_FILE_SIZE) {
      setResumeError("Resume size must be 2 MB or smaller.");
      setResumeFile(null);

      if (resumeInputRef.current) {
        resumeInputRef.current.value = "";
      }

      return;
    }

    if (resumeFile && !ALLOWED_FILE_TYPES.includes(resumeFile.type)) {
      setResumeError("Only PDF, DOC, and DOCX files are allowed.");
      setResumeFile(null);

      if (resumeInputRef.current) {
        resumeInputRef.current.value = "";
      }

      return;
    }

    if (!selectedJob?.title?.trim()) {
      setSubmissionError("Please select a valid job position.");
      return;
    }

    if (!areaOfInterest) {
      setSubmissionError("Please select an area of interest.");
      return;
    }

    if (
      areaOfInterest === "Other" &&
      !otherAreaOfInterest.trim()
    ) {
      setSubmissionError("Please specify your area of interest.");
      return;
    }

    if (!["yes", "no"].includes(isFresher)) {
      setSubmissionError("Please select whether you are a fresher.");
      return;
    }

    if (!noticePeriod) {
      setSubmissionError("Please select your notice period.");
      return;
    }

    setSubmitStatus("loading");

    try {
      const formElement = event.currentTarget;
      const formData = new FormData(formElement);

      const yearsOfExperienceValue = String(
        formData.get("yearsOfExperience") || ""
      ).trim();

      const payload = {
        position: selectedJob.title.trim(),

        areaOfInterest:
          areaOfInterest === "Other"
            ? otherAreaOfInterest.trim()
            : areaOfInterest.trim(),

        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),

        isFresher: isFresher === "yes",

        location: String(
          formData.get("location") || ""
        ).trim(),

        highestQualification: String(
          formData.get("highestQualification") || ""
        ).trim(),

        currentCompany: String(
          formData.get("currentCompany") || ""
        ).trim(),

        noticePeriod,

        coverMessage: String(
          formData.get("coverMessage") || ""
        ).trim(),
      };

      // Experience is optional and is not sent for freshers.
      if (isFresher === "no" && yearsOfExperienceValue !== "") {
        const years = Number(yearsOfExperienceValue);

        if (!Number.isFinite(years) || years < 0) {
          throw new Error(
            "Please enter a valid number of years of experience."
          );
        }

        payload.yearsOfExperience = years;
      }

      // Intentionally send candidate details only.
      // The selected resume file is not uploaded or stored.
      const response = await fetch(`${API_BASE_URL}/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message ||
            "Unable to submit your application. Please try again."
        );
      }

      setSubmitStatus("success");
      window.alert("Application successfully submitted.");

      window.setTimeout(() => {
        setSubmitStatus("idle");
      }, 2000);
    } catch (error) {
      console.error(
        "Candidate application submission failed:",
        error
      );

      setSubmissionError(
        error.message ||
          "Unable to submit your application. Please try again."
      );

      setSubmitStatus("idle");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex h-screen items-center justify-center overflow-hidden bg-black/80 p-4 backdrop-blur-md sm:p-5"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white text-black shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y p-5 sm:p-6 md:p-8"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close application form"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-lg text-black/60 transition-all duration-300 hover:border-[#EF3B3A] hover:bg-[#EF3B3A] hover:text-white sm:right-5 sm:top-5 sm:h-9 sm:w-9"
          >
            ×
          </button>

          {/* Form header */}
          <div className="border-b border-black/10 pb-5 pr-9 sm:pb-6 sm:pr-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#EF3B3A]">
              Job Application
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
              Apply for this role
            </h2>

            <p className="mt-2 text-sm text-black/50 sm:mt-3 sm:text-base">
              {selectedJob?.title || "Job Application"}
            </p>
          </div>

          <form
            className="mt-5 space-y-4 sm:mt-7 sm:space-y-5"
            onSubmit={handleSubmit}
          >
            {/* Position */}
            <div>
              <label
                htmlFor="position"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60"
              >
                Position
              </label>

              <input
                id="position"
                name="position"
                type="text"
                value={selectedJob?.title || ""}
                readOnly
                className="w-full rounded-lg border border-black/10 bg-black/3 px-4 py-3 text-sm text-black/60 outline-none"
              />
            </div>

            {/* Area of interest */}
            <div>
              <label
                htmlFor="areaOfInterest"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60"
              >
                Area of Interest
              </label>

              <select
                id="areaOfInterest"
                name="areaOfInterest"
                required
                value={areaOfInterest}
                onChange={(event) => {
                  setAreaOfInterest(event.target.value);

                  if (event.target.value !== "Other") {
                    setOtherAreaOfInterest("");
                  }
                }}
                className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none transition-colors duration-300 focus:border-[#EF3B3A]"
              >
                <option value="">Select an area</option>
                <option value="SAP S/4HANA">SAP S/4HANA</option>
                <option value="SAP MM">SAP MM</option>
                <option value="SAP SD">SAP SD</option>
                <option value="SAP FICO">SAP FICO</option>
                <option value="SAP ABAP">SAP ABAP</option>
                <option value="Data & Migration">Data Migration</option>
                <option value="Other">Other</option>
              </select>

              {areaOfInterest === "Other" && (
                <div className="mt-3">
                  <label
                    htmlFor="otherAreaOfInterest"
                    className="sr-only"
                  >
                    Please specify your area of interest
                  </label>

                  <input
                    id="otherAreaOfInterest"
                    name="otherAreaOfInterest"
                    type="text"
                    required
                    value={otherAreaOfInterest}
                    onChange={(event) =>
                      setOtherAreaOfInterest(event.target.value)
                    }
                    placeholder="Please specify your area of interest"
                    className="w-full border-0 border-b border-black/20 bg-transparent px-1 py-2 text-sm outline-none transition-colors duration-300 focus:border-[#EF3B3A]"
                  />
                </div>
              )}
            </div>

            {/* Full name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60"
              >
                Full Name <span className="text-[#EF3B3A]">*</span>
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-black/10 px-4 py-3 text-sm outline-none transition-colors duration-300 focus:border-[#EF3B3A]"
              />
            </div>

            {/* Email and phone */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60"
                >
                  Email <span className="text-[#EF3B3A]">*</span>
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-black/10 px-4 py-3 text-sm outline-none transition-colors duration-300 focus:border-[#EF3B3A]"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60"
                >
                  Phone Number <span className="text-[#EF3B3A]">*</span>
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="Enter phone number"
                  className="w-full rounded-lg border border-black/10 px-4 py-3 text-sm outline-none transition-colors duration-300 focus:border-[#EF3B3A]"
                />
              </div>
            </div>

            {/* Fresher selection */}
            <div>
              <p className="mb-3 block text-xs font-medium uppercase tracking-[0.15em] text-black/60">
                Are you a fresher?
              </p>

              <div className="flex flex-wrap items-center gap-5">
                <label
                  htmlFor="fresherYes"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    id="fresherYes"
                    type="radio"
                    name="fresher"
                    value="yes"
                    checked={isFresher === "yes"}
                    onChange={(event) =>
                      setIsFresher(event.target.value)
                    }
                    className="h-4 w-4 accent-[#EF3B3A]"
                  />
                  <span className="text-sm text-black/70">Yes</span>
                </label>

                <label
                  htmlFor="fresherNo"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    id="fresherNo"
                    type="radio"
                    name="fresher"
                    value="no"
                    checked={isFresher === "no"}
                    onChange={(event) =>
                      setIsFresher(event.target.value)
                    }
                    className="h-4 w-4 accent-[#EF3B3A]"
                  />
                  <span className="text-sm text-black/70">No</span>
                </label>
              </div>
            </div>

            {/* Location and experience */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60"
                >
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="City / Country"
                  className="w-full rounded-lg border border-black/10 px-4 py-3 text-sm outline-none transition-colors duration-300 focus:border-[#EF3B3A]"
                />
              </div>

              <div>
                <label
                  htmlFor="yearsOfExperience"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60"
                >
                  Years of Experience
                </label>

                <input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 3"
                  disabled={isFresher === "yes"}
                  className="w-full rounded-lg border border-black/10 px-4 py-3 text-sm outline-none transition-colors duration-300 disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/30 focus:border-[#EF3B3A]"
                />
              </div>
            </div>

            {/* Highest qualification */}
            <div>
              <label
                htmlFor="highestQualification"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60"
              >
                Highest Qualification{" "}
                <span className="text-[#EF3B3A]">*</span>
              </label>

              <input
                id="highestQualification"
                name="highestQualification"
                type="text"
                required
                placeholder="e.g. B.Tech, MBA, MCA"
                className="w-full rounded-lg border border-black/10 px-4 py-3 text-sm outline-none transition-colors duration-300 focus:border-[#EF3B3A]"
              />
            </div>

            {/* Current or previous company */}
            <div>
              <label
                htmlFor="currentCompany"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60"
              >
                Current / Previous Company
              </label>

              <input
                id="currentCompany"
                name="currentCompany"
                type="text"
                placeholder="Company name"
                disabled={isFresher === "yes"}
                className="w-full rounded-lg border border-black/10 px-4 py-3 text-sm outline-none transition-colors duration-300 disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/30 focus:border-[#EF3B3A]"
              />
            </div>

            {/* Resume and notice period */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
              <div>
                <label
                  htmlFor="resume"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60"
                >
                  Resume (Optional for now)
                </label>

                <input
                  id="resume"
                  name="resume"
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  aria-describedby={`resume-requirements${
                    resumeError ? " resume-error" : ""
                  }`}
                  className="block w-full rounded-lg border border-dashed border-black/20 px-4 py-4 text-sm text-black/50 file:mr-4 file:rounded file:border-0 file:bg-black file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-wider file:text-white"
                />

                <p
                  id="resume-requirements"
                  className="mt-2 text-xs text-black/40"
                >
                  PDF, DOC or DOCX · Max 2 MB
                </p>

                <p className="mt-1 text-xs text-black/40">
                  Resume upload/storage is not connected yet. You can apply
                  without attaching a file.
                </p>

                {resumeFile && (
                  <div className="mt-3 flex items-start justify-between gap-3 rounded-lg bg-green-50 p-3">
                    <div className="min-w-0">
                      <p className="break-all text-xs font-medium text-green-800">
                        {resumeFile.name}
                      </p>

                      <p className="mt-1 text-xs text-green-700">
                        {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      aria-label="Remove selected resume"
                      className="shrink-0 text-xs font-medium text-[#EF3B3A] transition-colors hover:text-black"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {resumeError && (
                  <p
                    id="resume-error"
                    role="alert"
                    className="mt-2 text-xs font-medium text-[#EF3B3A]"
                  >
                    {resumeError}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="noticePeriod"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60"
                >
                  Notice Period <span className="text-[#EF3B3A]">*</span>
                </label>

                <select
                  id="noticePeriod"
                  name="noticePeriod"
                  required
                  value={noticePeriod}
                  onChange={(event) =>
                    setNoticePeriod(event.target.value)
                  }
                  disabled={isFresher === "yes"}
                  className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-black/60 outline-none transition-colors duration-300 disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/30 focus:border-[#EF3B3A]"
                >
                  <option value="" disabled>
                    Select notice period
                  </option>
                  <option value="Immediately">Immediately</option>
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days">90 Days</option>
                </select>

                {isFresher === "yes" && (
                  <p className="mt-2 text-xs text-black/35">
                    Set to Immediately for freshers
                  </p>
                )}
              </div>
            </div>

            {/* Cover message */}
            <div>
              <label
                htmlFor="coverMessage"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60"
              >
                Cover Message
              </label>

              <textarea
                id="coverMessage"
                name="coverMessage"
                rows="4"
                placeholder="Tell us briefly about yourself..."
                className="w-full resize-none rounded-lg border border-black/10 px-4 py-3 text-sm outline-none transition-colors duration-300 focus:border-[#EF3B3A]"
              />
            </div>

            {/* Backend submission errors */}
            {submissionError && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {submissionError}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitStatus === "loading"}
              className="group inline-flex min-w-48 w-full shrink-0 items-center justify-center gap-3 rounded-full bg-black px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-[#EF3B3A] disabled:cursor-not-allowed sm:py-3.5"
            >
              {submitStatus === "idle" && (
                <>
                  <span>Send Application</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}

              {submitStatus === "loading" && (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}

              {submitStatus === "success" && (
                <span className="text-xl leading-none">✓</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationForm;