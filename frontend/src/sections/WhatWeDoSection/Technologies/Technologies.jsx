import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
  Later add your images here:

  import masterDataImage from "../assets/technologies/master-data.jpg";
  import dataMigrationImage from "../assets/technologies/data-migration.jpg";
  import etlIntegrationImage from "../assets/technologies/etl-integration.jpg";
  import databaseServerImage from "../assets/technologies/database-server.jpg";
  import analyticsReportingImage from "../assets/technologies/analytics-reporting.jpg";
*/

const technologyAreas = [
  {
    number: "01",
    title: (
      <>
        Master Data
        <br />
        Management &
        <br />
        Governance
      </>
    ),
    statement:
      "Ensuring trusted, compliant, and well-governed data.",
    technologies: [
      "SAP MDG",
      "Informatica MDM",
      "Reltio",
      "TIBCO EBX",
      "Collibra",
      "Alation",
      "Ataccama",
    ],

    // image: masterDataImage,
  },

  {
    number: "02",
    title: (
      <>
        Data
        <br />
        Migration
      </>
    ),
    statement:
      "Reliable enterprise data migrations at scale with ETL tool agnostic strategy for Extract & Transform complemented by SAP/ERP best practices for data load.",
    technologies: [
      "SAP DMC",
      "SAP Data Services",
      "Syniti ADM",
      "SAP Information Steward",
    ],

    // image: dataMigrationImage,
  },

  {
    number: "03",
    title: (
      <>
        ETL &
        <br />
        Integration
      </>
    ),
    statement:
      "Reliable SAP and enterprise migrations at scale.",
    technologies: [
      "SAP DMC",
      "SAP BODS",
      "Syniti ADM",
      "SAP Information Steward",
    ],

    // image: etlIntegrationImage,
  },

  {
    number: "04",
    title: (
      <>
        Database &
        <br />
        Server
        <br />
        Administration
      </>
    ),
    statement:
      "Optimized for resilience and high performance.",
    technologies: [
      "SSMS",
      "DB Administration & Monitoring",
      "Patch Upgrades",
      "Cloudification",
      "ETL/DB Server Deployment",
    ],

    // image: databaseServerImage,
  },

  {
    number: "05",
    title: (
      <>
        Analytics &
        <br />
        Reporting
      </>
    ),
    statement:
      "From data to insights for faster decisions.",
    technologies: [
      "Power BI",
      "Tableau",
      "QlikView",
      "SAP Analytics Cloud (SAC)",
      "SSRS",
    ],

    // image: analyticsReportingImage,
  },
];

