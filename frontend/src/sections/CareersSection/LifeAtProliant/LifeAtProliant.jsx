import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import benefitsImage from "../../../assets/images/Careers/benifts.png";
import cultureImage from "../../../assets/images/Careers/culture.png";
import technologyImage from "../../../assets/images/Careers/cuttingedgetech.png";
import growthImage from "../../../assets/images/Careers/growth.png";

gsap.registerPlugin(ScrollTrigger);

const lifeCards = [
  {
    number: "01",
    title: "Benefits",
    description:
      "Join a fast-growing, innovation-led company that's shaping the future of data and AI.",
    image: benefitsImage,
    imageAlt: "Benefits at Proliant",
    dark: true,
  },
  {
    number: "02",
    title: "Cutting-Edge Tech",
    items: [
      "Work with the latest tools in AI, data and cloud",
      "Build real-world solutions using modern, scalable technologies",
      "Solve complex challenges for global enterprise clients",
    ],
    image: technologyImage,
    imageAlt: "Cutting-edge technology at Proliant",
    dark: true,
  },
  {
    number: "03",
    title: "Flexible Culture",
    items: [
      "Remote-first with office access on-demand",
      "Focused on outcomes, not micromanagement",
    ],
    image: cultureImage,
    imageAlt: "Flexible culture at Proliant",
    dark: false,
  },
  {
    number: "04",
    title: "Fast-Paced Growth",
    items: [
      "Startup energy with enterprise impact",
      "Continuous learning, collaboration and career advancement",
    ],
    image: growthImage,
    imageAlt: "Career growth at Proliant",
    dark: false,
  },
];

const LifeAtProliant = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* =========================
         SECTION TITLE
      ========================== */

      gsap.from(".career-life-title", {
        scrollTrigger: {
          trigger: ".career-life-title",
          start: "top 85%",
        },
        opacity: 0,
        y: 35,
        duration: 0.8,
        ease: "power3.out",
      });

      /* =========================
         CARDS
      ========================== */

      gsap.utils.toArray(".career-life-card").forEach((card) => {
        const content = card.querySelector(".career-card-content");
        const image = card.querySelector(".career-card-image");
        const glow = card.querySelector(".career-card-glow");

        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 82%",
          },
          opacity: 0,
          y: 50,
          duration: 0.9,
          ease: "power3.out",
        });

        gsap.from(content, {
          scrollTrigger: {
            trigger: card,
            start: "top 82%",
          },
          opacity: 0,
          x: -25,
          duration: 0.8,
          delay: 0.1,
          ease: "power3.out",
        });

        gsap.from(image, {
          scrollTrigger: {
            trigger: card,
            start: "top 82%",
          },
          opacity: 0,
          scale: 1.08,
          duration: 1.1,
          delay: 0.05,
          ease: "power3.out",
        });

        gsap.fromTo(
          glow,
          {
            opacity: 0,
            scale: 0.7,
          },
          {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            delay: 0.25,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-white px-6 py-16 text-black md:px-12 md:py-20 lg:px-20"
    >
      <div className="mx-auto max-w-7xl">

        {/* =========================
            SECTION HEADING
        ========================== */}

        <div className="mb-10 flex items-end justify-between border-b border-black/10 pb-5">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#EF3B3A]">
              Life at Proliant
            </p>

            <h2
              className="
                career-life-title
                text-[clamp(1.875rem,7vw,3.75rem)]
                font-medium
                leading-none
                tracking-tight
                md:text-5xl
                lg:text-6xl
              "
            >
              Life At Proliant
            </h2>
          </div>

          <span className="hidden text-xs uppercase tracking-[0.18em] text-black/30 md:block">
            People · Technology · Growth
          </span>
        </div>


        {/* =========================
            FOUR LIFE CARDS
        ========================== */}

        <div className="space-y-6">

          {lifeCards.map((card) => (
            <article
              key={card.number}
              className="
                career-life-card
                relative
                overflow-hidden
                rounded-2xl
                border
                border-black/10
                bg-white
                shadow-lg
                shadow-black/5
              "
            >
              <div className="grid min-h-80 md:grid-cols-2">

                {/* =========================
                    TEXT PANEL
                ========================== */}

                <div
                  className={`
                    career-card-content
                    relative
                    flex
                    min-h-80
                    flex-col
                    justify-center
                    overflow-hidden
                    p-7
                    md:p-9
                    ${
                      card.dark
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }
                  `}
                >

                  {/* RED CORNER LIGHT */}

                  {card.dark && (
                    <div
                      className="
                        career-card-glow
                        pointer-events-none
                        absolute
                        -right-20
                        -top-20
                        h-48
                        w-48
                        rounded-full
                        bg-[#EF3B3A]/20
                        blur-3xl
                      "
                    />
                  )}

                  {/* SMALL RED ACCENT */}

                  <div
                    className={`
                      absolute
                      left-0
                      top-0
                      h-16
                      w-1
                      ${
                        card.dark
                          ? "bg-[#EF3B3A]"
                          : "bg-[#EF3B3A]/80"
                      }
                    `}
                  />

                  <div className="relative z-10">

                    {/* NUMBER */}

                    <span
                      className={`
                        text-xs
                        uppercase
                        tracking-[0.2em]
                        ${
                          card.dark
                            ? "text-[#EF3B3A]"
                            : "text-[#EF3B3A]"
                        }
                      `}
                    >
                      {card.number}
                    </span>


                    {/* TITLE */}

                    <h3
                      className={`
                        mt-4
                        max-w-lg
                        border-b
                        pb-4
                        text-2xl
                        font-semibold
                        tracking-tight
                        md:text-3xl
                        ${
                          card.dark
                            ? "border-white/15"
                            : "border-black/10"
                        }
                      `}
                    >
                      {card.title}
                    </h3>


                    {/* DESCRIPTION */}

                    {card.description && (
                      <p
                        className={`
                          mt-6
                          max-w-xl
                          text-sm
                          leading-relaxed
                          md:text-base
                          ${
                            card.dark
                              ? "text-white/55"
                              : "text-black/55"
                          }
                        `}
                      >
                        {card.description}
                      </p>
                    )}


                    {/* LIST */}

                    {card.items && (
                      <ul
                        className={`
                          mt-6
                          space-y-3
                          text-sm
                          leading-relaxed
                          md:text-base
                          ${
                            card.dark
                              ? "text-white/55"
                              : "text-black/55"
                          }
                        `}
                      >
                        {card.items.map((item) => (
                          <li
                            key={item}
                            className="flex gap-3"
                          >
                            <span className="shrink-0 text-[#EF3B3A]">
                              +
                            </span>

                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                  </div>
                </div>


                {/* =========================
                    IMAGE PANEL
                ========================== */}

                <div className="career-card-image relative min-h-80 overflow-hidden bg-white">

                  <img
                    src={card.image}
                    alt={card.imageAlt}
                    className="
                      h-full
                      w-full
                      object-cover
                      grayscale
                      transition-transform
                      duration-1000
                      ease-out
                      hover:scale-105
                    "
                  />

                  {/* IMAGE SOFT FADE */}

                  <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-white/5 via-transparent to-black/5" />

                </div>

              </div>
            </article>
          ))}

        </div>

      </div>
    </section>
  );
};

export default LifeAtProliant;