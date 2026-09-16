import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const applicationModalRef = useRef(null);

  const [selectedJob, setSelectedJob] = useState(null);

  // SUBMIT APPLICATION BUTTON STATE
  const [submitStatus, setSubmitStatus] = useState("idle");

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
     LOCK BACKGROUND PAGE SCROLL WHEN MODAL IS OPEN
  ===================================================== */

  useLayoutEffect(() => {
    if (!selectedJob) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    const previousBodyOverscroll =
      document.body.style.overscrollBehavior;

    const previousHtmlOverscroll =
      document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;

      document.body.style.overscrollBehavior =
        previousBodyOverscroll;

      document.documentElement.style.overscrollBehavior =
        previousHtmlOverscroll;
    };
  }, [selectedJob]);

  /* =====================================================
     FORCE MODAL WHEEL SCROLL
     
     IMPORTANT:
     The mouse wheel is attached directly to the
     white application form.

     This prevents the Careers page behind the modal
     from moving.
  ===================================================== */

  useEffect(() => {
    if (!selectedJob) {
      return;
    }

    const modal = applicationModalRef.current;

    if (!modal) {
      return;
    }

    const handleWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();

      modal.scrollTop += event.deltaY;
    };

    modal.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      modal.removeEventListener("wheel", handleWheel);
    };
  }, [selectedJob]);

  /* =====================================================
     OPEN APPLICATION FORM
  ===================================================== */

  const openApplicationForm = (job) => {
    setSelectedJob(job);
    setSubmitStatus("idle");

    requestAnimationFrame(() => {
      if (applicationModalRef.current) {
        applicationModalRef.current.scrollTop = 0;
      }
    });
  };

  /* =====================================================
     CLOSE APPLICATION FORM
  ===================================================== */

  const closeApplicationForm = () => {
    setSelectedJob(null);
    setSubmitStatus("idle");
  };

  /* =====================================================
     APPLICATION FORM SUBMIT
     
     NO POPUP / NO ALERT.
     
     After successful validation:
     Submit Application → ✓
  ===================================================== */

  const handleApplicationSubmit = (event) => {
    event.preventDefault();

    /*
      Check required fields first.
    */
    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    /*
      Show tick mark immediately.
    */
    setSubmitStatus("success");
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
          ================================================== */}

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
            overflow-hidden
            bg-black/80
            p-4
            backdrop-blur-md
            sm:p-5
          "
          onClick={closeApplicationForm}
          style={{
            overscrollBehavior: "none",
          }}
        >

          <div
            ref={applicationModalRef}
            className="
              relative
              max-h-[92vh]
              w-full
              max-w-2xl
              overflow-y-scroll
              overscroll-contain
              rounded-2xl
              bg-white
              p-5
              text-black
              shadow-2xl
              sm:p-6
              md:max-h-[90vh]
              md:p-8
            "
            onClick={(event) => event.stopPropagation()}
            style={{
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
              touchAction: "pan-y",
            }}
          >

            {/* =================================================
                CLOSE BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={closeApplicationForm}
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
              onSubmit={handleApplicationSubmit}
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
                  Full Name{" "}
                  <span className="text-[#EF3B3A]">*</span>
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
                    Email{" "}
                    <span className="text-[#EF3B3A]">*</span>
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
                    Phone Number{" "}
                    <span className="text-[#EF3B3A]">*</span>
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

                {/* EXPERIENCE */}

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
                    Resume{" "}
                    <span className="text-[#EF3B3A]">*</span>
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
                    defaultValue=""
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
                      focus:border-[#EF3B3A]
                    "
                  >

                    <option value="" disabled>
                      Select notice period
                    </option>

                    <option value="Immediately">
                      Immediately
                    </option>

                    <option value="15 Days">
                      15 Days
                    </option>

                    <option value="30 Days">
                      30 Days
                    </option>

                    <option value="90 Days">
                      90 Days
                    </option>

                  </select>

                </div>

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
                  SUBMIT APPLICATION
              ================================================== */}

              <button
                type="submit"
                disabled={submitStatus === "success"}
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
                  bg-[#EF3B3A]
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
                  disabled:cursor-default
                  sm:py-3.5
                "
              >

                {/* =================================================
                    NORMAL STATE
                ================================================== */}

                {submitStatus === "idle" && (
                  <>
                    <span>
                      Submit Application
                    </span>

                    <span
                      className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                      "
                    >
                      →
                    </span>
                  </>
                )}

                {/* =================================================
                    SUCCESS TICK
                ================================================== */}

                {submitStatus === "success" && (
                  <span
                    className="
                      text-xl
                      font-semibold
                      leading-none
                    "
                  >
                    ✓
                  </span>
                )}

              </button>

            </form>

          </div>
        </div>
      )}
    </>
  );
};

export default Jobs;