import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const capabilities = [
  {
    number: "01",
    title: "Enterprise Data Management",
    short: "Enterprise Data",
    description:
      "Create trusted, connected and governed data foundations that help organizations make confident business decisions.",
    keywords: ["Governance", "Data Quality", "Architecture"],
  },
  {
    number: "02",
    title: "Data Migration",
    short: "Data Migration",
    description:
      "Move critical enterprise data with structured planning, controlled execution and a focus on business continuity.",
    keywords: ["Migration", "Modernization", "Transformation"],
  },
  {
    number: "03",
    title: "ETL & Integration",
    short: "Integration",
    description:
      "Connect systems, applications and data environments to create a seamless flow of information across the enterprise.",
    keywords: ["ETL", "Integration", "Connectivity"],
  },
  {
    number: "04",
    title: "Cutover Management",
    short: "Cutover",
    description:
      "Coordinate complex transformation programs with structured cutover planning, execution and transition support.",
    keywords: ["Planning", "Execution", "Transition"],
  },
  {
    number: "05",
    title: "Master Data Management",
    short: "Master Data",
    description:
      "Build consistent and trusted master data across business functions to improve control, accuracy and operational efficiency.",
    keywords: ["MDM", "Governance", "Quality"],
  },
  {
    number: "06",
    title: "AI-Powered Innovation",
    short: "AI Innovation",
    description:
      "Apply intelligent technologies to uncover new possibilities, automate processes and create data-driven business value.",
    keywords: ["AI", "Automation", "Intelligence"],
  },
  {
    number: "07",
    title: "Talent",
    short: "Talent",
    description:
      "Bring together specialized technology expertise and business understanding to support transformation initiatives.",
    keywords: ["Expertise", "Delivery", "Collaboration"],
  },
  {
    number: "08",
    title: "Analytics & Reporting",
    short: "Analytics",
    description:
      "Transform complex enterprise data into meaningful insights that support faster and better business decisions.",
    keywords: ["Analytics", "Reporting", "Insights"],
  },
  {
    number: "09",
    title: "Services & AMS",
    short: "Services",
    description:
      "Support business-critical environments through structured application management and continuous improvement.",
    keywords: ["Support", "AMS", "Optimization"],
  },
];

