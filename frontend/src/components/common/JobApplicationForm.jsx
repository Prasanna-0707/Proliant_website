import { useEffect, useState } from "react";

const JobApplicationForm = ({ selectedJob, onClose }) => {
  const [submitStatus, setSubmitStatus] = useState("idle");

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

          IMPORTANT:
          h-full gives this element a real height.
          overflow-hidden keeps the rounded corners intact.
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

            THIS IS THE ONLY SCROLL CONTAINER.
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
              {selectedJob.title}
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
            {/* POSITION */}

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
                value={selectedJob.title}
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

            {/* FULL NAME */}

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
                Full Name
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

            {/* EMAIL + PHONE */}

            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
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
                  Email
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
                  Phone Number
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

            {/* LOCATION + EXPERIENCE */}

            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
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
                  required
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
                  required
                  placeholder="e.g. 3"
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

            {/* HIGHEST QUALIFICATION */}

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
                Highest Qualification
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

            {/* CURRENT / PREVIOUS COMPANY */}

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
                Resume
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

            {/* COVER MESSAGE */}

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
                SEND APPLICATION
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
                  <span>Send Application</span>

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