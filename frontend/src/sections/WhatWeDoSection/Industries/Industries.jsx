import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  HeartPulse,
  Stethoscope,
  Utensils,
  Rocket,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const industries = [
  {
    number: "01",
    title: "Global Healthcare Leader",
    description: [
      "Multi-country rollouts with evolving scope",
      "Limited visibility into data validation and cleansing",
      "Analyzed AMS tickets related to master data governance",
      "Reduced incidents by 50% through root-cause analysis and proactive resolution",
      "Automated high-volume validation reports using Power BI",
      "Significantly reduced business validation time and mitigated go-live risks",
      "Implemented configurable ETL and proprietary validation tools",
      "Deployed real-time yield dashboards for migration tracking",
      "Result: Seamless deployment, faster validation cycles, early data issue detection, real-time compliance visibility, and substantial cost savings",
    ],
    icon: HeartPulse,
  },

  {
    number: "02",
    title: "Leading eHealth Provider",
    description: [
      "Migrated 6B+ patient records with minimal downtime",
      "Needed to reduce cutover time without data loss",
      "Delivered optimized ETL pipelines and real-time dashboards",
      "Result: Cutover reduced to 4 days, integrated billing, and high data integrity",
    ],
    icon: Stethoscope,
  },

  {
    number: "03",
    title: "Top 10 U.S. Food Corporations",
    description: [
      "Legacy procurement and inventory data caused financial discrepancies.",
      "SAP configuration misaligned with business processes",
      "Built custom SAP solutions and accelerated value mapping",
      "Result: Accurate inventory reconciliation, improved financial reporting, and better decision-making",
    ],
    icon: Utensils,
  },

  {
    number: "04",
    title: "Defense & Aerospace Manufacturer",
    description: [
      "Unstructured legacy billing data and complex order-to-cash workflows",
      "Required SAP S/4HANA-ready data transformation",
      "Applied custom ETL and relevancy-based data mapping",
      "Result: SAP-ready data, streamlined operations, and auditable financial records",
    ],
    icon: Rocket,
  },
];