const Technologies = () => {
  const sectionRef = useRef(null);
  const panelsRef = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".technology-intro", {
        scrollTrigger: {
          trigger: ".technology-section",
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      panelsRef.current.forEach((panel) => {
        if (!panel) return;

        const image = panel.querySelector(".technology-image");
        const content = panel.querySelector(".technology-content");
        const items = panel.querySelectorAll(".technology-item");

        gsap.from(panel, {
          scrollTrigger: {
            trigger: panel,
            start: "top 82%",
            once: true,
          },
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
        });

        if (image) {
          gsap.from(image, {
            scrollTrigger: {
              trigger: panel,
              start: "top 82%",
              once: true,
            },
            scale: 1.08,
            duration: 1.2,
            ease: "power3.out",
          });
        }

        gsap.from(content, {
          scrollTrigger: {
            trigger: panel,
            start: "top 78%",
            once: true,
          },
          opacity: 0,
          x: 30,
          duration: 0.7,
          delay: 0.1,
          ease: "power3.out",
        });

        gsap.from(items, {
          scrollTrigger: {
            trigger: panel,
            start: "top 75%",
            once: true,
          },
          opacity: 0,
          x: 15,
          stagger: 0.06,
          duration: 0.4,
          delay: 0.2,
          ease: "power2.out",
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="technologies"
      className="
        technology-section
        relative
        overflow-hidden
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
            INTRO
        ================================================== */}

        <div className="technology-intro mb-12 max-w-4xl md:mb-16">

          <p
            className="
              text-xs
              font-medium
              uppercase
              tracking-widest
              text-red-500
            "
          >
           Technologies
          </p>

          <h2
            className="
              mt-4
              max-w-3xl
              text-4xl
              font-semibold
              leading-tight
              tracking-tight
              sm:text-5xl
              md:text-6xl
            "
          >
            Technology that connects
            <br />
            <span className="text-black/20">
              the enterprise.
            </span>
          </h2>

        </div>

        {/* =================================================
            TECHNOLOGY SHOWCASE
        ================================================== */}

        <div className="space-y-6 md:space-y-8">

          {technologyAreas.map((technology, index) => (
            <article
              key={technology.number}
              ref={(element) => {
                panelsRef.current[index] = element;
              }}
              className="
                group
                relative
                min-h-96
                overflow-hidden
                border
                border-black/10
                bg-black
                md:min-h-112
                lg:min-h-125
              "
            >

              {/* =================================================
                  IMAGE
              ================================================== */}

              <div className="technology-image absolute inset-0">

                {technology.image ? (
                  <img
                    src={technology.image}
                    alt=""
                    className="
                      h-full
                      w-full
                      object-cover
                      grayscale
                      transition-transform
                      duration-1000
                      group-hover:scale-105
                    "
                  />
                ) : (
                  /*
                    Temporary black visual.

                    This keeps the page working until you add
                    the actual images.
                  */
                  <div
                    className="
                      h-full
                      w-full
                      bg-linear-to-br
                      from-neutral-700
                      via-neutral-950
                      to-black
                    "
                  >
                    <div
                      className="
                        absolute
                        inset-0
                        opacity-20
                      "
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
                        backgroundSize: "70px 70px",
                      }}
                    />

                    <div
                      className="
                        absolute
                        right-16
                        top-1/2
                        h-40
                        w-40
                        -translate-y-1/2
                        rounded-full
                        border
                        border-white/10
                      "
                    />

                    <div
                      className="
                        absolute
                        right-24
                        top-1/2
                        h-24
                        w-24
                        -translate-y-1/2
                        rounded-full
                        border
                        border-red-500/20
                      "
                    />
                  </div>
                )}

              </div>

              {/* =================================================
                  OVERLAYS
              ================================================== */}

              <div
                className="
                  absolute
                  inset-0
                  bg-black/45
                "
              />

              <div
                className="
                  absolute
                  inset-y-0
                  left-0
                  w-4/5
                  bg-linear-to-r
                  from-black
                  via-black/75
                  to-transparent
                "
              />

              <div
                className="
                  absolute
                  inset-y-0
                  right-0
                  w-1/2
                  bg-linear-to-l
                  from-black/70
                  to-transparent
                "
              />

              {/* =================================================
                  CONTENT
              ================================================== */}

              <div
                className="
                  relative
                  z-10
                  flex
                  min-h-96
                  flex-col
                  justify-between
                  p-7
                  md:min-h-112
                  md:p-10
                  lg:min-h-125
                  lg:p-12
                "
              >

                {/* TOP */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
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
                    {technology.number}
                  </span>

                  <span
                    className="
                      hidden
                      text-xs
                      uppercase
                      tracking-widest
                      text-white/30
                      md:block
                    "
                  >
                    Proliant Technologies
                  </span>

                </div>

                {/* MAIN CONTENT */}

                <div
                  className="
                    grid
                    gap-8
                    md:grid-cols-2
                    md:gap-12
                  "
                >

                  {/* TITLE */}

                  <div>

                    <h3
                      className="
                        text-4xl
                        font-semibold
                        leading-tight
                        tracking-tight
                        text-white
                        sm:text-5xl
                        md:text-6xl
                        lg:text-7xl
                      "
                    >
                      {technology.title}
                    </h3>

                  </div>

                  {/* DETAILS */}

                  <div
                    className="
                      technology-content
                      max-w-lg
                      self-end
                    "
                  >

                    <p
                      className="
                        text-sm
                        leading-relaxed
                        text-white/75
                        md:text-base
                      "
                    >
                      {technology.statement}
                    </p>

                    <div
                      className="
                        mt-5
                        border-t
                        border-white/15
                        pt-4
                      "
                    >

                      <p
                        className="
                          mb-3
                          text-xs
                          font-medium
                          uppercase
                          tracking-widest
                          text-white/30
                        "
                      >
                        Technology Focus
                      </p>

                      <ul className="space-y-1.5">

                        {technology.technologies.map((item) => (
                          <li
                            key={item}
                            className="
                              technology-item
                              flex
                              items-center
                              gap-3
                              text-sm
                              text-white/75
                            "
                          >

                            <span
                              className="
                                h-1.5
                                w-1.5
                                shrink-0
                                rounded-full
                                bg-red-500
                              "
                            />

                            <span>{item}</span>

                          </li>
                        ))}

                      </ul>

                    </div>

                  </div>

                </div>

                {/* BOTTOM */}

                <div
                  className="
                    mt-6
                    flex
                    items-center
                    justify-between
                    border-t
                    border-white/10
                    pt-3
                  "
                >

                  <span
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      text-white/20
                    "
                  >
                    Technology {technology.number}
                  </span>

                  <span
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      text-red-500
                      transition-transform
                      duration-300
                      group-hover:translate-x-2
                    "
                  >
                    Explore →
                  </span>

                </div>

              </div>

            </article>
          ))}

        </div>

        {/* =================================================
            CLOSING
        ================================================== */}

        <div
          className="
            mt-12
            border-t
            border-black/10
            pt-8
            md:mt-16
            md:pt-10
          "
        >

          <p
            className="
              max-w-4xl
              text-lg
              leading-relaxed
              text-black/45
              md:text-xl
            "
          >
            From data foundations and enterprise integration to
            analytics and intelligent transformation, Proliant
            connects the technology landscape around business
            outcomes.
          </p>

        </div>

      </div>
    </section>
  );
};

export default Technologies;









// import { useLayoutEffect, useRef } from "react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// import masterDataImage from "../assets/technologies/master-data.jpg";
// import dataMigrationImage from "../assets/technologies/data-migration.jpg";
// import etlIntegrationImage from "../assets/technologies/etl-integration.jpg";
// import databaseServerImage from "../assets/technologies/database-server.jpg";
// import analyticsReportingImage from "../assets/technologies/analytics-reporting.jpg";

// gsap.registerPlugin(ScrollTrigger);

// const technologyAreas = [
//   {
//     number: "01",
//     title: (
//       <>
//         Master Data
//         <br />
//         Management &
//         <br />
//         Governance
//       </>
//     ),
//     statement:
//       "Ensuring trusted, compliant, and well-governed data.",
//     technologies: [
//       "SAP MDG",
//       "Informatica MDM",
//       "Reltio",
//       "TIBCO EBX",
//       "Collibra",
//       "Alation",
//       "Ataccama",
//     ],
//     image: masterDataImage,
//   },

//   {
//     number: "02",
//     title: (
//       <>
//         Data
//         <br />
//         Migration
//       </>
//     ),
//     statement:
//       "Reliable enterprise data migrations at scale with ETL tool agnostic strategy for Extract & Transform complemented by SAP/ERP best practices for data load.",
//     technologies: [
//       "SAP DMC",
//       "SAP Data Services",
//       "Syniti ADM",
//       "SAP Information Steward",
//     ],
//     image: dataMigrationImage,
//   },

//   {
//     number: "03",
//     title: (
//       <>
//         ETL &
//         <br />
//         Integration
//       </>
//     ),
//     statement:
//       "Reliable SAP and enterprise migrations at scale.",
//     technologies: [
//       "SAP DMC",
//       "SAP BODS",
//       "Syniti ADM",
//       "SAP Information Steward",
//     ],
//     image: etlIntegrationImage,
//   },

//   {
//     number: "04",
//     title: (
//       <>
//         Database &
//         <br />
//         Server
//         <br />
//         Administration
//       </>
//     ),
//     statement:
//       "Optimized for resilience and high performance.",
//     technologies: [
//       "SSMS",
//       "DB Administration & Monitoring",
//       "Patch Upgrades",
//       "Cloudification",
//       "ETL/DB Server Deployment",
//     ],
//     image: databaseServerImage,
//   },

//   {
//     number: "05",
//     title: (
//       <>
//         Analytics &
//         <br />
//         Reporting
//       </>
//     ),
//     statement:
//       "From data to insights for faster decisions.",
//     technologies: [
//       "Power BI",
//       "Tableau",
//       "QlikView",
//       "SAP Analytics Cloud (SAC)",
//       "SSRS",
//     ],
//     image: analyticsReportingImage,
//   },
// ];

// const Technologies = () => {
//   const sectionRef = useRef(null);
//   const panelsRef = useRef([]);

//   useLayoutEffect(() => {
//     const ctx = gsap.context(() => {
//       gsap.from(".technology-intro", {
//         scrollTrigger: {
//           trigger: ".technology-section",
//           start: "top 75%",
//           once: true,
//         },
//         opacity: 0,
//         y: 35,
//         duration: 0.8,
//         ease: "power3.out",
//       });

//       panelsRef.current.forEach((panel) => {
//         if (!panel) return;

//         const image = panel.querySelector(".technology-image");
//         const content = panel.querySelector(".technology-content");
//         const number = panel.querySelector(".technology-number");
//         const listItems = panel.querySelectorAll(".technology-item");

//         gsap.from(panel, {
//           scrollTrigger: {
//             trigger: panel,
//             start: "top 80%",
//             once: true,
//           },
//           opacity: 0,
//           y: 50,
//           duration: 0.9,
//           ease: "power3.out",
//         });

//         gsap.from(image, {
//           scrollTrigger: {
//             trigger: panel,
//             start: "top 80%",
//             once: true,
//           },
//           scale: 1.12,
//           duration: 1.4,
//           ease: "power3.out",
//         });

//         gsap.from(content, {
//           scrollTrigger: {
//             trigger: panel,
//             start: "top 75%",
//             once: true,
//           },
//           opacity: 0,
//           x: 35,
//           duration: 0.8,
//           delay: 0.15,
//           ease: "power3.out",
//         });

//         gsap.from(number, {
//           scrollTrigger: {
//             trigger: panel,
//             start: "top 75%",
//             once: true,
//           },
//           opacity: 0,
//           x: -25,
//           duration: 0.6,
//           ease: "power3.out",
//         });

//         gsap.from(listItems, {
//           scrollTrigger: {
//             trigger: panel,
//             start: "top 70%",
//             once: true,
//           },
//           opacity: 0,
//           x: 15,
//           stagger: 0.07,
//           duration: 0.45,
//           delay: 0.25,
//           ease: "power2.out",
//         });
//       });
//     }, sectionRef);

//     return () => ctx.revert();
//   }, []);

//   return (
//     <section
//       ref={sectionRef}
//       id="technologies"
//       className="
//         technology-section
//         relative
//         overflow-hidden
//         bg-black
//         px-6
//         py-20
//         text-white
//         md:px-10
//         md:py-24
//         lg:px-16
//         lg:py-28
//       "
//     >
//       <div className="mx-auto max-w-7xl">

//         {/* =====================================================
//             INTRO
//         ====================================================== */}

//         <div className="technology-intro mb-14 max-w-4xl md:mb-20">

//           <p
//             className="
//               text-xs
//               font-medium
//               uppercase
//               tracking-widest
//               text-red-500
//             "
//           >
//             03 — Technologies
//           </p>

//           <h2
//             className="
//               mt-5
//               max-w-3xl
//               text-4xl
//               font-semibold
//               leading-tight
//               tracking-tight
//               sm:text-5xl
//               md:text-6xl
//             "
//           >
//             Technology that connects
//             <br />
//             <span className="text-white/25">
//               the enterprise.
//             </span>
//           </h2>

//         </div>

//         {/* =====================================================
//             TECHNOLOGY PANELS
//         ====================================================== */}

//         <div className="space-y-6 md:space-y-8">

//           {technologyAreas.map((technology, index) => (
//             <article
//               key={technology.number}
//               ref={(element) => {
//                 panelsRef.current[index] = element;
//               }}
//               className="
//                 technology-panel
//                 group
//                 relative
//                 min-h-135
//                 overflow-hidden
//                 border
//                 border-white/10
//                 bg-black
//                 md:min-h-145
//                 lg:min-h-155
//               "
//             >

//               {/* =================================================
//                   BACKGROUND IMAGE
//               ================================================== */}

//               <div className="absolute inset-0 overflow-hidden">

//                 <img
//                   src={technology.image}
//                   alt=""
//                   className="
//                     technology-image
//                     h-full
//                     w-full
//                     object-cover
//                     object-center
//                     grayscale
//                     transition-transform
//                     duration-1000
//                     ease-out
//                     group-hover:scale-105
//                   "
//                 />

//                 {/* Main dark overlay */}

//                 <div
//                   className="
//                     absolute
//                     inset-0
//                     bg-black/60
//                   "
//                 />

//                 {/* Left gradient */}

//                 <div
//                   className="
//                     absolute
//                     inset-y-0
//                     left-0
//                     w-2/3
//                     bg-linear-to-r
//                     from-black
//                     via-black/80
//                     to-transparent
//                   "
//                 />

//                 {/* Right gradient */}

//                 <div
//                   className="
//                     absolute
//                     inset-y-0
//                     right-0
//                     w-1/2
//                     bg-linear-to-l
//                     from-black/80
//                     to-transparent
//                   "
//                 />

//               </div>

//               {/* =================================================
//                   CONTENT
//               ================================================== */}

//               <div
//                 className="
//                   relative
//                   z-10
//                   flex
//                   min-h-135
//                   flex-col
//                   justify-between
//                   p-7
//                   md:min-h-145
//                   md:p-10
//                   lg:min-h-155
//                   lg:p-12
//                 "
//               >

//                 {/* TOP */}

//                 <div className="flex items-start justify-between">

//                   <span
//                     className="
//                       technology-number
//                       text-sm
//                       font-medium
//                       tracking-widest
//                       text-red-500
//                     "
//                   >
//                     {technology.number}
//                   </span>

//                   <span
//                     className="
//                       hidden
//                       text-xs
//                       uppercase
//                       tracking-widest
//                       text-white/30
//                       md:block
//                     "
//                   >
//                     Proliant Technologies
//                   </span>

//                 </div>

//                 {/* MAIN CONTENT */}

//                 <div
//                   className="
//                     grid
//                     gap-10
//                     md:grid-cols-2
//                     md:gap-16
//                   "
//                 >

//                   {/* TITLE */}

//                   <div>

//                     <h3
//                       className="
//                         text-4xl
//                         font-semibold
//                         leading-tight
//                         tracking-tight
//                         sm:text-5xl
//                         md:text-6xl
//                         lg:text-7xl
//                       "
//                     >
//                       {technology.title}
//                     </h3>

//                   </div>

//                   {/* RIGHT INFORMATION */}

//                   <div
//                     className="
//                       technology-content
//                       max-w-xl
//                       self-end
//                     "
//                   >

//                     <p
//                       className="
//                         text-base
//                         leading-relaxed
//                         text-white/80
//                         md:text-lg
//                       "
//                     >
//                       {technology.statement}
//                     </p>

//                     <div className="mt-7 border-t border-white/20 pt-5">

//                       <p
//                         className="
//                           mb-4
//                           text-xs
//                           font-medium
//                           uppercase
//                           tracking-widest
//                           text-white/35
//                         "
//                       >
//                         Technology Focus
//                       </p>

//                       <ul className="space-y-2">

//                         {technology.technologies.map((item) => (
//                           <li
//                             key={item}
//                             className="
//                               technology-item
//                               flex
//                               items-center
//                               gap-3
//                               text-sm
//                               text-white/75
//                               md:text-base
//                             "
//                           >
//                             <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />

//                             <span>{item}</span>
//                           </li>
//                         ))}

//                       </ul>

//                     </div>

//                   </div>

//                 </div>

//                 {/* BOTTOM */}

//                 <div
//                   className="
//                     mt-8
//                     flex
//                     items-center
//                     justify-between
//                     border-t
//                     border-white/10
//                     pt-4
//                   "
//                 >

//                   <span
//                     className="
//                       text-xs
//                       uppercase
//                       tracking-widest
//                       text-white/25
//                     "
//                   >
//                     Technology {technology.number}
//                   </span>

//                   <span
//                     className="
//                       text-xs
//                       uppercase
//                       tracking-widest
//                       text-red-500
//                       transition-transform
//                       duration-300
//                       group-hover:translate-x-2
//                     "
//                   >
//                     Explore
//                     <span className="ml-3">→</span>
//                   </span>

//                 </div>

//               </div>

//             </article>
//           ))}

//         </div>

//         {/* =====================================================
//             CLOSING STATEMENT
//         ====================================================== */}

//         <div
//           className="
//             mt-16
//             border-t
//             border-white/10
//             pt-10
//             md:mt-20
//             md:pt-12
//           "
//         >

//           <p
//             className="
//               max-w-4xl
//               text-xl
//               leading-relaxed
//               text-white/55
//               md:text-2xl
//             "
//           >
//             From enterprise data foundations to intelligent
//             analytics, Proliant connects the technologies that
//             move modern businesses forward.
//           </p>

//         </div>

//       </div>
//     </section>
//   );
// };

// export default Technologies;




// import { useLayoutEffect, useRef } from "react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// gsap.registerPlugin(ScrollTrigger);

// const technologyAreas = [
//   {
//     number: "01",
//     title: (
//       <>
//         Master Data
//         <br />
//         Management &
//         <br />
//         Governance
//       </>
//     ),
//     statement:
//       "Ensuring trusted, compliant, and well-governed data.",
//     technologies: [
//       "SAP MDG",
//       "Informatica MDM",
//       "Reltio",
//       "TIBCO EBX",
//       "Collibra",
//       "Alation",
//       "Ataccama",
//     ],
//     visual: "master",
//   },

//   {
//     number: "02",
//     title: (
//       <>
//         Data
//         <br />
//         Migration
//       </>
//     ),
//     statement:
//       "Reliable enterprise data migrations at scale with ETL tool agnostic strategy for Extract & Transform complemented by SAP/ERP best practices for data load.",
//     technologies: [
//       "SAP DMC",
//       "SAP Data Services",
//       "Syniti ADM",
//       "SAP Information Steward",
//     ],
//     visual: "migration",
//   },

//   {
//     number: "03",
//     title: (
//       <>
//         ETL &
//         <br />
//         Integration
//       </>
//     ),
//     statement:
//       "Reliable SAP and enterprise migrations at scale.",
//     technologies: [
//       "SAP DMC",
//       "SAP BODS",
//       "Syniti ADM",
//       "SAP Information Steward",
//     ],
//     visual: "etl",
//   },

//   {
//     number: "04",
//     title: (
//       <>
//         Database &
//         <br />
//         Server
//         <br />
//         Administration
//       </>
//     ),
//     statement:
//       "Optimized for resilience and high performance.",
//     technologies: [
//       "SSMS",
//       "DB Administration & Monitoring",
//       "Patch Upgrades",
//       "Cloudification",
//       "ETL/DB Server Deployment",
//     ],
//     visual: "database",
//   },

//   {
//     number: "05",
//     title: (
//       <>
//         Analytics &
//         <br />
//         Reporting
//       </>
//     ),
//     statement:
//       "From data to insights for faster decisions.",
//     technologies: [
//       "Power BI",
//       "Tableau",
//       "QlikView",
//       "SAP Analytics Cloud (SAC)",
//       "SSRS",
//     ],
//     visual: "analytics",
//   },
// ];

// const Technologies = () => {
//   const sectionRef = useRef(null);
//   const panelsRef = useRef([]);

//   useLayoutEffect(() => {
//     const ctx = gsap.context(() => {
//       gsap.from(".technology-intro", {
//         scrollTrigger: {
//           trigger: ".technology-section",
//           start: "top 80%",
//           once: true,
//         },
//         opacity: 0,
//         y: 30,
//         duration: 0.8,
//         ease: "power3.out",
//       });

//       panelsRef.current.forEach((panel) => {
//         if (!panel) return;

//         const content = panel.querySelector(".technology-content");
//         const visual = panel.querySelector(".technology-visual");
//         const items = panel.querySelectorAll(".technology-item");

//         gsap.from(panel, {
//           scrollTrigger: {
//             trigger: panel,
//             start: "top 82%",
//             once: true,
//           },
//           opacity: 0,
//           y: 35,
//           duration: 0.8,
//           ease: "power3.out",
//         });

//         gsap.from(visual, {
//           scrollTrigger: {
//             trigger: panel,
//             start: "top 82%",
//             once: true,
//           },
//           scale: 0.96,
//           duration: 1,
//           ease: "power3.out",
//         });

//         gsap.from(content, {
//           scrollTrigger: {
//             trigger: panel,
//             start: "top 78%",
//             once: true,
//           },
//           opacity: 0,
//           x: 25,
//           duration: 0.7,
//           delay: 0.1,
//           ease: "power3.out",
//         });

//         gsap.from(items, {
//           scrollTrigger: {
//             trigger: panel,
//             start: "top 75%",
//             once: true,
//           },
//           opacity: 0,
//           x: 15,
//           stagger: 0.06,
//           duration: 0.4,
//           delay: 0.2,
//           ease: "power2.out",
//         });
//       });
//     }, sectionRef);

//     return () => ctx.revert();
//   }, []);

//   return (
//     <section
//       ref={sectionRef}
//       id="technologies"
//       className="
//         technology-section
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

//         {/* ================================================
//             INTRO
//         ================================================= */}

//         <div className="technology-intro mb-12 max-w-4xl md:mb-16">

//           <p
//             className="
//               text-xs
//               font-medium
//               uppercase
//               tracking-widest
//               text-red-500
//             "
//           >
//             03 — Technologies
//           </p>

//           <h2
//             className="
//               mt-4
//               max-w-3xl
//               text-4xl
//               font-semibold
//               leading-tight
//               tracking-tight
//               sm:text-5xl
//               md:text-6xl
//             "
//           >
//             Technology that connects
//             <br />
//             <span className="text-white/25">
//               the enterprise.
//             </span>
//           </h2>

//         </div>

//         {/* ================================================
//             TECHNOLOGY PANELS
//         ================================================= */}

//         <div className="space-y-6 md:space-y-8">

//           {technologyAreas.map((technology, index) => (
//             <article
//               key={technology.number}
//               ref={(element) => {
//                 panelsRef.current[index] = element;
//               }}
//               className="
//                 group
//                 relative
//                 min-h-96
//                 overflow-hidden
//                 border
//                 border-white/10
//                 bg-neutral-950
//                 md:min-h-112
//               "
//             >

//               {/* ==========================================
//                   VISUAL AREA
//               =========================================== */}

//               <div
//                 className="
//                   technology-visual
//                   absolute
//                   inset-0
//                   overflow-hidden
//                 "
//               >

//                 {/* Base */}

//                 <div className="absolute inset-0 bg-neutral-950" />

//                 {/* Visual atmosphere */}

//                 <div
//                   className={`
//                     absolute
//                     inset-0
//                     transition-transform
//                     duration-1000
//                     group-hover:scale-105
//                     ${
//                       technology.visual === "master"
//                         ? "bg-gradient-to-br from-neutral-800 via-neutral-950 to-black"
//                         : technology.visual === "migration"
//                         ? "bg-gradient-to-tr from-neutral-700 via-neutral-950 to-black"
//                         : technology.visual === "etl"
//                         ? "bg-gradient-to-br from-neutral-900 via-neutral-700 to-black"
//                         : technology.visual === "database"
//                         ? "bg-gradient-to-tr from-neutral-800 via-black to-neutral-900"
//                         : "bg-gradient-to-br from-black via-neutral-800 to-neutral-950"
//                     }
//                   `}
//                 />

//                 {/* Abstract visual shapes */}

//                 <div
//                   className="
//                     absolute
//                     right-10
//                     top-10
//                     h-48
//                     w-48
//                     rounded-full
//                     border
//                     border-white/5
//                   "
//                 />

//                 <div
//                   className="
//                     absolute
//                     right-20
//                     top-20
//                     h-32
//                     w-32
//                     rounded-full
//                     border
//                     border-white/5
//                   "
//                 />

//                 <div
//                   className="
//                     absolute
//                     bottom-10
//                     right-10
//                     h-px
//                     w-1/2
//                     bg-white/10
//                   "
//                 />

//                 <div
//                   className="
//                     absolute
//                     bottom-20
//                     right-20
//                     h-px
//                     w-1/3
//                     bg-red-500/30
//                   "
//                 />

//                 {/* Dark overlays */}

//                 <div
//                   className="
//                     absolute
//                     inset-0
//                     bg-black/45
//                   "
//                 />

//                 <div
//                   className="
//                     absolute
//                     inset-y-0
//                     left-0
//                     w-3/4
//                     bg-gradient-to-r
//                     from-black
//                     via-black/80
//                     to-transparent
//                   "
//                 />

//                 <div
//                   className="
//                     absolute
//                     inset-y-0
//                     right-0
//                     w-1/2
//                     bg-gradient-to-l
//                     from-black/70
//                     to-transparent
//                   "
//                 />

//               </div>

//               {/* ==========================================
//                   CONTENT
//               =========================================== */}

//               <div
//                 className="
//                   relative
//                   z-10
//                   flex
//                   min-h-96
//                   flex-col
//                   justify-between
//                   p-7
//                   md:min-h-112
//                   md:p-10
//                   lg:p-12
//                 "
//               >

//                 {/* TOP */}

//                 <div className="flex items-start justify-between">

//                   <span
//                     className="
//                       text-xs
//                       font-medium
//                       tracking-widest
//                       text-red-500
//                     "
//                   >
//                     {technology.number}
//                   </span>

//                   <span
//                     className="
//                       hidden
//                       text-xs
//                       uppercase
//                       tracking-widest
//                       text-white/25
//                       md:block
//                     "
//                   >
//                     Proliant Technologies
//                   </span>

//                 </div>

//                 {/* MAIN */}

//                 <div
//                   className="
//                     grid
//                     gap-8
//                     md:grid-cols-2
//                     md:gap-12
//                   "
//                 >

//                   {/* TITLE */}

//                   <div>

//                     <h3
//                       className="
//                         text-4xl
//                         font-semibold
//                         leading-tight
//                         tracking-tight
//                         sm:text-5xl
//                         md:text-6xl
//                         lg:text-7xl
//                       "
//                     >
//                       {technology.title}
//                     </h3>

//                   </div>

//                   {/* INFORMATION */}

//                   <div
//                     className="
//                       technology-content
//                       max-w-lg
//                       self-end
//                     "
//                   >

//                     <p
//                       className="
//                         text-sm
//                         leading-relaxed
//                         text-white/75
//                         md:text-base
//                       "
//                     >
//                       {technology.statement}
//                     </p>

//                     <div
//                       className="
//                         mt-5
//                         border-t
//                         border-white/15
//                         pt-4
//                       "
//                     >

//                       <p
//                         className="
//                           mb-3
//                           text-xs
//                           uppercase
//                           tracking-widest
//                           text-white/30
//                         "
//                       >
//                         Technology Focus
//                       </p>

//                       <ul className="space-y-1.5">

//                         {technology.technologies.map((item) => (
//                           <li
//                             key={item}
//                             className="
//                               technology-item
//                               flex
//                               items-center
//                               gap-3
//                               text-sm
//                               text-white/70
//                             "
//                           >
//                             <span
//                               className="
//                                 h-1.5
//                                 w-1.5
//                                 shrink-0
//                                 rounded-full
//                                 bg-red-500
//                               "
//                             />

//                             <span>{item}</span>
//                           </li>
//                         ))}

//                       </ul>

//                     </div>

//                   </div>

//                 </div>

//                 {/* BOTTOM */}

//                 <div
//                   className="
//                     mt-6
//                     flex
//                     items-center
//                     justify-between
//                     border-t
//                     border-white/10
//                     pt-3
//                   "
//                 >

//                   <span
//                     className="
//                       text-xs
//                       uppercase
//                       tracking-widest
//                       text-white/20
//                     "
//                   >
//                     Technology {technology.number}
//                   </span>

//                   <span
//                     className="
//                       text-xs
//                       uppercase
//                       tracking-widest
//                       text-red-500
//                       transition-transform
//                       duration-300
//                       group-hover:translate-x-2
//                     "
//                   >
//                     Explore →
//                   </span>

//                 </div>

//               </div>

//             </article>
//           ))}

//         </div>

//         {/* ================================================
//             CLOSING
//         ================================================= */}

//         <div
//           className="
//             mt-12
//             border-t
//             border-white/10
//             pt-8
//             md:mt-16
//             md:pt-10
//           "
//         >
//           <p
//             className="
//               max-w-4xl
//               text-lg
//               leading-relaxed
//               text-white/40
//               md:text-xl
//             "
//           >
//             From data foundations and enterprise integration to
//             analytics and intelligent transformation, Proliant
//             connects the technology landscape around business
//             outcomes.
//           </p>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default Technologies;