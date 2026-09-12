import { useEffect, useState } from "react";

const JobApplicationForm = ({ selectedJob, onClose }) => {
  const [submitStatus, setSubmitStatus] = useState("idle");

  const [areaOfInterest, setAreaOfInterest] = useState("");
  const [otherAreaOfInterest, setOtherAreaOfInterest] = useState("");
  const [isFresher, setIsFresher] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");

  /* =====================================================
     FRESHER → NOTICE PERIOD
  ===================================================== */

  useEffect(() => {
    if (isFresher === "yes") {
      setNoticePeriod("Immediately");
    }

    if (isFresher === "no") {
      setNoticePeriod("");
    }
  }, [isFresher]);

  /* =====================================================
     LOCK BACKGROUND PAGE SCROLL
  ===================================================== */

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

  /* =====================================================
     HANDLE SUBMIT
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitStatus("loading");

    // Temporary frontend-only submission.
    // Backend API integration will be added later.
    setTimeout(() => {
      setSubmitStatus("success");

      setTimeout(() => {
        alert("Application successfully submitted.");
      }, 250);

      setTimeout(() => {
        setSubmitStatus("idle");
      }, 2000);
    }, 1000);
  };

  return (
    /* =====================================================
       FULL SCREEN OVERLAY
    ===================================================== */

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        h-screen
        items-center
        justify-center
        overflow-hidden
        bg-black/80
        p-4
        backdrop-blur-md
        sm:p-5
      "
      onClick={onClose}
    >
      {/* =================================================
          MODAL SHELL
      ================================================== */}

      <div
        className="
          relative
          flex
          h-full
          max-h-full
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          text-black
          shadow-2xl
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* =================================================
            SCROLLABLE FORM AREA
        ================================================== */}

        <div
          data-lenis-prevent
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            touch-pan-y
            p-5
            sm:p-6
            md:p-8
          "
        >
          {/* =================================================
              CLOSE BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={onClose}
            className="
              absolute
              right-4
              top-4
              z-10
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border
              border-black/10
              bg-white
              text-lg
              text-black/60
              transition-all
              duration-300
              hover:border-[#EF3B3A]
              hover:bg-[#EF3B3A]
              hover:text-white
              sm:right-5
              sm:top-5
              sm:h-9
              sm:w-9
            "
            aria-label="Close application form"
          >
            ×
          </button>

          {/* =================================================
              FORM HEADER
          ================================================== */}

          <div
            className="
              border-b
              border-black/10
              pb-5
              pr-9
              sm:pb-6
              sm:pr-10
            "
          >
            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-[0.2em]
                text-[#EF3B3A]
              "
            >
              Job Application
            </p>

            <h2
              className="
                mt-2
                text-2xl
                font-semibold
                tracking-tight
                sm:mt-3
                sm:text-3xl
                md:text-4xl
              "
            >
              Apply for this role
            </h2>

            <p className="mt-2 text-sm text-black/50 sm:mt-3 sm:text-base">
              {selectedJob?.title || "Job Application"}
            </p>
          </div>

          {/* =================================================
              APPLICATION FORM
          ================================================== */}

          <form
            className="
              mt-5
              space-y-4
              sm:mt-7
              sm:space-y-5
            "
            onSubmit={handleSubmit}
          >
            {/* =================================================
                POSITION
            ================================================== */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-black/60
                "
              >
                Position
              </label>

              <input
                type="text"
                value={selectedJob?.title || ""}
                readOnly
                className="
                  w-full
                  rounded-lg
                  border
                  border-black/10
                  bg-black/3
                  px-4
                  py-3
                  text-sm
                  text-black/60
                  outline-none
                "
              />
            </div>

            {/* =================================================
                AREA OF INTEREST
            ================================================== */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-black/60
                "
              >
                Area of Interest
              </label>

              <select
                value={areaOfInterest}
                onChange={(event) => {
                  setAreaOfInterest(event.target.value);

                  if (event.target.value !== "Other") {
                    setOtherAreaOfInterest("");
                  }
                }}
                className="
                  w-full
                  rounded-lg
                  border
                  border-black/10
                  bg-white
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition-colors
                  duration-300
                  focus:border-[#EF3B3A]
                "
              >
                <option value="">Select an area</option>

                <option value="SAP S/4HANA">
                  SAP S/4HANA
                </option>

                <option value="SAP MM">
                  SAP MM
                </option>

                <option value="SAP SD">
                  SAP SD
                </option>

                <option value="SAP FICO">
                  SAP FICO
                </option>

                <option value="SAP ABAP">
                  SAP ABAP
                </option>

                <option value="Data & Migration">
                  Data Migration
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

              {/* =================================================
                  OTHER AREA OF INTEREST
              ================================================== */}

              {areaOfInterest === "Other" && (
                <input
                  type="text"
                  value={otherAreaOfInterest}
                  onChange={(event) =>
                    setOtherAreaOfInterest(event.target.value)
                  }
                  placeholder="Please specify your area of interest"
                  className="
                    mt-3
                    w-full
                    border-0
                    border-b
                    border-black/20
                    bg-transparent
                    px-1
                    py-2
                    text-sm
                    outline-none
                    transition-colors
                    duration-300
                    focus:border-[#EF3B3A]
                  "
                />
              )}
            </div>

            {/* =================================================
                FULL NAME
            ================================================== */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-black/60
                "
              >
                Full Name <span className="text-[#EF3B3A]">*</span>
              </label>

              <input
                type="text"
                required
                placeholder="Enter your full name"
                className="
                  w-full
                  rounded-lg
                  border
                  border-black/10
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition-colors
                  duration-300
                  focus:border-[#EF3B3A]
                "
              />
            </div>

            {/* =================================================
                EMAIL + PHONE
            ================================================== */}

            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
              {/* EMAIL */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.15em]
                    text-black/60
                  "
                >
                  Email <span className="text-[#EF3B3A]">*</span>
                </label>

                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-black/10
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition-colors
                    duration-300
                    focus:border-[#EF3B3A]
                  "
                />
              </div>

              {/* PHONE */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.15em]
                    text-black/60
                  "
                >
                  Phone Number <span className="text-[#EF3B3A]">*</span>
                </label>

                <input
                  type="tel"
                  required
                  placeholder="Enter phone number"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-black/10
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition-colors
                    duration-300
                    focus:border-[#EF3B3A]
                  "
                />
              </div>
            </div>

            {/* =================================================
                ARE YOU A FRESHER?
            ================================================== */}

            <div>
              <label
                className="
                  mb-3
                  block
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-black/60
                "
              >
                Are you a fresher?
              </label>

              <div className="flex flex-wrap items-center gap-5">
                {/* YES */}

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="fresher"
                    value="yes"
                    checked={isFresher === "yes"}
                    onChange={(event) => setIsFresher(event.target.value)}
                    className="
                      h-4
                      w-4
                      accent-[#EF3B3A]
                    "
                  />

                  <span className="text-sm text-black/70">
                    Yes
                  </span>
                </label>

                {/* NO */}

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="fresher"
                    value="no"
                    checked={isFresher === "no"}
                    onChange={(event) => setIsFresher(event.target.value)}
                    className="
                      h-4
                      w-4
                      accent-[#EF3B3A]
                    "
                  />

                  <span className="text-sm text-black/70">
                    No
                  </span>
                </label>
              </div>
            </div>

            {/* =================================================
                LOCATION + EXPERIENCE
            ================================================== */}

            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
              {/* LOCATION */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.15em]
                    text-black/60
                  "
                >
                  Location
                </label>

                <input
                  type="text"
                  placeholder="City / Country"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-black/10
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition-colors
                    duration-300
                    focus:border-[#EF3B3A]
                  "
                />
              </div>

              {/* YEARS OF EXPERIENCE */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.15em]
                    text-black/60
                  "
                >
                  Years of Experience
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 3"
                  disabled={isFresher === "yes"}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-black/10
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition-colors
                    duration-300
                    disabled:cursor-not-allowed
                    disabled:bg-black/5
                    disabled:text-black/30
                    focus:border-[#EF3B3A]
                  "
                />
              </div>
            </div>

            {/* =================================================
                HIGHEST QUALIFICATION
            ================================================== */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-black/60
                "
              >
                Highest Qualification{" "}
                <span className="text-[#EF3B3A]">*</span>
              </label>

              <input
                type="text"
                required
                placeholder="e.g. B.Tech, MBA, MCA"
                className="
                  w-full
                  rounded-lg
                  border
                  border-black/10
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition-colors
                  duration-300
                  focus:border-[#EF3B3A]
                "
              />
            </div>

            {/* =================================================
                CURRENT / PREVIOUS COMPANY
            ================================================== */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-black/60
                "
              >
                Current / Previous Company
              </label>

              <input
                type="text"
                placeholder="Company name"
                disabled={isFresher === "yes"}
                className="
                  w-full
                  rounded-lg
                  border
                  border-black/10
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition-colors
                  duration-300
                  disabled:cursor-not-allowed
                  disabled:bg-black/5
                  disabled:text-black/30
                  focus:border-[#EF3B3A]
                "
              />
            </div>

            {/* =================================================
                RESUME + NOTICE PERIOD
            ================================================== */}

            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
              {/* RESUME */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.15em]
                    text-black/60
                  "
                >
                  Resume <span className="text-[#EF3B3A]">*</span>
                </label>

                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  className="
                    block
                    w-full
                    rounded-lg
                    border
                    border-dashed
                    border-black/20
                    px-4
                    py-4
                    text-sm
                    text-black/50
                    file:mr-4
                    file:rounded
                    file:border-0
                    file:bg-black
                    file:px-4
                    file:py-2
                    file:text-xs
                    file:font-medium
                    file:uppercase
                    file:tracking-wider
                    file:text-white
                  "
                />

                <p className="mt-2 text-xs text-black/35">
                  PDF, DOC or DOCX
                </p>
              </div>

              {/* NOTICE PERIOD */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.15em]
                    text-black/60
                  "
                >
                  Notice Period{" "}
                  <span className="text-[#EF3B3A]">*</span>
                </label>

                <select
                  required
                  value={noticePeriod}
                  onChange={(event) =>
                    setNoticePeriod(event.target.value)
                  }
                  disabled={isFresher === "yes"}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-black/10
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-black/60
                    outline-none
                    transition-colors
                    duration-300
                    disabled:cursor-not-allowed
                    disabled:bg-black/5
                    disabled:text-black/30
                    focus:border-[#EF3B3A]
                  "
                >
                  <option value="" disabled>
                    Select notice period
                  </option>

                  <option value="Immediately">
                    Immediately
                  </option>

                  <option value="30 Days">
                    30 Days
                  </option>

                  <option value="60 Days">
                    60 Days
                  </option>

                  <option value="90 Days">
                    90 Days
                  </option>
                </select>

                {isFresher === "yes" && (
                  <p className="mt-2 text-xs text-black/35">
                    Set to Immediately for freshers
                  </p>
                )}
              </div>
            </div>

            {/* =================================================
                COVER MESSAGE
            ================================================== */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-black/60
                "
              >
                Cover Message
              </label>

              <textarea
                rows="4"
                placeholder="Tell us briefly about yourself..."
                className="
                  w-full
                  resize-none
                  rounded-lg
                  border
                  border-black/10
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition-colors
                  duration-300
                  focus:border-[#EF3B3A]
                "
              />
            </div>

            {/* =================================================
                SEND / SUBMIT
            ================================================== */}

            <button
              type="submit"
              disabled={submitStatus === "loading"}
              className="
                group
                inline-flex
                min-w-48
                w-full
                shrink-0
                items-center
                justify-center
                gap-3
                rounded-full
                bg-black
                px-6
                py-3
                text-xs
                font-medium
                uppercase
                tracking-[0.15em]
                text-white
                transition-all
                duration-300
                hover:bg-[#EF3B3A]
                disabled:cursor-not-allowed
                sm:py-3.5
              "
            >
              {submitStatus === "idle" && (
                <>
                  <span>
                    Send Application
                  </span>

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}

              {submitStatus === "loading" && (
                <span
                  className="
                    h-5
                    w-5
                    animate-spin
                    rounded-full
                    border-2
                    border-white/30
                    border-t-white
                  "
                />
              )}

              {submitStatus === "success" && (
                <span className="text-xl leading-none">
                  ✓
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationForm;