import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import edmImage from "@/assets/images/WhatWeDo/edm.jpg";
import cutoverImage from "@/assets/images/WhatWeDo/cutover.png";
import aiTechImage from "@/assets/images/WhatWeDo/ai_tech.png";
import amsImage from "@/assets/images/WhatWeDo/AMS.png";
import talentImage from "@/assets/images/WhatWeDo/talent.jpg";

gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   CAPABILITIES DATA
========================================================= */

const capabilities = [
  {
    number: "01",
    title: "Enterprise Data Management",
    image: edmImage,
    description:
      "Proliant Data provides enterprise-grade capabilities across governance, quality, migration, and analytics to accelerate digital transformation.",
    points: [
      "Enterprise-grade capabilities",
      "Data governance",
      "Data quality",
      "Data migration",
      "Data analytics",
      "Accelerates digital transformation",
    ],
  },

  {
    number: "02",
    title: "Cutover Management",
    image: cutoverImage,
    description: "Controlled, transparent ERP go-lives",
    points: [
      "Microsoft Project Online (MPP)",
      "Power Automate & Workflows",
      "Power BI Dashboards",
    ],
  },

  {
    number: "03",
    title: "AI-Powered Innovation",
    image: aiTechImage,
    description:
      "Driving transformation with next-generation tools, accelerators, and automation that enhance speed, accuracy, and decision-making.",
    points: [
      "Purpose-built tools to streamline digital transformations and address business pain points.",
      "AI-driven insights for smarter data management and analytics.",
      "Continuous innovation through dedicated R&D and solution engineering teams.",
    ],
  },

  {
    number: "04",
    title: "Application Management Services (AMS)",
    image: amsImage,
    description:
      "Continuous Support for Data-Driven Enterprise Operations",
    points: [
      "Our AMS offerings provide end-to-end application and data support to ensure stability, performance, and continuous improvement across enterprise systems.",
      "With deep expertise in Enterprise Data Management (EDM) and SAP Master Data Governance (MDG), we help organizations maintain trusted, high-quality data and streamline governance processes.",
    ],
  },

  {
    number: "05",
    title: "Talent",
    image: talentImage,
    description:
      "Proliant Data is defined by its people—trusted experts with deep experience, global diversity, and long-term commitment to client success.",
    points: [
      "Trusted Talent – Seasoned professionals with minimal attrition and strong continuity.",
      "Diverse & Global Team – Inclusive workforce with top IT backgrounds and onsite experience.",
      "SAP Migration & Cutover Expertise – Proven execution of complex ERP programs",
    ],
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
      /* -----------------------------------------
         HEADING
      ----------------------------------------- */

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

      /* -----------------------------------------
         DESKTOP / TABLET LIST
      ----------------------------------------- */

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

      /* -----------------------------------------
         MOBILE BUTTONS
      ----------------------------------------- */

      gsap.fromTo(
        ".capability-mobile-button",
        {
          opacity: 0,
          y: 15,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.15,
        }
      );

      /* -----------------------------------------
         RIGHT DISPLAY
      ----------------------------------------- */

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
        px-4
        py-6
        text-black
        sm:px-6
        md:px-12
        md:py-12
        lg:px-16
        lg:py-14
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
              mt-2
              text-2xl
              font-semibold
              leading-tight
              tracking-tight
              sm:mt-4
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
            "
          >
            Capabilities built for
            <span className="text-red-500"> transformation. </span>
          </h2>
        </div>

        {/* =================================================
            MOBILE CAPABILITY BUTTONS
            MOBILE ONLY
        ================================================== */}

        <div
          className="
            mt-4
            grid
            grid-cols-2
            gap-1.5
            md:hidden
          "
        >
          {capabilities.map((item, index) => (
            <button
              key={item.number}
              type="button"
              onClick={() => setActiveCapability(index)}
              className={`
                capability-mobile-button
                flex
                min-h-12
                w-full
                items-center
                justify-between
                rounded
                border
                px-2.5
                py-2
                text-left
                transition-all
                duration-300
                ${
                  activeCapability === index
                    ? "border-red-500 bg-black text-white"
                    : "border-black/10 bg-white text-black hover:border-black/30"
                }
                ${
                  index === capabilities.length - 1
                    ? "col-span-2"
                    : ""
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span
                  className="
                    text-xs
                    font-medium
                    leading-tight
                    tracking-tight
                  "
                >
                  {item.title}
                </span>
              </div>

              <span
                className={`
                  ml-1
                  shrink-0
                  text-sm
                  transition-transform
                  duration-300
                  ${
                    activeCapability === index
                      ? "translate-x-0 text-red-500"
                      : "-translate-x-1 text-black/20"
                  }
                `}
              >
                →
              </span>
            </button>
          ))}
        </div>

        {/* =================================================
            MAIN CAPABILITY AREA
        ================================================== */}

        <div
          className="
            mt-4
            grid
            items-start
            gap-4
            md:gap-8
            lg:grid-cols-5
            lg:gap-10
          "
        >

          {/* =================================================
              DESKTOP / TABLET
              CAPABILITY LIST
          ================================================== */}

          <div
            className="
              capability-list
              hidden
              md:block
              lg:col-span-2
            "
          >

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
              RIGHT — ACTIVE CAPABILITY CARD
          ================================================== */}

          <div
            className="
              capability-display
              relative
              self-start
              overflow-hidden
              bg-black
              text-white
              md:col-span-1
              lg:col-span-3
            "
          >

            {/* BACKGROUND IMAGE */}

            <img
              key={currentCapability.image}
              src={currentCapability.image}
              alt=""
              aria-hidden="true"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                opacity-50
              "
            />

            {/* DARK OVERLAY */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-black/35
              "
            />

            {/* SUBTLE RED GLOW */}

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

            {/* =================================================
                CARD CONTENT
            ================================================== */}

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

              {/* TOP CONTENT */}

              <div>

                {/* LABEL */}

                <p
                  className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-widest
                    text-red-400
                  "
                >
                  Capability
                </p>

                {/* TITLE */}

                <h3
                  className="
                    mt-5
                    max-w-4xl
                    text-3xl
                    font-semibold
                    leading-tight
                    tracking-tight
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  {currentCapability.title}
                </h3>

                {/* DESCRIPTION */}

                <p
                  className="
                    mt-6
                    max-w-3xl
                    text-sm
                    leading-relaxed
                    text-white/75
                    md:text-base
                    lg:text-lg
                  "
                >
                  {currentCapability.description}
                </p>

                {/* =================================================
                    POINTS

                    ONLY ENTERPRISE DATA MANAGEMENT (01)
                    WILL USE 2 COLUMNS.

                    ALL OTHER CARDS REMAIN SINGLE COLUMN.
                ================================================== */}

                <ul
                  className={`
                    mt-7
                    md:mt-8
                    ${
                      currentCapability.number === "01"
                        ? "grid grid-cols-1 gap-y-3 md:grid-cols-2 md:gap-x-8 md:gap-y-4"
                        : "space-y-3 md:space-y-4"
                    }
                  `}
                >
                  {currentCapability.points.map((point) => (
                    <li
                      key={point}
                      className="
                        flex
                        items-start
                        gap-3
                        text-sm
                        leading-relaxed
                        text-white/80
                        md:text-base
                      "
                    >
                      <span className="mt-1 text-white">
                        •
                      </span>

                      <span>
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>

              </div>

              {/* =================================================
                  BOTTOM ACCENT
              ================================================== */}

              <div className="mt-10">

                <div className="flex items-center gap-3">

                  <span className="h-px w-12 bg-red-500" />

                  <span
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      text-white/30
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