const Industries = () => {
  const sectionRef = useRef(null);
  const detailRef = useRef(null);
  const coreRef = useRef(null);

  // Tracks the previously rendered industry.
  // This prevents the initial industry from receiving
  // the active-industry animation twice.
  const previousIndustryRef = useRef(null);

  const [activeIndustry, setActiveIndustry] = useState(0);

  /*
   * =========================================================
   * SECTION ANIMATIONS
   * =========================================================
   */

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: ".industries-section",
          start: "top 80%",
          once: true,
        },
      });

      intro
        .from(".industries-label", {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: "power3.out",
        })
        .from(
          ".industries-heading",
          {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.25"
        )
        .from(
          ".industry-visual",
          {
            opacity: 0,
            y: 25,
            scale: 0.97,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.3"
        )
        .from(
          ".industry-detail",
          {
            opacity: 0,
            x: 30,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.45"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /*
   * =========================================================
   * CORE ANIMATION
   * =========================================================
   */

  useLayoutEffect(() => {
    if (!coreRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(coreRef.current, {
        scrollTrigger: {
          trigger: ".industry-visual",
          start: "top 75%",
          once: true,
        },
        opacity: 0,
        scale: 0.6,
        duration: 0.9,
        ease: "back.out(1.6)",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /*
   * =========================================================
   * ACTIVE INDUSTRY CHANGE
   * =========================================================
   */

  useLayoutEffect(() => {
    if (!detailRef.current) return;

    /*
     * IMPORTANT:
     *
     * The first industry is already animated by the
     * SECTION ANIMATION above.
     *
     * So we skip the active-industry animation on the
     * initial render.
     *
     * After that, only actual node changes animate
     * the right-side content.
     */

    if (previousIndustryRef.current === null) {
      previousIndustryRef.current = activeIndustry;
      return;
    }

    // No animation if the active industry hasn't changed.
    if (previousIndustryRef.current === activeIndustry) {
      return;
    }

    previousIndustryRef.current = activeIndustry;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        detailRef.current,
        {
          opacity: 0,
          y: 18,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
        }
      );

      if (coreRef.current) {
        gsap.fromTo(
          coreRef.current,
          {
            scale: 0.96,
          },
          {
            scale: 1,
            duration: 0.45,
            ease: "back.out(1.8)",
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [activeIndustry]);

  const currentIndustry = industries[activeIndustry];

  return (
    <section
      ref={sectionRef}
      id="industries"
      className="
        industries-section
        relative
        overflow-hidden
        bg-black
        px-4
        py-8
        text-white

        sm:px-6
        sm:py-10

        md:px-8
        md:py-12

        lg:px-10
        lg:py-14

        xl:px-14
        xl:py-20
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADING
        ================================================== */}

        <div>
          <p
            className="
              industries-label
              text-[10px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-red-500

              sm:text-xs
              sm:tracking-widest
            "
          >
            Industries
          </p>

          <h2
            className="
              industries-heading
              mt-2
              max-w-3xl
              text-2xl
              font-semibold
              leading-[1.08]
              tracking-tight

              sm:mt-3
              sm:text-3xl

              md:text-4xl

              lg:text-5xl

              xl:text-6xl
            "
          >
            Technology with{" "}
            <span className="text-white/25">
              industry context.
            </span>
          </h2>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================== */}

        <div
          className="
            mt-6
            grid
            min-w-0
            gap-7

            sm:mt-7
            sm:gap-8

            md:mt-8
            md:gap-8

            lg:mt-10
            lg:grid-cols-2
            lg:items-center
            lg:gap-10

            xl:gap-12
          "
        >

          {/* =================================================
              INDUSTRY NETWORK
          ================================================== */}

          <div
            className="
              industry-visual
              relative
              mx-auto
              aspect-square
              w-full
              max-w-[320px]
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-white/2

              sm:max-w-[420px]

              md:max-w-[500px]
              md:aspect-4/3

              lg:max-w-none
              lg:aspect-4/3
            "
          >

            {/* =================================================
                RED GLOW
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-32
                w-32
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-red-500/10
                blur-3xl

                sm:h-40
                sm:w-40

                md:h-48
                md:w-48

                lg:h-56
                lg:w-56

                xl:h-64
                xl:w-64
              "
            />

            {/* =================================================
                CONNECTION LINES
            ================================================== */}

            <svg
              className="
                pointer-events-none
                absolute
                inset-0
                h-full
                w-full
              "
              viewBox="0 0 600 600"
              preserveAspectRatio="none"
            >

              {/* 01 */}

              <line
                x1="300"
                y1="300"
                x2="300"
                y2="105"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
              />

              {/* 02 */}

              <line
                x1="300"
                y1="300"
                x2="495"
                y2="300"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
              />

              {/* 03 */}

              <line
                x1="300"
                y1="300"
                x2="300"
                y2="495"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
              />

              {/* 04 */}

              <line
                x1="300"
                y1="300"
                x2="105"
                y2="300"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
              />

            </svg>

            {/* =================================================
                INDUSTRY NODES
            ================================================== */}

            {/* 01 — GLOBAL HEALTHCARE */}

            <IndustryNode
              industry={industries[0]}
              active={activeIndustry === 0}
              position={{
                left: "50%",
                top: "17.5%",
              }}
              onClick={() => setActiveIndustry(0)}
            />

            {/* 02 — eHEALTH */}

            <IndustryNode
              industry={industries[1]}
              active={activeIndustry === 1}
              position={{
                left: "82.5%",
                top: "50%",
              }}
              onClick={() => setActiveIndustry(1)}
            />

            {/* 03 — FOOD */}

            <IndustryNode
              industry={industries[2]}
              active={activeIndustry === 2}
              position={{
                left: "50%",
                top: "82.5%",
              }}
              onClick={() => setActiveIndustry(2)}
            />

            {/* 04 — AEROSPACE */}

            <IndustryNode
              industry={industries[3]}
              active={activeIndustry === 3}
              position={{
                left: "17.5%",
                top: "50%",
              }}
              onClick={() => setActiveIndustry(3)}
            />

            {/* =================================================
                PROLIANT INTELLIGENCE
            ================================================== */}

            <div
              ref={coreRef}
              className="
                intelligence-core
                absolute
                left-1/2
                top-1/2
                z-20
                flex
                h-16
                w-16
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-red-500
                bg-black
                shadow-lg

                sm:h-20
                sm:w-20

                md:h-20
                md:w-20

                lg:h-24
                lg:w-24

                xl:h-28
                xl:w-28
              "
            >
              <div className="text-center">

                <div
                  className="
                    text-[8px]
                    font-medium
                    tracking-[0.12em]
                    text-red-500

                    sm:text-[9px]
                    sm:tracking-widest

                    md:text-[10px]

                    lg:text-xs
                  "
                >
                  PROLIANT
                </div>

                <div
                  className="
                    mt-1
                    text-[7px]
                    uppercase
                    tracking-[0.12em]
                    text-white/45

                    sm:text-[8px]
                    sm:tracking-widest

                    lg:text-[9px]
                  "
                >
                  Intelligence
                </div>

              </div>
            </div>

          </div>

          {/* =================================================
              RIGHT CONTENT
          ================================================== */}

          <div
            ref={detailRef}
            className="
              industry-detail
              flex
              min-w-0
              flex-col
              justify-center
              pr-1

              sm:pr-2

              md:pr-3

              lg:px-4

              xl:pr-6
            "
          >

            {/* =================================================
                INDUSTRY INDEX / HEADER
                COMMENTED — ADD BACK IF REQUIRED
            ================================================== */}

            {/*
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-white/10
                pb-3
              "
            >
              <span
                className="
                  text-xs
                  font-medium
                  tracking-widest
                  text-red-500
                "
              >
                {currentIndustry.number}
              </span>

              <span
                className="
                  text-xs
                  uppercase
                  tracking-widest
                  text-white/25
                "
              >
                Industry Focus
              </span>
            </div>
            */}

            {/* TITLE */}

            <h3
              className="
                mt-0
                max-w-2xl
                wrap-break-word
                text-2xl
                font-semibold
                leading-tight
                tracking-tight

                sm:text-3xl

                md:text-4xl

                lg:text-4xl

                xl:text-5xl
              "
            >
              {currentIndustry.title}
            </h3>

            {/* DESCRIPTION */}

            <div
              className="
                mt-4
                max-w-2xl
                space-y-2.5
                text-xs
                leading-relaxed
                text-white/75

                sm:mt-5
                sm:space-y-3
                sm:text-sm

                md:text-base

                lg:text-base

                xl:text-lg
              "
            >

              {currentIndustry.description.map((item, index) => (
                <div
                  key={index}
                  className="
                    flex
                    min-w-0
                    items-start
                    gap-3
                  "
                >

                  <span
                    className="
                      mt-1.5
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      bg-red-500
                    "
                  />

                  <span className="min-w-0 wrap-break-word">
                    {item}
                  </span>

                </div>
              ))}

            </div>

            {/* =================================================
                BOTTOM LABEL
            ================================================== */}

            <div
              className="
                mt-5
                flex
                items-center
                justify-between
                border-t
                border-white/10
                pt-3

                sm:mt-6
                sm:pt-4
              "
            >
              <span
                className="
                  text-[10px]
                  uppercase
                  tracking-widest
                  text-white/25

                  sm:text-xs
                "
              >
                Proliant Industry Expertise
              </span>

              <span
                className="
                  text-lg
                  text-red-500
                  transition-transform
                  duration-300
                  hover:translate-x-2
                "
              >
                →
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};


/* =========================================================
   INDUSTRY NODE
========================================================= */

const IndustryNode = ({
  industry,
  active,
  position,
  onClick,
}) => {
  const Icon = industry.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Select ${industry.title}`}
      style={{
        position: "absolute",
        left: position.left,
        top: position.top,
        transform: "translate(-50%, -50%)",
      }}
      className={`
        industry-node
        z-30
        flex
        h-14
        w-14
        flex-col
        items-center
        justify-center
        rounded-full
        border
        px-1.5
        text-center
        transition-all
        duration-300

        sm:h-20
        sm:w-20
        sm:px-2

        md:h-20
        md:w-20

        lg:h-24
        lg:w-24

        xl:h-28
        xl:w-28

        ${
          active
            ? "scale-105 border-red-500 bg-black shadow-lg shadow-red-500/10"
            : "border-white/20 bg-black hover:scale-105 hover:border-white/40"
        }
      `}
    >

      <span
        className={`
          text-[8px]
          font-medium
          tracking-widest

          sm:text-[9px]

          md:text-[10px]

          ${
            active
              ? "text-red-500"
              : "text-white/40"
          }
        `}
      >
        {industry.number}
      </span>

      <span
        className="
          mt-0.5
          max-w-12
          text-[8px]
          font-medium
          leading-tight
          text-white

          sm:mt-1
          sm:max-w-16
          sm:text-[9px]

          md:max-w-20
          md:text-[10px]

          lg:text-xs
        "
      >
        {industry.title}
      </span>

      <Icon
        className={`
          mt-1
          h-2.5
          w-2.5

          sm:h-3
          sm:w-3

          md:h-3.5
          md:w-3.5

          lg:mt-2
          lg:h-4
          lg:w-4

          ${
            active
              ? "text-white"
              : "text-white/45"
          }
        `}
        strokeWidth={1.5}
      />

    </button>
  );
};

export default Industries;