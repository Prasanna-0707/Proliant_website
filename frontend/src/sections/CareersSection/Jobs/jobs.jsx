import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import JobApplicationForm from "../../../components/common/JobApplicationForm";

gsap.registerPlugin(ScrollTrigger);

/* =====================================================
   DUMMY SAP JOB DATA
===================================================== */

const jobs = [
  {
    id: 1,
    number: "01",
    title: "SAP S/4HANA Consultant",
    department: "SAP Solutions",
    location: "Hyderabad / Remote",
    type: "Full Time",
    experience: "3+ Years",
    description:
      "Work with enterprise clients to implement, configure and optimize SAP S/4HANA solutions across key business processes.",
  },
  {
    id: 2,
    number: "02",
    title: "SAP MM Consultant",
    department: "SAP Materials Management",
    location: "Hyderabad / Remote",
    type: "Full Time",
    experience: "2+ Years",
    description:
      "Support procurement and inventory processes by designing and implementing SAP MM solutions aligned with business requirements.",
  },
  {
    id: 3,
    number: "03",
    title: "SAP SD Consultant",
    department: "SAP Sales & Distribution",
    location: "Hyderabad / Remote",
    type: "Full Time",
    experience: "2+ Years",
    description:
      "Configure and support SAP SD processes including sales orders, deliveries, billing, pricing and end-to-end order management.",
  },
  {
    id: 4,
    number: "04",
    title: "SAP FICO Consultant",
    department: "SAP Finance",
    location: "Hyderabad / Remote",
    type: "Full Time",
    experience: "3+ Years",
    description:
      "Deliver SAP finance solutions across financial accounting and controlling while helping organizations improve financial processes.",
  },
  {
    id: 5,
    number: "05",
    title: "SAP Data Migration Consultant",
    department: "SAP Data & Migration",
    location: "Hyderabad / Remote",
    type: "Full Time",
    experience: "3+ Years",
    description:
      "Plan and execute enterprise SAP data migration activities while ensuring data quality, validation and successful system transition.",
  },
  {
    id: 6,
    number: "06",
    title: "SAP ABAP Developer",
    department: "SAP Technology",
    location: "Hyderabad / Remote",
    type: "Full Time",
    experience: "2+ Years",
    description:
      "Develop, enhance and maintain SAP applications using ABAP while collaborating with functional teams to deliver reliable enterprise solutions.",
  },
];

/* =====================================================
   JOBS COMPONENT
===================================================== */

