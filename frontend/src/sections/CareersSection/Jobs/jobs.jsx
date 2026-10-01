import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import JobApplicationForm from "../../../components/common/JobApplicationForm";

gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

/* =====================================================
   JOBS COMPONENT
===================================================== */

const Jobs = () => {
  const sectionRef = useRef(null);

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     APPLICATION FORM STATE
  ===================================================== */

  const [selectedJob, setSelectedJob] =
    useState(null);

  const [isApplicationFormOpen, setIsApplicationFormOpen] =
    useState(false);

  /* =====================================================
     JOB DETAILS MODAL STATE
  ===================================================== */

  const [detailsJob, setDetailsJob] =
    useState(null);

  /* =====================================================
     FETCH PUBLISHED JOBS
  ===================================================== */

  useLayoutEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/jobs`
        );

        if (!response.ok) {
          throw new Error(
            `Jobs API failed with status ${response.status}`
          );
        }

        const result = await response.json();

        if (
          result?.success !== true ||
          !Array.isArray(result?.jobs)
        ) {
          throw new Error(
            "Invalid jobs response from backend"
          );
        }

        /*
         * Backend public GET should return
         * Published jobs only.
         *
         * Extra frontend filtering is also kept
         * as a safety check.
         */
        const publishedJobs = result.jobs.filter(
          (job) => job.status === "Published"
        );

        /*
         * Latest published jobs first.
         */
        publishedJobs.sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );

        setJobs(publishedJobs);
      } catch (error) {
        console.error(
          "Failed to load careers jobs:",
          error
        );

        setError(
          "Unable to load current job openings."
        );

        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  /* =====================================================
     GSAP ANIMATIONS
  ===================================================== */

  useLayoutEffect(() => {
    /*
     * Wait until jobs have finished loading before
     * creating card animations.
     */
    if (isLoading) {
      return;
    }

    const ctx = gsap.context(() => {
      /*
       * Keep animations lighter on smaller screens
       * to avoid unnecessary scroll load/stutter.
       */
      const isMobile = window.matchMedia(
        "(max-width: 767px)"
      ).matches;

      /* =================================================
         SECTION LABEL
      ================================================= */

      gsap.fromTo(
        ".jobs-label",
        {
          opacity: 0,
          x: isMobile ? -15 : -25,
        },
        {
          opacity: 1,
          x: 0,
          duration: isMobile ? 0.5 : 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions:
              "play none none reverse",
          },
        }
      );

      /* =================================================
         SECTION HEADING
      ================================================= */

      gsap.fromTo(
        ".jobs-title-line",
        {
          opacity: 0,
          y: isMobile ? 25 : 40,
          filter: isMobile
            ? "blur(4px)"
            : "blur(7px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: isMobile ? 0.65 : 0.8,
          stagger: isMobile ? 0.07 : 0.1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions:
              "play none none reverse",
          },
        }
      );

      /* =================================================
         DESCRIPTION
      ================================================= */

      gsap.fromTo(
        ".jobs-description",
        {
          opacity: 0,
          y: isMobile ? 12 : 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: isMobile ? 0.5 : 0.65,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions:
              "play none none reverse",
          },
        }
      );

      /* =================================================
         INDIVIDUAL JOB CARDS

         Every card gets its own ScrollTrigger.
      ================================================= */

      const jobCards =
        gsap.utils.toArray(".job-card");

      jobCards.forEach((card) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: isMobile ? 20 : 35,
          },
          {
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.5 : 0.65,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions:
                "play none none reverse",
            },
          }
        );
      });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isLoading, jobs]);

  /* =====================================================
     LOCK BACKGROUND SCROLL

     This works for both:
     - Job Details modal
     - Application modal
  ===================================================== */

  useLayoutEffect(() => {
    if (!detailsJob && !isApplicationFormOpen) {
      return;
    }

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    const previousBodyOverscroll =
      document.body.style.overscrollBehavior;

    const previousHtmlOverscroll =
      document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow =
      "hidden";

    document.body.style.overscrollBehavior =
      "none";

    document.documentElement.style.overscrollBehavior =
      "none";

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.body.style.overscrollBehavior =
        previousBodyOverscroll;

      document.documentElement.style.overscrollBehavior =
        previousHtmlOverscroll;
    };
  }, [detailsJob, isApplicationFormOpen]);

  /* =====================================================
     OPEN JOB DETAILS
  ===================================================== */

  const openJobDetails = (job) => {
    setDetailsJob(job);
  };

  /* =====================================================
     CLOSE JOB DETAILS
  ===================================================== */

  const closeJobDetails = () => {
    setDetailsJob(null);
  };

  /* =====================================================
     OPEN APPLICATION FORM
  ===================================================== */

  const openApplicationForm = (job) => {
    setDetailsJob(null);
    setSelectedJob(job);
    setIsApplicationFormOpen(true);
  };

  /* =====================================================
     CLOSE APPLICATION FORM
  ===================================================== */

  const closeApplicationForm = () => {
    setSelectedJob(null);
    setIsApplicationFormOpen(false);
  };

  /* =====================================================
     GET JOB DESCRIPTION

     Backend uses jobDescription.
     Fallback to description keeps the UI safe
     if older job records use description.
  ===================================================== */

  const getJobDescription = (job) => {
    return (
      job?.jobDescription ||
      job?.description ||
      "No job description available."
    );
  };

  /* =====================================================
     GET JOB REQUIREMENTS
  ===================================================== */

  const getJobRequirements = (job) => {
    return (
      job?.requirements ||
      "No specific requirements provided."
    );
  };

  return (
    <>
      {/* =====================================================
          JOBS SECTION
      ===================================================== */}

      <section
        ref={sectionRef}
        id="jobs"
        className="
          bg-black
          px-5
          py-10
          text-white
          sm:px-6
          sm:py-12
          md:px-12
          md:py-16
          lg:px-20
          lg:py-20
        "
      >
        <div className="mx-auto max-w-7xl">

          {/* =================================================
              SECTION HEADER
          ================================================= */}

          <div
            className="
              border-b
              border-white/10
              pb-6
              sm:pb-7
              md:pb-8
            "
          >
            <p
              className="
                jobs-label
                mb-3
                text-xs
                font-medium
                uppercase
                tracking-[0.22em]
                text-[#EF3B3A]
                sm:mb-4
                md:text-sm
              "
            >
              Open Positions
            </p>

            <div
              className="
                grid
                gap-4
                sm:gap-5
                md:gap-6
                lg:grid-cols-[1fr_0.6fr]
                lg:items-end
              "
            >
              <h2
                className="
                  text-[clamp(2rem,6vw,4.5rem)]
                  font-semibold
                  leading-[0.9]
                  tracking-tight
                "
              >
                <span className="jobs-title-line block">
                  Find your
                </span>

                <span className="jobs-title-line block text-white/35">
                  next opportunity.
                </span>
              </h2>

              <p
                className="
                  jobs-description
                  max-w-lg
                  text-sm
                  leading-relaxed
                  text-white/50
                  md:text-base
                "
              >
                Explore opportunities to work with
                SAP, enterprise data and technology
                while helping organizations transform
                the way they work.
              </p>
            </div>
          </div>

          {/* =================================================
              JOB CARDS
          ================================================= */}

          {isLoading ? (
            <div className="py-16 text-center">
              <p className="text-sm text-white/50">
                Loading current opportunities...
              </p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-sm text-white/50">
                {error}
              </p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-white/50">
                No open positions are available
                right now.
              </p>
            </div>
          ) : (
            <div
              className="
                mt-6
                grid
                grid-cols-1
                gap-4
                sm:mt-8
                sm:grid-cols-2
                sm:gap-5
                md:mt-9
                lg:grid-cols-3
              "
            >
              {jobs.map((job, index) => (
                <article
                  key={job._id}
                  className="
                    job-card
                    group
                    relative
                    flex
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    text-black
                    transition-all
                    duration-500
                    hover:-translate-y-1
                  "
                >

                  {/* TOP RED ACCENT */}

                  <div
                    className="
                      absolute
                      left-0
                      top-0
                      h-1
                      w-full
                      origin-left
                      scale-x-0
                      bg-[#EF3B3A]
                      transition-transform
                      duration-500
                      group-hover:scale-x-100
                    "
                  />

                  {/* CARD CONTENT */}

                  <div
                    className="
                      flex
                      flex-1
                      flex-col
                      p-5
                      sm:p-6
                      md:p-6
                    "
                  >

                    {/* NUMBER + DEPARTMENT */}

                    <div className="flex items-start justify-between">
                      <span
                        className="
                          text-[10px]
                          font-medium
                          uppercase
                          tracking-[0.12em]
                          text-black/45
                        "
                      >
                        {job.department}
                      </span>

                      <span
                        className="
                          text-xs
                          font-semibold
                          text-black/25
                        "
                      >
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </div>

                    {/* JOB TITLE */}

                    <h3
                      className="
                        mt-4
                        max-w-sm
                        text-xl
                        font-semibold
                        leading-tight
                        tracking-tight
                        transition-colors
                        duration-300
                        group-hover:text-[#EF3B3A]
                        sm:mt-5
                        sm:text-2xl
                      "
                    >
                      {job.title}
                    </h3>

                    {/* SHORT DESCRIPTION */}

                    <p
                      className="
                        mt-2.5
                        line-clamp-3
                        text-sm
                        leading-6
                        text-black/55
                        sm:mt-3
                      "
                    >
                      {getJobDescription(job)}
                    </p>

                    {/* META */}

                    <div
                      className="
                        mt-5
                        flex
                        flex-col
                        gap-2
                        border-t
                        border-black/10
                        pt-4
                      "
                    >

                      {/* Location */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        <span
                          className="
                            shrink-0
                            text-[10px]
                            uppercase
                            tracking-[0.12em]
                            text-black/40
                          "
                        >
                          Location
                        </span>

                        <span
                          className="
                            text-right
                            text-xs
                            font-medium
                            text-black/70
                          "
                        >
                          {job.location || "-"}
                        </span>
                      </div>

                      {/* Employment Type */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        <span
                          className="
                            shrink-0
                            text-[10px]
                            uppercase
                            tracking-[0.12em]
                            text-black/40
                          "
                        >
                          Type
                        </span>

                        <span
                          className="
                            text-right
                            text-xs
                            font-medium
                            text-black/70
                          "
                        >
                          {job.employmentType || "-"}
                        </span>
                      </div>

                      {/* Experience */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        <span
                          className="
                            shrink-0
                            text-[10px]
                            uppercase
                            tracking-[0.12em]
                            text-black/40
                          "
                        >
                          Experience
                        </span>

                        <span
                          className="
                            text-right
                            text-xs
                            font-medium
                            text-black/70
                          "
                        >
                          {job.experience || "-"}
                        </span>
                      </div>
                    </div>

                    {/* =================================================
                        ACTION BUTTONS
                    ================================================= */}

                    <div
                      className="
                        mt-4
                        flex
                        flex-col
                        gap-2
                        sm:mt-5
                      "
                    >

                      {/* VIEW DETAILS */}

                      <button
                        type="button"
                        onClick={() =>
                          openJobDetails(job)
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-between
                          border
                          border-black
                          bg-white
                          px-4
                          py-3
                          text-xs
                          font-medium
                          uppercase
                          tracking-[0.15em]
                          text-black
                          transition-all
                          duration-300
                          hover:border-[#EF3B3A]
                          hover:bg-[#EF3B3A]
                          hover:text-white
                          sm:px-5
                          sm:py-3.5
                        "
                      >
                        <span>
                          View Details
                        </span>

                        <span
                          className="
                            text-base
                            transition-transform
                            duration-300
                          "
                        >
                          →
                        </span>
                      </button>

                      {/* APPLY NOW */}

                      <button
                        type="button"
                        onClick={() =>
                          openApplicationForm(job)
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-between
                          bg-black
                          px-4
                          py-3
                          text-xs
                          font-medium
                          uppercase
                          tracking-[0.15em]
                          text-white
                          transition-all
                          duration-300
                          hover:bg-[#EF3B3A]
                          sm:px-5
                          sm:py-3.5
                        "
                      >
                        <span>
                          Apply Now
                        </span>

                        <span
                          className="
                            text-base
                            transition-transform
                            duration-300
                            group-hover:translate-x-1
                          "
                        >
                          →
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          JOB DETAILS MODAL
      ===================================================== */}

      {detailsJob && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            overflow-hidden
            bg-black/80
            p-4
            backdrop-blur-md
            sm:p-5
          "
          onClick={closeJobDetails}
        >
          {/* MODAL CONTAINER */}

          <div
            className="
              relative
              max-h-[90vh]
              w-full
              max-w-3xl
              overflow-hidden
              rounded-2xl
              bg-white
              text-black
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* SCROLLABLE CONTENT */}

            <div
              className="
                max-h-[90vh]
                overflow-y-auto
                p-5
                sm:p-7
                md:p-9
              "
            >
              {/* CLOSE BUTTON */}

              <button
                type="button"
                onClick={closeJobDetails}
                className="
                  absolute
                  right-4
                  top-4
                  z-10
                  flex
                  h-9
                  w-9
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
                "
                aria-label="Close job details"
              >
                ×
              </button>

              {/* =================================================
                  HEADER
              ================================================= */}

              <div
                className="
                  border-b
                  border-black/10
                  pb-5
                  pr-10
                  sm:pb-6
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
                  Job Details
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-semibold
                    leading-tight
                    tracking-tight
                    sm:text-3xl
                    md:text-4xl
                  "
                >
                  {detailsJob.title}
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    text-black/50
                    sm:text-base
                  "
                >
                  {detailsJob.department || "-"}
                </p>
              </div>

              {/* =================================================
                  JOB META
              ================================================= */}

              <div
                className="
                  grid
                  gap-5
                  border-b
                  border-black/10
                  py-6
                  sm:grid-cols-3
                  sm:gap-6
                "
              >
                {/* LOCATION */}

                <div>
                  <p
                    className="
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.15em]
                      text-black/40
                    "
                  >
                    Location
                  </p>

                  <p
                    className="
                      mt-1.5
                      text-sm
                      font-medium
                      text-black/80
                    "
                  >
                    {detailsJob.location || "-"}
                  </p>
                </div>

                {/* EMPLOYMENT TYPE */}

                <div>
                  <p
                    className="
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.15em]
                      text-black/40
                    "
                  >
                    Employment Type
                  </p>

                  <p
                    className="
                      mt-1.5
                      text-sm
                      font-medium
                      text-black/80
                    "
                  >
                    {detailsJob.employmentType || "-"}
                  </p>
                </div>

                {/* EXPERIENCE */}

                <div>
                  <p
                    className="
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.15em]
                      text-black/40
                    "
                  >
                    Experience
                  </p>

                  <p
                    className="
                      mt-1.5
                      text-sm
                      font-medium
                      text-black/80
                    "
                  >
                    {detailsJob.experience || "-"}
                  </p>
                </div>
              </div>

              {/* =================================================
                  JOB DESCRIPTION
              ================================================= */}

              <div className="border-b border-black/10 py-6">
                <h3
                  className="
                    text-sm
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-black
                  "
                >
                  Job Description
                </h3>

                <p
                  className="
                    mt-3
                    whitespace-pre-line
                    text-sm
                    leading-7
                    text-black/65
                    sm:text-base
                  "
                >
                  {getJobDescription(detailsJob)}
                </p>
              </div>

              {/* =================================================
                  REQUIREMENTS
              ================================================= */}

              <div className="py-6">
                <h3
                  className="
                    text-sm
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-black
                  "
                >
                  Requirements
                </h3>

                <div
                  className="
                    mt-3
                    whitespace-pre-line
                    text-sm
                    leading-7
                    text-black/65
                    sm:text-base
                  "
                >
                  {getJobRequirements(detailsJob)}
                </div>
              </div>

              {/* =================================================
                  APPLY BUTTON
              ================================================= */}

              <div
                className="
                  border-t
                  border-black/10
                  pt-6
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    openApplicationForm(detailsJob)
                  }
                  className="
                    inline-flex
                    items-center
                    gap-5
                    bg-black
                    px-5
                    py-3
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.15em]
                    text-white
                    transition-all
                    duration-300
                    hover:bg-[#EF3B3A]
                  "
                >
                  <span>
                    Apply for this role
                  </span>

                  <span className="text-base">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          APPLICATION FORM
          NOTE:
          JobApplicationForm remains a separate component.
      ===================================================== */}

      {isApplicationFormOpen && (
        <JobApplicationForm
          selectedJob={selectedJob}
          onClose={closeApplicationForm}
        />
      )}
    </>
  );
};

export default Jobs;