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

    // Keep the first industry visible on initial render.
    // Animation will still run when the user changes nodes.
    if (activeIndustry === 0) {
      gsap.set(detailRef.current, {
        opacity: 1,
        y: 0,
      });
      return;
    }

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
        px-5
        py-12
        text-white
        sm:px-8
        sm:py-14
        md:px-10
        md:py-16
        lg:px-14
        lg:py-20
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
              text-xs
              font-medium
              uppercase
              tracking-widest
              text-red-500
            "
          >
            Industries
          </p>

          <h2
            className="
              industries-heading
              mt-3
              max-w-3xl
              text-3xl
              font-semibold
              leading-tight
              tracking-tight
              sm:text-4xl
              md:text-5xl
              lg:text-6xl
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
            mt-8
            grid
            min-w-0
            gap-10
            lg:grid-cols-2
            lg:items-center
            lg:gap-12
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
              max-w-2xl
              sm:aspect-4/3
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-white/2
            "
          >

            {/* RED GLOW */}

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-48
                w-48
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-red-500/10
                blur-3xl
                sm:h-56
                sm:w-56
                md:h-64
                md:w-64
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
                h-20
                w-20
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-red-500
                bg-black
                shadow-lg
                sm:h-24
                sm:w-24
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
                    text-[9px]
                    font-medium
                    tracking-widest
                    text-red-500
                    sm:text-[10px]
                  "
                >
                  PROLIANT
                </div>

                <div
                  className="
                    mt-1
                    text-[8px]
                    uppercase
                    tracking-widest
                    text-white/45
                    sm:text-[9px]
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
              pr-3
              sm:pr-4
              md:pr-5
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
                text-3xl
                font-semibold
                leading-tight
                tracking-tight
                sm:text-4xl
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
                mt-5
                max-w-2xl
                space-y-3
                text-sm
                leading-relaxed
                text-white/75
                sm:text-base
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
                      mt-2
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
                mt-6
                flex
                items-center
                justify-between
                border-t
                border-white/10
                pt-4
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
        h-16
        w-16
        flex-col
        items-center
        justify-center
        rounded-full
        border
        px-2
        text-center
        transition-all
        duration-300
        sm:h-24
        sm:w-24
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
          text-[9px]
          font-medium
          tracking-widest
          sm:text-[10px]
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
          mt-1
          max-w-14
          sm:max-w-20
          md:max-w-20
          text-[9px]
          sm:text-[10px]
          md:text-xs
          font-medium
          leading-tight
          text-white
        "
      >
        {industry.title}
      </span>

      <Icon
        className={`
          mt-1
          h-3
          w-3
          sm:mt-2
          sm:h-4
          sm:w-4
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


// import { useLayoutEffect, useRef, useState } from "react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import {
//   HeartPulse,
//   ShieldCheck,
//   Factory,
//   ShoppingCart,
//   Monitor,
//   Dna,
// } from "lucide-react";

// gsap.registerPlugin(ScrollTrigger);

// const industries = [
//   {
//     number: "01",
//     title: "Healthcare",
//     description:
//       "Turning complex data environments into connected, actionable intelligence.",
//     icon: HeartPulse,
//   },
//   {
//     number: "02",
//     title: "Financial Services",
//     description:
//       "Helping financial organizations create trusted data and intelligent decision-making.",
//     icon: ShieldCheck,
//   },
//   {
//     number: "03",
//     title: "Manufacturing",
//     description:
//       "Connecting operational and enterprise data to improve visibility and performance.",
//     icon: Factory,
//   },
//   {
//     number: "04",
//     title: "Retail & Consumer",
//     description:
//       "Creating connected data experiences across customers, operations and business functions.",
//     icon: ShoppingCart,
//   },
//   {
//     number: "05",
//     title: "Technology",
//     description:
//       "Enabling technology organizations to scale their data and digital transformation.",
//     icon: Monitor,
//   },
//   {
//     number: "06",
//     title: "Life Sciences",
//     description:
//       "Building data foundations that support innovation, insight and transformation.",
//     icon: Dna,
//   },
// ];

// const Industries = () => {
//   const sectionRef = useRef(null);
//   const detailRef = useRef(null);
//   const coreRef = useRef(null);

//   const [activeIndustry, setActiveIndustry] = useState(0);

//   /* =====================================================
//      SECTION ANIMATIONS
//   ====================================================== */

//   useLayoutEffect(() => {
//     const ctx = gsap.context(() => {
//       const intro = gsap.timeline({
//         scrollTrigger: {
//           trigger: ".industries-section",
//           start: "top 80%",
//           once: true,
//         },
//       });

//       intro
//         .from(".industries-label", {
//           opacity: 0,
//           y: 20,
//           duration: 0.5,
//           ease: "power3.out",
//         })
//         .from(
//           ".industries-heading",
//           {
//             opacity: 0,
//             y: 45,
//             duration: 0.8,
//             ease: "power3.out",
//           },
//           "-=0.25"
//         )
//         .from(
//           ".industry-visual",
//           {
//             opacity: 0,
//             y: 30,
//             scale: 0.97,
//             duration: 0.8,
//             ease: "power3.out",
//           },
//           "-=0.3"
//         )
//         .from(
//           ".industry-detail",
//           {
//             opacity: 0,
//             x: 30,
//             duration: 0.7,
//             ease: "power3.out",
//           },
//           "-=0.45"
//         );

//       /* ---------------------------------------------
//          CORE ANIMATION
//       ---------------------------------------------- */

//       gsap.from(coreRef.current, {
//         scrollTrigger: {
//           trigger: ".industry-visual",
//           start: "top 75%",
//           once: true,
//         },
//         opacity: 0,
//         scale: 0.6,
//         duration: 0.9,
//         ease: "back.out(1.6)",
//       });
//     }, sectionRef);

//     return () => ctx.revert();
//   }, []);

//   /* =====================================================
//      ACTIVE INDUSTRY CHANGE
//   ====================================================== */

//   useLayoutEffect(() => {
//     if (!detailRef.current) return;

//     gsap.fromTo(
//       detailRef.current,
//       {
//         opacity: 0,
//         y: 18,
//       },
//       {
//         opacity: 1,
//         y: 0,
//         duration: 0.45,
//         ease: "power3.out",
//       }
//     );

//     if (coreRef.current) {
//       gsap.fromTo(
//         coreRef.current,
//         {
//           scale: 0.96,
//         },
//         {
//           scale: 1,
//           duration: 0.45,
//           ease: "back.out(1.8)",
//         }
//       );
//     }
//   }, [activeIndustry]);

//   const currentIndustry = industries[activeIndustry];

//   return (
//     <section
//       ref={sectionRef}
//       id="industries"
//       className="
//         industries-section
//         relative
//         overflow-hidden
//         bg-black
//         px-6
//         py-16
//         text-white
//         md:px-12
//         md:py-20
//         lg:px-16
//         lg:py-24
//       "
//     >
//       <div className="mx-auto max-w-7xl">

//         {/* =================================================
//             HEADING
//         ================================================== */}

//         <div>
//           <p
//             className="
//               industries-label
//               text-xs
//               font-medium
//               uppercase
//               tracking-widest
//               text-red-500
//             "
//           >
//             Industries
//           </p>

//           <h2
//             className="
//               industries-heading
//               mt-4
//               text-4xl
//               font-semibold
//               leading-tight
//               tracking-tight
//               sm:text-5xl
//               md:text-6xl
//             "
//           >
//             Technology with{" "}
//             <span className="text-white/25">
//               industry context.
//             </span>
//           </h2>
//         </div>

//         {/* =================================================
//             MAIN CONTENT
//         ================================================== */}

//         <div
//           className="
//             mt-10
//             grid
//             gap-10
//             lg:grid-cols-2
//             lg:gap-14
//           "
//         >

//           {/* =================================================
//               LEFT NETWORK
//           ================================================== */}

//           <div
//             className="
//               industry-visual
//               relative
//               aspect-4/3
//               overflow-hidden
//               border
//               border-white/10
//               bg-white/2
//             "
//           >

//             {/* ---------------------------------------------
//                 RED GLOW
//             ---------------------------------------------- */}

//             <div
//               className="
//                 pointer-events-none
//                 absolute
//                 left-1/2
//                 top-1/2
//                 h-64
//                 w-64
//                 -translate-x-1/2
//                 -translate-y-1/2
//                 rounded-full
//                 bg-red-500/10
//                 blur-3xl
//               "
//             />

//             {/* ---------------------------------------------
//                 CONNECTION LINES
//             ---------------------------------------------- */}

//             <svg
//               className="
//                 pointer-events-none
//                 absolute
//                 inset-0
//                 h-full
//                 w-full
//               "
//               viewBox="0 0 600 450"
//               preserveAspectRatio="none"
//             >

//               {/* 01 — Healthcare */}

//               <line
//                 x1="300"
//                 y1="225"
//                 x2="300"
//                 y2="75"
//                 stroke="rgba(255,255,255,0.16)"
//                 strokeWidth="1"
//               />

//               {/* 02 — Financial Services */}

//               <line
//                 x1="300"
//                 y1="225"
//                 x2="470"
//                 y2="145"
//                 stroke="rgba(255,255,255,0.16)"
//                 strokeWidth="1"
//               />

//               {/* 03 — Manufacturing */}

//               <line
//                 x1="300"
//                 y1="225"
//                 x2="470"
//                 y2="305"
//                 stroke="rgba(255,255,255,0.16)"
//                 strokeWidth="1"
//               />

//               {/* 04 — Retail & Consumer */}

//               <line
//                 x1="300"
//                 y1="225"
//                 x2="300"
//                 y2="375"
//                 stroke="rgba(255,255,255,0.16)"
//                 strokeWidth="1"
//               />

//               {/* 05 — Technology */}

//               <line
//                 x1="300"
//                 y1="225"
//                 x2="130"
//                 y2="305"
//                 stroke="rgba(255,255,255,0.16)"
//                 strokeWidth="1"
//               />

//               {/* 06 — Life Sciences */}

//               <line
//                 x1="300"
//                 y1="225"
//                 x2="130"
//                 y2="145"
//                 stroke="rgba(255,255,255,0.16)"
//                 strokeWidth="1"
//               />

//             </svg>

//             {/* =================================================
//                 INDUSTRY NODES
//             ================================================== */}

//             {/* 01 — Healthcare */}

//             <IndustryNode
//               industry={industries[0]}
//               active={activeIndustry === 0}
//               position={{
//                 left: "50%",
//                 top: "16.67%",
//               }}
//               onClick={() => setActiveIndustry(0)}
//             />

//             {/* 02 — Financial Services */}

//             <IndustryNode
//               industry={industries[1]}
//               active={activeIndustry === 1}
//               position={{
//                 left: "78.33%",
//                 top: "32.22%",
//               }}
//               onClick={() => setActiveIndustry(1)}
//             />

//             {/* 03 — Manufacturing */}

//             <IndustryNode
//               industry={industries[2]}
//               active={activeIndustry === 2}
//               position={{
//                 left: "78.33%",
//                 top: "67.78%",
//               }}
//               onClick={() => setActiveIndustry(2)}
//             />

//             {/* 04 — Retail & Consumer */}

//             <IndustryNode
//               industry={industries[3]}
//               active={activeIndustry === 3}
//               position={{
//                 left: "50%",
//                 top: "83.33%",
//               }}
//               onClick={() => setActiveIndustry(3)}
//             />

//             {/* 05 — Technology */}

//             <IndustryNode
//               industry={industries[4]}
//               active={activeIndustry === 4}
//               position={{
//                 left: "21.67%",
//                 top: "67.78%",
//               }}
//               onClick={() => setActiveIndustry(4)}
//             />

//             {/* 06 — Life Sciences */}

//             <IndustryNode
//               industry={industries[5]}
//               active={activeIndustry === 5}
//               position={{
//                 left: "21.67%",
//                 top: "32.22%",
//               }}
//               onClick={() => setActiveIndustry(5)}
//             />

//             {/* =================================================
//                 PROLIANT INTELLIGENCE
//             ================================================== */}

//             <div
//               ref={coreRef}
//               className="
//                 intelligence-core
//                 absolute
//                 left-1/2
//                 top-1/2
//                 z-20
//                 flex
//                 h-32
//                 w-32
//                 -translate-x-1/2
//                 -translate-y-1/2
//                 items-center
//                 justify-center
//                 rounded-full
//                 border
//                 border-red-500
//                 bg-black
//                 shadow-lg
//               "
//             >

//               <div className="text-center">

//                 <div
//                   className="
//                     text-xs
//                     font-medium
//                     tracking-widest
//                     text-red-500
//                   "
//                 >
//                   PROLIANT
//                 </div>

//                 <div
//                   className="
//                     mt-1
//                     text-xs
//                     uppercase
//                     tracking-widest
//                     text-white/45
//                   "
//                 >
//                   Intelligence
//                 </div>

//               </div>

//             </div>

//           </div>

//           {/* =================================================
//               RIGHT CONTENT
//           ================================================== */}

//           <div
//             ref={detailRef}
//             className="
//               industry-detail
//               flex
//               flex-col
//               justify-center
//               lg:px-4
//             "
//           >

//             <span
//               className="
//                 text-xs
//                 font-medium
//                 tracking-widest
//                 text-red-500
//               "
//             >
//               {currentIndustry.number}
//             </span>

//             <h3
//               className="
//                 mt-4
//                 text-4xl
//                 font-semibold
//                 leading-tight
//                 tracking-tight
//                 sm:text-5xl
//                 md:text-6xl
//               "
//             >
//               {currentIndustry.title}
//             </h3>

//             <p
//               className="
//                 mt-5
//                 max-w-xl
//                 text-base
//                 leading-relaxed
//                 text-white/45
//                 md:text-lg
//               "
//             >
//               {currentIndustry.description}
//             </p>

//             <div className="mt-8 h-px w-full bg-white/10" />

//             <div
//               className="
//                 mt-5
//                 flex
//                 items-center
//                 justify-between
//               "
//             >

//               <span
//                 className="
//                   text-xs
//                   uppercase
//                   tracking-widest
//                   text-white/25
//                 "
//               >
//                 Industry Focus
//               </span>

//               <span
//                 className="
//                   text-lg
//                   text-red-500
//                   transition-transform
//                   duration-300
//                   hover:translate-x-2
//                 "
//               >
//                 →
//               </span>

//             </div>

//           </div>

//         </div>

//       </div>
//     </section>
//   );
// };

// /* =========================================================
//    INDUSTRY NODE
// ========================================================= */

// const IndustryNode = ({
//   industry,
//   active,
//   position,
//   onClick,
// }) => {
//   const Icon = industry.icon;

//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       aria-label={`Select ${industry.title}`}
//       style={{
//         position: "absolute",
//         left: position.left,
//         top: position.top,
//         transform: "translate(-50%, -50%)",
//       }}
//       className={`
//         industry-node
//         z-30
//         flex
//         h-24
//         w-24
//         flex-col
//         items-center
//         justify-center
//         rounded-full
//         border
//         text-center
//         transition-all
//         duration-300
//         sm:h-28
//         sm:w-28
//         ${
//           active
//             ? "scale-105 border-red-500 bg-black shadow-lg"
//             : "border-white/20 bg-black hover:scale-105 hover:border-white/40"
//         }
//       `}
//     >

//       <span
//         className={`
//           text-xs
//           font-medium
//           tracking-widest
//           ${
//             active
//               ? "text-red-500"
//               : "text-white/40"
//           }
//         `}
//       >
//         {industry.number}
//       </span>

//       <span
//         className="
//           mt-1
//           max-w-20
//           text-xs
//           font-medium
//           leading-tight
//           text-white
//         "
//       >
//         {industry.title}
//       </span>

//       <Icon
//         className={`
//           mt-2
//           h-4
//           w-4
//           ${
//             active
//               ? "text-white"
//               : "text-white/45"
//           }
//         `}
//         strokeWidth={1.5}
//       />

//     </button>
//   );
// };

// export default Industries;