const Jobs = () => {
  const sectionRef = useRef(null);

  const [selectedJob, setSelectedJob] = useState(null);

  /* =====================================================
     GSAP ANIMATIONS
  ===================================================== */

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /*
        Keep animations lighter on smaller screens
        to avoid unnecessary scroll load/stutter.
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
            start: "top 80%",
            toggleActions: "play none none reverse",
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
          y: isMobile ? 30 : 50,
          filter: isMobile ? "blur(5px)" : "blur(8px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: isMobile ? 0.7 : 0.9,
          stagger: isMobile ? 0.08 : 0.12,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
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
          y: isMobile ? 15 : 25,
        },
        {
          opacity: 1,
          y: 0,
          duration: isMobile ? 0.55 : 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      /* =================================================
         INDIVIDUAL JOB CARDS

         Every card gets its own ScrollTrigger.
         So 5, 10 or 20 cards will work correctly.
      ================================================= */

      const jobCards = gsap.utils.toArray(".job-card");

      jobCards.forEach((card) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: isMobile ? 25 : 45,
          },
          {
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.55 : 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* =====================================================
     OPEN APPLICATION FORM
  ===================================================== */

  const openApplicationForm = (job) => {
    setSelectedJob(job);
  };

  /* =====================================================
     CLOSE APPLICATION FORM
  ===================================================== */

  const closeApplicationForm = () => {
    setSelectedJob(null);
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
          py-12
          text-white
          sm:px-6
          sm:py-14
          md:px-12
          md:py-24
          lg:px-20
          lg:py-28
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
              pb-7
              sm:pb-8
              md:pb-10
            "
          >
            <p
              className="
                jobs-label
                mb-4
                text-xs
                font-medium
                uppercase
                tracking-[0.25em]
                text-[#EF3B3A]
                sm:mb-5
                md:text-sm
              "
            >
              Open Positions
            </p>

            <div
              className="
                grid
                gap-5
                sm:gap-6
                md:gap-8
                lg:grid-cols-[1fr_0.6fr]
                lg:items-end
              "
            >
              <h2
                className="
                  text-[clamp(2rem,7vw,4.5rem)]
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
                Explore opportunities to work with SAP, enterprise data and
                technology while helping organizations transform the way they
                work.
              </p>
            </div>
          </div>

          {/* =================================================
              JOB CARDS

              Mobile       → 1 column
              Large mobile → 2 columns
              Tablet       → 2 columns
              Desktop      → 3 columns

              No unnecessary fixed height on mobile.
          ================================================= */}

          <div
            className="
              mt-8
              grid
              grid-cols-1
              gap-4
              sm:mt-10
              sm:grid-cols-2
              sm:gap-5
              md:mt-12
              md:gap-5
              lg:grid-cols-3
            "
          >
            {jobs.map((job) => (
              <article
                key={job.id}
                className="
                  job-card
                  group
                  relative
                  flex
                  min-h-0
                  flex-col
                  overflow-hidden
                  rounded-2xl
                  bg-white
                  text-black
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  md:min-h-105
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
                    md:p-7
                  "
                >
                  {/* NUMBER + DEPARTMENT */}

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
                    "
                  >
                    <span
                      className="
                        max-w-40
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-[0.12em]
                        text-black/45
                      "
                    >
                      {job.department}
                    </span>
                  </div>

                  {/* JOB TITLE */}

                  <h3
                    className="
                      mt-6
                      max-w-sm
                      text-xl
                      font-semibold
                      leading-tight
                      tracking-tight
                      transition-colors
                      duration-300
                      group-hover:text-[#EF3B3A]
                      sm:mt-7
                      sm:text-2xl
                      md:mt-8
                    "
                  >
                    {job.title}
                  </h3>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-black/55
                      sm:mt-4
                    "
                  >
                    {job.description}
                  </p>

                  {/* META */}

                  <div
                    className="
                      mt-6
                      flex
                      flex-col
                      gap-2
                      border-t
                      border-black/10
                      pt-4
                      sm:mt-auto
                      sm:pt-5
                    "
                  >
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
                        {job.location}
                      </span>
                    </div>

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
                        {job.experience}
                      </span>
                    </div>
                  </div>

                  {/* APPLY BUTTON */}

                  <button
                    type="button"
                    onClick={() => openApplicationForm(job)}
                    className="
                      mt-5
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
                      sm:mt-6
                      sm:px-5
                      sm:py-3.5
                    "
                  >
                    <span>Apply Now</span>

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
              </article>
            ))}
          </div>

          {/* =================================================
              BOTTOM NOTE
          ================================================= */}

          <div
            className="
              mt-8
              flex
              flex-col
              gap-3
              border-t
              border-white/10
              pt-5
              sm:mt-9
              sm:pt-6
              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <p
              className="
                text-xs
                uppercase
                tracking-[0.15em]
                text-white/30
              "
            >
              Can&apos;t find the right role?
            </p>

            <a
              href="#get-in-touch"
              className="
                group
                inline-flex
                w-fit
                items-center
                gap-3
                text-xs
                font-medium
                uppercase
                tracking-[0.15em]
                text-[#EF3B3A]
              "
            >
              Let&apos;s connect

              <span
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              >
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================
          JOB APPLICATION FORM

          Render only when a job is selected.
          The separate component handles:
          - modal
          - body scroll lock
          - form scrolling
          - Lenis prevention
          - submission state
      ===================================================== */}

      {selectedJob && (
        <JobApplicationForm
          selectedJob={selectedJob}
          onClose={closeApplicationForm}
        />
      )}
    </>
  );
};

export default Jobs;