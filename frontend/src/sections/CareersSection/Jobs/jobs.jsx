import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
      /* =================================================
         SECTION LABEL
      ================================================= */

      gsap.fromTo(
        ".jobs-label",
        {
          opacity: 0,
          x: -25,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
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
          y: 50,
          filter: "blur(8px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          stagger: 0.12,
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
          y: 25,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
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
            y: 45,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
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
    document.body.style.overflow = "hidden";
  };

  /* =====================================================
     CLOSE APPLICATION FORM
  ===================================================== */

  const closeApplicationForm = () => {
    setSelectedJob(null);
    document.body.style.overflow = "";
  };

  return (
    <>
      {/* =====================================================
          JOBS SECTION
      ===================================================== */}

      <section
        ref={sectionRef}
        id="jobs"
        className="bg-black px-6 py-20 text-white md:px-12 md:py-24 lg:px-20 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">

          {/* =================================================
              SECTION HEADER
          ================================================= */}

          <div className="border-b border-white/10 pb-10">

            <p
              className="
                jobs-label
                mb-5
                text-xs
                font-medium
                uppercase
                tracking-[0.25em]
                text-[#EF3B3A]
                md:text-sm
              "
            >
              Open Positions
            </p>

            <div className="grid gap-8 lg:grid-cols-[1fr_0.6fr] lg:items-end">

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

              1 column  → mobile
              2 columns → tablet
              3 columns → desktop

              No fixed section height.
          ================================================= */}

          <div
            className="
              mt-12
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
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
                  min-h-105
                  flex-col
                  overflow-hidden
                  rounded-2xl
                  bg-white
                  text-black
                  transition-all
                  duration-500
                  hover:-translate-y-2
                "
              >

                {/* =================================================
                    TOP RED ACCENT
                ================================================== */}

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

                {/* =================================================
                    CARD CONTENT
                ================================================== */}

                <div className="flex flex-1 flex-col p-7">

                  {/* NUMBER + DEPARTMENT */}

                  <div className="flex items-start justify-between gap-4">

                    {/* <span
                      className="
                        text-xs
                        font-semibold
                        tracking-[0.2em]
                        text-[#EF3B3A]
                      "
                    >
                      {job.number}
                    </span> */}

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
                      mt-8
                      max-w-sm
                      text-2xl
                      font-semibold
                      leading-tight
                      tracking-tight
                      transition-colors
                      duration-300
                      group-hover:text-[#EF3B3A]
                    "
                  >
                    {job.title}
                  </h3>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      mt-4
                      text-sm
                      leading-6
                      text-black/55
                    "
                  >
                    {job.description}
                  </p>

                  {/* =================================================
                      META
                  ================================================== */}

                  <div
                    className="
                      mt-auto
                      flex
                      flex-col
                      gap-2
                      border-t
                      border-black/10
                      pt-5
                    "
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-[10px] uppercase tracking-[0.12em] text-black/40">
                        Location
                      </span>

                      <span className="text-xs font-medium text-black/70">
                        {job.location}
                      </span>

                    </div>

                    <div className="flex items-center justify-between">

                      <span className="text-[10px] uppercase tracking-[0.12em] text-black/40">
                        Experience
                      </span>

                      <span className="text-xs font-medium text-black/70">
                        {job.experience}
                      </span>

                    </div>

                  </div>

                  {/* =================================================
                      APPLY BUTTON
                  ================================================== */}

                  <button
                    type="button"
                    onClick={() => openApplicationForm(job)}
                    className="
                      mt-6
                      flex
                      w-full
                      items-center
                      justify-between
                      bg-black
                      px-5
                      py-3.5
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

              </article>
            ))}

          </div>

          {/* =================================================
              BOTTOM NOTE
          ================================================= */}

          <div
            className="
              mt-10
              flex
              flex-col
              gap-3
              border-t
              border-white/10
              pt-6
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

      {/* =========================================================
          APPLICATION FORM MODAL
      ========================================================= */}

      {selectedJob && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/80
            p-5
            backdrop-blur-md
          "
          onClick={closeApplicationForm}
        >

          <div
            className="
              relative
              max-h-[90vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-2xl
              bg-white
              p-6
              text-black
              shadow-2xl
              md:p-8
            "
            onClick={(event) => event.stopPropagation()}
          >

            {/* =================================================
                CLOSE BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={closeApplicationForm}
              className="
                absolute
                right-5
                top-5
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-black/10
                text-lg
                text-black/60
                transition-all
                duration-300
                hover:border-[#EF3B3A]
                hover:bg-[#EF3B3A]
                hover:text-white
              "
              aria-label="Close application form"
            >
              ×
            </button>

            {/* =================================================
                FORM HEADER
            ================================================== */}

            <div className="border-b border-black/10 pb-6 pr-10">

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
                  mt-3
                  text-3xl
                  font-semibold
                  tracking-tight
                  md:text-4xl
                "
              >
                Apply for this role
              </h2>

              <p className="mt-3 text-sm text-black/50 md:text-base">
                {selectedJob.title}
              </p>

            </div>

            {/* =================================================
                APPLICATION FORM
            ================================================== */}

            <form
              className="mt-7 space-y-5"
              onSubmit={(event) => {
                event.preventDefault();

                alert("Application form submitted successfully.");
              }}
            >

              {/* POSITION */}

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60">
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
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60">
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

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60">
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
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60">
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

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60">
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
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60">
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

              {/* QUALIFICATION */}

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60">
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
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60">
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
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60">
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
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-black/60">
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

              {/* SUBMIT */}

              <button
                type="submit"
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-lg
                  bg-black
                  px-6
                  py-4
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-white
                  transition-all
                  duration-300
                  hover:bg-[#EF3B3A]
                "
              >
                Submit Application

                <span className="text-base">
                  →
                </span>
              </button>

            </form>

          </div>
        </div>
      )}
    </>
  );
};

export default Jobs;