import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CareersContact = () => {
  const sectionRef = useRef(null);

  // SEND APPLICATION BUTTON STATE
  const [submitStatus, setSubmitStatus] = useState("idle");

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".career-contact-title", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".career-contact-intro", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
        opacity: 0,
        x: -30,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".career-contact-form", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
        opacity: 0,
        x: 30,
        duration: 0.8,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // SEND APPLICATION CLICK HANDLER
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check whether required fields are filled
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    // Show loading spinner
    setSubmitStatus("loading");

    // After 2 seconds show success tick
    setTimeout(() => {
      setSubmitStatus("success");

      // After 2 more seconds return to normal button
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 2000);
    }, 2000);
  };

  return (
    <section
      ref={sectionRef}
      id="get-in-touch"
      className="career-contact bg-black px-6 py-16 text-white md:px-12 md:py-20 lg:px-20"
    >
      <div className="mx-auto max-w-7xl">

        {/* SECTION HEADING */}

        <div className="border-b border-white/10 pb-6">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#EF3B3A]">
            Contact
          </p>

          <h2
            className="
              career-contact-title
              text-[clamp(1.875rem,7vw,3.75rem)]
              font-medium
              leading-none
              tracking-tight
              md:text-5xl
              lg:text-6xl
            "
          >
            Get in Touch
          </h2>
        </div>

        {/* MAIN CONTENT */}

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">

          {/* LEFT CONTENT */}

          <div className="career-contact-intro lg:pt-4">

            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#EF3B3A]" />

              <span className="text-xs uppercase tracking-[0.18em] text-white/40">
                Let&apos;s Connect
              </span>
            </div>

            <p className="mt-6 text-2xl font-medium leading-tight tracking-tight md:text-3xl">

              <span className="block whitespace-nowrap">
                Ready to build
              </span>

              <span className="block whitespace-nowrap">
                what&apos;s next{" "}
                <span className="text-[#EF3B3A]">
                  with us?
                </span>
              </span>

            </p>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/40 md:text-base">
              Tell us a little about yourself, your interests and the kind of
              opportunities you&apos;re looking for.
            </p>

          </div>

          {/* APPLICATION FORM */}

          <form
            onSubmit={handleSubmit}
            className="
              career-contact-form
              rounded-2xl
              border
              border-white/10
              bg-[#F7F7F5]
              p-6
              text-black
              md:p-8
            "
          >

            {/* FORM HEADER */}

            <div className="mb-8 flex items-start justify-between gap-5">

              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-black">
                  Careers
                </p>

                <h3 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">
                  Start your journey.
                </h3>
              </div>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-sm text-white">
                →
              </span>

            </div>

            {/* FIRST + LAST NAME */}

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label
                  htmlFor="career-first-name"
                  className="mb-2 block text-xs uppercase tracking-[0.15em] text-black"
                >
                  First Name *
                </label>

                <input
                  id="career-first-name"
                  name="firstName"
                  type="text"
                  required
                  className="
                    w-full
                    border-0
                    border-b
                    border-black/15
                    bg-transparent
                    px-0
                    pb-3
                    pt-1
                    text-sm
                    outline-none
                    transition-all
                    duration-300
                    focus:border-[#EF3B3A]
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="career-last-name"
                  className="mb-2 block text-xs uppercase tracking-[0.15em] text-black"
                >
                  Last Name *
                </label>

                <input
                  id="career-last-name"
                  name="lastName"
                  type="text"
                  required
                  className="
                    w-full
                    border-0
                    border-b
                    border-black/15
                    bg-transparent
                    px-0
                    pb-3
                    pt-1
                    text-sm
                    outline-none
                    transition-all
                    duration-300
                    focus:border-[#EF3B3A]
                  "
                />
              </div>

            </div>

            {/* EMAIL */}

            <div className="mt-6">

              <label
                htmlFor="career-email"
                className="mb-2 block text-xs uppercase tracking-[0.15em] text-black"
              >
                Email *
              </label>

              <input
                id="career-email"
                name="email"
                type="email"
                required
                className="
                  w-full
                  border-0
                  border-b
                  border-black/15
                  bg-transparent
                  px-0
                  pb-3
                  pt-1
                  text-sm
                  outline-none
                  transition-all
                  duration-300
                  focus:border-[#EF3B3A]
                "
              />

            </div>

            {/* AREA OF INTEREST */}

            <div className="mt-6">

              <label
                htmlFor="career-role"
                className="mb-2 block text-xs uppercase tracking-[0.15em] text-black"
              >
                Area of Interest *
              </label>

              <select
                id="career-role"
                name="role"
                required
                defaultValue=""
                className="
                  w-full
                  border-0
                  border-b
                  border-black/15
                  bg-transparent
                  px-0
                  pb-3
                  pt-1
                  text-sm
                  text-black
                  outline-none
                  transition-all
                  duration-300
                  focus:border-[#EF3B3A]
                "
              >
                <option value="" disabled>
                  Select an area
                </option>

                <option value="engineering">
                  Engineering
                </option>

                <option value="data-ai">
                  Data & AI
                </option>

                <option value="consulting">
                  Consulting
                </option>

                <option value="business">
                  Business & Operations
                </option>

                <option value="other">
                  Other
                </option>
              </select>

            </div>

            {/* RESUME UPLOAD */}

            <div className="mt-6">

              <label
                htmlFor="career-resume"
                className="mb-2 block text-xs uppercase tracking-[0.15em] text-black"
              >
                Resume *
              </label>

              <div className="flex items-center border-b border-black/15 pb-3">

                <input
                  id="career-resume"
                  name="resume"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  className="
                    w-full
                    cursor-pointer
                    bg-transparent
                    text-sm
                    text-black/60
                    file:mr-4
                    file:rounded-full
                    file:border-0
                    file:bg-black
                    file:px-4
                    file:py-2
                    file:text-xs
                    file:font-medium
                    file:text-white
                    file:transition-colors
                    hover:file:bg-[#EF3B3A]
                  "
                />

              </div>

              <p className="mt-2 text-[11px] text-black/30">
                PDF, DOC or DOCX · Maximum file size will be configured later.
              </p>

            </div>

            {/* MESSAGE */}

            <div className="mt-6">

              <label
                htmlFor="career-message"
                className="mb-2 block text-xs uppercase tracking-[0.15em] text-black"
              >
                Message
              </label>

              <textarea
                id="career-message"
                name="message"
                rows="4"
                placeholder="Tell us about yourself..."
                className="
                  w-full
                  resize-none
                  border-0
                  border-b
                  border-black/15
                  bg-transparent
                  px-0
                  pb-3
                  pt-1
                  text-sm
                  outline-none
                  placeholder:text-black/25
                  transition-all
                  duration-300
                  focus:border-[#EF3B3A]
                "
              />

            </div>

            {/* SUBMIT */}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="max-w-xs text-[11px] leading-relaxed text-black">
                Share your details and our team will get in touch with you.
              </p>

              {/* SEND APPLICATION BUTTON */}

              <button
                type="submit"
                disabled={submitStatus === "loading"}
                className="
                  group
                  inline-flex
                  min-w-[190px]
                  shrink-0
                  items-center
                  justify-center
                  gap-3
                  rounded-full
                  bg-black
                  px-6
                  py-3.5
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-white
                  transition-all
                  duration-300
                  hover:bg-[#EF3B3A]
                  disabled:cursor-not-allowed
                "
              >
                {/* NORMAL BUTTON */}

                {submitStatus === "idle" && (
                  <>
                    <span>Send Application</span>

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}

                {/* LOADING SPINNER */}

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

                {/* SUCCESS TICK */}

                {submitStatus === "success" && (
                  <span className="text-xl leading-none">
                    ✓
                  </span>
                )}

              </button>

            </div>

          </form>

        </div>

      </div>
    </section>
  );
};

export default CareersContact;