const Capabilities = () => {
  const sectionRef = useRef(null);
  const displayRef = useRef(null);

  const [activeCapability, setActiveCapability] = useState(0);

  /* =========================================================
     SECTION ANIMATION
  ========================================================= */

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".capabilities-heading", {
        scrollTrigger: {
          trigger: ".capabilities-section",
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        y: 35,
        duration: 0.8,
        ease: "power3.out",
      });

      /*
        IMPORTANT:
        No opacity: 0 + ScrollTrigger dependency for the list.
        The list will animate normally when the section loads,
        so it can never remain invisible.
      */

      gsap.fromTo(
        ".capability-list-item",
        {
          opacity: 0,
          x: -20,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.55,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.15,
        }
      );

      gsap.from(".capability-display", {
        scrollTrigger: {
          trigger: ".capability-display",
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        x: 25,
        duration: 0.8,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* =========================================================
     ACTIVE CAPABILITY ANIMATION
  ========================================================= */

  useLayoutEffect(() => {
    if (!displayRef.current) return;

    gsap.fromTo(
      displayRef.current,
      {
        opacity: 0,
        y: 18,
        filter: "blur(6px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.55,
        ease: "power3.out",
      }
    );
  }, [activeCapability]);

  const currentCapability = capabilities[activeCapability];

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      className="
        capabilities-section
        bg-white
        px-6
        py-16
        text-black
        md:px-12
        md:py-20
        lg:px-16
        lg:py-24
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADING
        ================================================== */}

        <div className="max-w-4xl">

          <p
            className="
              text-xs
              font-medium
              uppercase
              tracking-widest
              text-red-500
            "
          >
            Capabilities
          </p>

          <h2
            className="
              capabilities-heading
              mt-4
              text-4xl
              font-semibold
              leading-tight
              tracking-tight
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
            "
          >
            Capabilities
            <br />
            built for{" "}
            <span className="text-black/25">
              transformation.
            </span>
          </h2>

        </div>

        {/* =================================================
            MAIN CAPABILITY AREA
        ================================================== */}

        <div
          className="
            mt-10
            grid
            gap-8
            lg:grid-cols-5
            lg:gap-10
          "
        >

          {/* =================================================
              LEFT — CAPABILITY LIST
          ================================================== */}

          <div
            className="
              capability-list
              lg:col-span-2
            "
          >

            {/* Top accent */}

            <div className="h-px w-full bg-black/10" />

            {capabilities.map((item, index) => (
              <button
                key={item.number}
                type="button"
                onClick={() => setActiveCapability(index)}
                className={`
                  capability-list-item
                  group
                  flex
                  w-full
                  items-center
                  justify-between
                  gap-4
                  border-b
                  border-black/10
                  py-4
                  text-left
                  transition-all
                  duration-300
                  md:py-5
                  ${
                    activeCapability === index
                      ? "pl-3"
                      : "hover:pl-2"
                  }
                `}
              >

                <div className="flex items-center gap-4">

                  {/* Number */}

                  <span
                    className={`
                      min-w-7
                      text-xs
                      font-medium
                      tracking-widest
                      transition-colors
                      duration-300
                      ${
                        activeCapability === index
                          ? "text-red-500"
                          : "text-black/30"
                      }
                    `}
                  >
                    {item.number}
                  </span>

                  {/* Title */}

                  <span
                    className={`
                      text-base
                      font-medium
                      tracking-tight
                      transition-colors
                      duration-300
                      md:text-lg
                      ${
                        activeCapability === index
                          ? "text-black"
                          : "text-black/50 group-hover:text-black"
                      }
                    `}
                  >
                    {item.title}
                  </span>

                </div>

                {/* Arrow */}

                <span
                  className={`
                    text-lg
                    transition-all
                    duration-300
                    ${
                      activeCapability === index
                        ? "translate-x-0 text-red-500 opacity-100"
                        : "-translate-x-2 text-black/20 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }
                  `}
                >
                  →
                </span>

              </button>
            ))}

          </div>

          {/* =================================================
              RIGHT — ACTIVE CAPABILITY
          ================================================== */}

          <div
            className="
              capability-display
              relative
              overflow-hidden
              bg-black
              text-white
              lg:col-span-3
            "
          >

            {/* Subtle red glow */}

            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                h-64
                w-64
                rounded-full
                bg-red-500/10
                blur-3xl
              "
            />

            {/* Content */}

            <div
              ref={displayRef}
              className="
                relative
                z-10
                flex
                min-h-96
                flex-col
                justify-between
                p-8
                md:p-10
                lg:p-12
              "
            >

              {/* Top content */}

              <div>

                <div className="flex items-center justify-between">

                  <span
                    className="
                      text-sm
                      tracking-widest
                      text-red-500
                    "
                  >
                    {currentCapability.number}
                  </span>

                  <span
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      text-white/25
                    "
                  >
                    Capability
                  </span>

                </div>

                <h3
                  className="
                    mt-8
                    max-w-2xl
                    text-3xl
                    font-semibold
                    leading-tight
                    tracking-tight
                    sm:text-4xl
                    md:text-5xl
                  "
                >
                  {currentCapability.title}
                </h3>

                <p
                  className="
                    mt-5
                    max-w-xl
                    text-sm
                    leading-relaxed
                    text-white/50
                    md:text-base
                  "
                >
                  {currentCapability.description}
                </p>

              </div>

              {/* Bottom content */}

              <div className="mt-10">

                <div className="flex flex-wrap gap-2">

                  {currentCapability.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="
                        border
                        border-white/10
                        px-3
                        py-2
                        text-xs
                        uppercase
                        tracking-widest
                        text-white/45
                      "
                    >
                      {keyword}
                    </span>
                  ))}

                </div>

                <div className="mt-6 flex items-center gap-3">

                  <span className="h-px w-12 bg-red-500" />

                  <span
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      text-white/25
                    "
                  >
                    Proliant capability
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default Capabilities;