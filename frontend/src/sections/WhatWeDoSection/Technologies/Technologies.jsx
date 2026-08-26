"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import masterDataImage from "@/assets/images/WhatWeDo/Technologies/Master Data Management & Governance.png";
import dataMigrationImage from "@/assets/images/WhatWeDo/Technologies/Data_Migration.png";
import etlIntegrationImage from "@/assets/images/WhatWeDo/Technologies/ETL & Integration.png";
import databaseServerImage from "@/assets/images/WhatWeDo/Technologies/Database & Server Administration.png";
import analyticsReportingImage from "@/assets/images/WhatWeDo/Technologies/Analytics & Reporting.png";

gsap.registerPlugin(ScrollTrigger);

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
    image: masterDataImage,
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
    image: dataMigrationImage,
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
    image: etlIntegrationImage,
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
    image: databaseServerImage,
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
    image: analyticsReportingImage,
  },
];

/* ================================================================
   TECHNOLOGIES
================================================================ */

const Technologies = () => {
  const sectionRef = useRef(null);
  const stackRef = useRef(null);
  const cardsRef = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stack = stackRef.current;
    const cards = cardsRef.current.filter(Boolean);

    if (!section || !stack || cards.length === 0) {
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* ============================================================
         DESKTOP / TABLET
      ============================================================ */

      mm.add("(min-width: 768px)", () => {
        const getCardHeight = () => {
          const card = cards[0];

          if (!card) {
            return 450;
          }

          return card.offsetHeight;
        };

        /*
         * Gap between active card and next card.
         *
         * This is deliberately visible so the text
         * from two cards never touches.
         */
        const cardGap = 52;

        /*
         * Distance travelled by the next card
         * to become the active card.
         */
        const getDistance = () => {
          return getCardHeight() + cardGap;
        };

        /*
         * ------------------------------------------------------------
         * INITIAL STATE
         * ------------------------------------------------------------
         *
         * Card 01:
         *     active
         *
         * Card 02:
         *     below Card 01
         *
         * Card 03:
         *     further below
         *
         * Previous cards later become small layers
         * at the top.
         */

        const setInitialState = () => {
          const distance = getDistance();

          cards.forEach((card, index) => {
            if (index === 0) {
              gsap.set(card, {
                y: 0,
                scale: 1,
                opacity: 1,
                zIndex: cards.length + 10,
              });

              return;
            }

            gsap.set(card, {
              y: index * distance,
              scale: 0.97,
              opacity: 1,
              zIndex: cards.length - index,
            });
          });
        };

        setInitialState();

        /*
         * ------------------------------------------------------------
         * MAIN TIMELINE
         * ------------------------------------------------------------
         */

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: stack,

            start: "top top+=150",

            end: () => {
              return `+=${getDistance() * (cards.length - 1)}`;
            },

            pin: true,
            pinSpacing: true,

            scrub: 0.2,

            anticipatePin: 1,

            invalidateOnRefresh: true,

            fastScrollEnd: false,

            preventOverlaps: true,
          },
        });
        /*
         * ------------------------------------------------------------
         * CARD-BY-CARD MOVEMENT
         * ------------------------------------------------------------
         *
         * This is the important part.
         *
         * At every step:
         *
         * 1. Current active card moves slightly ABOVE.
         *
         * 2. Next card moves from BELOW to CENTER.
         *
         * 3. All cards behind the active card remain as
         *    small visible layers at the TOP.
         *
         * 4. Future cards remain below with a clear gap.
         */

        cards.forEach((_, activeIndex) => {
          if (activeIndex === cards.length - 1) {
            return;
          }

          const distance = getDistance();

          const position = activeIndex;

          cards.forEach((card, cardIndex) => {
            let targetY;
            let targetScale;
            let targetOpacity;
            let targetZ;

            /*
             * --------------------------------------------------------
             * PREVIOUS CARDS
             * --------------------------------------------------------
             *
             * They become thin layers above the active card.
             */

            if (cardIndex < activeIndex + 1) {
              const previousDistance =
                activeIndex + 1 - cardIndex;

              targetY =
                -previousDistance * 16;

              targetScale =
                1 -
                Math.min(
                  previousDistance * 0.025,
                  0.10,
                );

              targetOpacity =
                Math.max(
                  0.25,
                  0.72 -
                    previousDistance * 0.08,
                );

              targetZ =
                cardIndex;
            }

            /*
             * --------------------------------------------------------
             * ACTIVE CARD
             * --------------------------------------------------------
             */

            else if (
              cardIndex === activeIndex + 1
            ) {
              targetY = 0;
              targetScale = 1;
              targetOpacity = 1;
              targetZ = cards.length + 20;
            }

            /*
             * --------------------------------------------------------
             * FUTURE CARDS
             * --------------------------------------------------------
             *
             * They stay BELOW the active card.
             */

            else {
              const futureDistance =
                cardIndex -
                (activeIndex + 1);

              targetY =
                (futureDistance + 1) *
                distance;

              targetScale = 0.97;

              targetOpacity = 1;

              targetZ =
                cards.length -
                cardIndex;
            }

            timeline.to(
              card,
              {
                y: targetY,
                scale: targetScale,
                opacity: targetOpacity,
                zIndex: targetZ,
                duration: 1,
                ease: "none",
              },
              position,
            );
          });
        });

        /*
         * ------------------------------------------------------------
         * REFRESH
         * ------------------------------------------------------------
         */

        const refresh = () => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setInitialState();
              ScrollTrigger.refresh();
            });
          });
        };

        window.addEventListener(
          "load",
          refresh,
        );

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });
        });

        return () => {
          window.removeEventListener(
            "load",
            refresh,
          );

          timeline.scrollTrigger?.kill();
          timeline.kill();
        };
      });

      /* ============================================================
         MOBILE
      ============================================================ */

      mm.add("(max-width: 767px)", () => {
        cards.forEach((card) => {
          gsap.set(card, {
            clearProps: "all",
          });

          gsap.fromTo(
            card,
            {
              opacity: 0,
              y: 30,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                once: true,
              },
            },
          );
        });
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="technologies"
      className="
        technology-section
        overflow-hidden
        bg-white
        px-4
        py-8
        text-black

        sm:px-5
        sm:py-10

        md:px-8
        md:py-12

        xl:px-12
        xl:py-14
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div
          className="
            mb-8
            max-w-4xl

            sm:mb-10

            md:mb-12

            xl:mb-14
          "
        >
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
              mt-2
              max-w-3xl
              text-3xl
              font-semibold
              leading-tight
              tracking-tight

              sm:text-4xl

              md:text-5xl

              xl:text-6xl
            "
          >
            Technology that connects
            <br />

            <span className="text-red-500">
              the enterprise.
            </span>
          </h2>
        </div>

        {/* ======================================================
            STACK
        ======================================================= */}
        <div
          ref={stackRef}
          className="
            relative
            h-125
            w-full

            sm:h-130

            md:h-135

            lg:h-140

            xl:h-145
          "
        >
          {technologyAreas.map(
            (technology, index) => (
              <article
                key={technology.number}
                ref={(element) => {
                  cardsRef.current[index] =
                    element;
                }}
                className="
                  technology-card
                  absolute
                  left-0
                  top-0
                  h-90
                  w-full
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/10
                  bg-black
                  shadow-2xl
                  will-change-transform

                  sm:h-97.5

                  md:h-107.5

                  lg:h-112.5

                  xl:h-117.5
                "
              >
                {/* ==================================================
                    IMAGE
                =================================================== */}

                <div className="absolute inset-0">
                  <img
                    src={technology.image}
                    alt={`${technology.number} technology`}
                    className="
                      h-full
                      w-full
                      object-cover
                      object-center
                      grayscale
                    "
                  />
                </div>

                {/* ==================================================
                    OVERLAY
                =================================================== */}

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
                    via-black/70
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
                    from-black/60
                    to-transparent
                  "
                />

                {/* ==================================================
                    CONTENT
                =================================================== */}

                <div
                  className="
                    relative
                    z-10
                    flex
                    h-full
                    flex-col
                    p-5

                    sm:p-6

                    md:p-8

                    xl:p-10
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
                        text-[10px]
                        uppercase
                        tracking-widest
                        text-white/40

                        sm:text-xs
                      "
                    >
                      Proliant Technologies
                    </span>
                  </div>

                  {/* MAIN */}

                  <div
                    className="
                      mt-auto
                      grid
                      gap-5
                      pt-8

                      md:grid-cols-2
                      md:gap-8

                      lg:gap-10
                    "
                  >
                    {/* TITLE */}

                    <div>
                      <h3
                        className="
                          text-3xl
                          font-semibold
                          leading-tight
                          tracking-tight
                          text-white

                          sm:text-4xl

                          md:text-5xl

                          xl:text-6xl
                        "
                      >
                        {technology.title}
                      </h3>
                    </div>

                    {/* DETAILS */}

                    <div
                      className="
                        max-w-lg
                        md:justify-self-end
                      "
                    >
                      <p
                        className="
                          text-xs
                          leading-relaxed
                          text-white/75

                          sm:text-sm

                          md:text-base
                        "
                      >
                        {technology.statement}
                      </p>

                      <div
                        className="
                          mt-4
                          border-t
                          border-white/15
                          pt-3

                          sm:mt-5
                          sm:pt-4
                        "
                      >
                        <p
                          className="
                            mb-2
                            text-[10px]
                            font-medium
                            uppercase
                            tracking-widest
                            text-white/35

                            sm:text-xs
                          "
                        >
                          Technology Focus
                        </p>

                        <ul
                          className="
                            space-y-1
                          "
                        >
                          {technology.technologies.map(
                            (item) => (
                              <li
                                key={item}
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  text-xs
                                  leading-relaxed
                                  text-white/70

                                  sm:text-sm
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

                                <span>
                                  {item}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM */}

                  <div
                    className="
                      mt-4
                      flex
                      items-center
                      justify-end
                      border-t
                      border-white/10
                      pt-3

                      sm:mt-5
                    "
                  >
                    <span
                      className="
                        text-[10px]
                        uppercase
                        tracking-widest
                        text-red-500

                        sm:text-xs
                      "
                    >
                      Explore →
                    </span>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
};

export default Technologies;