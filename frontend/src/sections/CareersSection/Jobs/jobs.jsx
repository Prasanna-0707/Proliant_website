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
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);

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
            start: "top 85%",
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
          y: isMobile ? 25 : 40,
          filter: isMobile ? "blur(4px)" : "blur(7px)",
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
    setIsApplicationFormOpen(true);
  };

  /* =====================================================
     CLOSE APPLICATION FORM
  ===================================================== */

  const closeApplicationForm = () => {
    setSelectedJob(null);
    setIsApplicationFormOpen(false);
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
            {jobs.map((job) => (
              <article
                key={job.id}
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

                  {/* DESCRIPTION */}

                  <p
                    className="
                      mt-2.5
                      text-sm
                      leading-6
                      text-black/55
                      sm:mt-3
                    "
                  >
                    {job.description}
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
                      mt-4
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
                      sm:mt-5
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
        </div>
      </section>

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