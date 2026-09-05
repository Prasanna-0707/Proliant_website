import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import FoodProcessing from "@/assets/images/Home/Food_Processing.jpg";
import AeroSpace from "@/assets/images/Home/Aero_Space.jpg";
import HS from "@/assets/images/Home/HS.jpg";

gsap.registerPlugin(ScrollTrigger);

const industries = [
  {
    id: 1,
    name: "Health & Services",
    image: HS,
    description:
      "Data-driven solutions that help healthcare and service organizations improve operations, governance, and digital transformation.",
  },
  {
    id: 2,
    name: "Food Processing",
    image: FoodProcessing,
    description:
      "Technology and data solutions designed to help food processing organizations modernize operations and make better business decisions.",
  },
  {
    id: 3,
    name: "Aerospace Manufacturer",
    image: AeroSpace,
    description:
      "Enterprise data and digital solutions that support complex aerospace manufacturing environments and business transformation.",
  },
];

const IndustriesWeServe = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      /* =====================================================
         HEADER ANIMATIONS
      ===================================================== */

      gsap.from(".industries-label", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: isMobile ? 12 : 20,
        duration: isMobile ? 0.55 : 0.7,
        ease: "power3.out",
        immediateRender: false,
      });

      gsap.from(".industries-heading", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: isMobile ? 25 : 40,
        filter: isMobile ? "blur(5px)" : "blur(8px)",
        duration: isMobile ? 0.7 : 0.9,
        ease: "power4.out",
        immediateRender: false,
      });

      /* =====================================================
         CARD ANIMATIONS
      ===================================================== */

      gsap.utils.toArray(".industry-card").forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          y: isMobile ? 25 : 45,
          duration: isMobile ? 0.65 : 0.8,
          delay: isMobile ? index * 0.05 : index * 0.08,
          ease: "power3.out",
          immediateRender: false,
        });
      });

      /* =====================================================
         IMAGE LOAD FIX
      ===================================================== */

      const images = sectionRef.current.querySelectorAll("img");

      const refreshScrollTrigger = () => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      };

      images.forEach((image) => {
        if (image.complete) return;

        image.addEventListener("load", refreshScrollTrigger);
      });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      const refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);

      return () => {
        clearTimeout(refreshTimer);

        images.forEach((image) => {
          image.removeEventListener("load", refreshScrollTrigger);
        });
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        overflow-hidden
        bg-white
        py-10
        sm:py-12
        md:py-24
      "
    >
      {/* =====================================================
          READ MORE BUTTON STYLES
          ANIMATIONS REMAIN THE SAME
      ===================================================== */}

      <style>{`
        /* =====================================================
           COMMON BUTTON
        ===================================================== */

        .industry-readmore {
          position: relative;
          z-index: 10;
          display: inline-flex;

          width: 135px;
          height: 40px;

          align-items: center;
          justify-content: space-between;

          overflow: hidden;

          border: 1px solid rgba(255, 255, 255, 0.5);

          padding: 0 15px;

          text-decoration: none;
          cursor: pointer;

          border-radius: 999px;
        }

        .industry-readmore-text,
        .industry-readmore-arrow {
          position: relative;
          z-index: 3;

          color: white;

          transition:
            color 0.35s ease,
            transform 0.35s ease;

          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .industry-readmore-arrow {
          font-size: 17px;
          letter-spacing: normal;
        }

        .industry-readmore:hover .industry-readmore-arrow {
          transform: translateX(4px);
        }


        /* =====================================================
           MASK 1
        ===================================================== */

        .industry-mask1::before {
          content: "";

          position: absolute;
          inset: 0;

          z-index: 1;

          background: #EF3B3A;

          transform: translateX(-101%);

          transition:
            transform 0.5s cubic-bezier(
              0.76,
              0,
              0.24,
              1
            );
        }

        .industry-mask1:hover::before {
          transform: translateX(0);
        }

        .industry-mask1::after {
          content: "";

          position: absolute;
          inset: 0;

          z-index: 2;

          background: rgba(255, 255, 255, 0.12);

          transform: translateX(-110%);

          transition: transform 0.65s ease;
        }

        .industry-mask1:hover::after {
          transform: translateX(110%);
        }


        /* =====================================================
           MASK 2
        ===================================================== */

        .industry-mask2::before {
          content: "";

          position: absolute;
          inset: 0;

          z-index: 1;

          background: #EF3B3A;

          -webkit-mask-image: url(
            "https://raw.githubusercontent.com/robin-dela/css-mask-animation/master/img/nature-sprite.png"
          );

          mask-image: url(
            "https://raw.githubusercontent.com/robin-dela/css-mask-animation/master/img/nature-sprite.png"
          );

          -webkit-mask-size: 2300% 100%;
          mask-size: 2300% 100%;

          -webkit-mask-position: 100% 0;
          mask-position: 100% 0;

          animation:
            industryMask2Out
            0.7s
            steps(22)
            forwards;
        }

        .industry-mask2:hover::before {
          animation:
            industryMask2In
            0.7s
            steps(22)
            forwards;
        }

        @keyframes industryMask2In {
          from {
            -webkit-mask-position: 100% 0;
            mask-position: 100% 0;
          }

          to {
            -webkit-mask-position: 0 0;
            mask-position: 0 0;
          }
        }

        @keyframes industryMask2Out {
          from {
            -webkit-mask-position: 0 0;
            mask-position: 0 0;
          }

          to {
            -webkit-mask-position: 100% 0;
            mask-position: 100% 0;
          }
        }


        /* =====================================================
           MASK 3
        ===================================================== */

        .industry-mask3::before {
          content: "";

          position: absolute;

          inset: -2px;

          z-index: 1;

          background: #EF3B3A;

          clip-path: polygon(
            0 0,
            0 0,
            0 100%,
            0 100%
          );

          transition:
            clip-path
            0.65s
            cubic-bezier(
              0.76,
              0,
              0.24,
              1
            );
        }

        .industry-mask3:hover::before {
          clip-path: polygon(
            0 0,
            100% 0,
            100% 100%,
            0 100%
          );
        }

        .industry-mask3::after {
          content: "";

          position: absolute;

          top: -20%;
          left: -40%;

          width: 25%;
          height: 140%;

          z-index: 2;

          background: rgba(255, 255, 255, 0.25);

          transform:
            skewX(-25deg)
            translateX(-500%);

          transition: transform 0.7s ease;
        }

        .industry-mask3:hover::after {
          transform:
            skewX(-25deg)
            translateX(800%);
        }


        /* =====================================================
           HOVER BORDER
        ===================================================== */

        .industry-mask1:hover,
        .industry-mask2:hover,
        .industry-mask3:hover {
          border-color: #EF3B3A;
        }

        /* =====================================================
           MOBILE BUTTON
           Only size adjustment
        ===================================================== */

        @media (max-width: 639px) {
          .industry-readmore {
            width: 125px;
            height: 38px;
            padding: 0 13px;
          }

          .industry-readmore-arrow {
            font-size: 16px;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-8">

        {/* =================================================
            SECTION HEADER
        ================================================== */}

        <div className="mb-8 sm:mb-10 md:mb-14">

          <p
            className="
              industries-label
              mb-4
              text-xs
              font-medium
              uppercase
              tracking-[2px]
              text-red-600
              sm:mb-5
              md:text-sm
            "
          >
            Industries We Serve
          </p>

          <h2
            className="
              industries-heading
              max-w-5xl
              text-[clamp(1.875rem,7.5vw,2.5rem)]
              font-semibold
              leading-[1.1]
              tracking-tight
              sm:text-[clamp(2.125rem,6vw,3rem)]
              md:text-5xl
              lg:text-6xl
            "
          >
            Expertise Across Key Industries
          </h2>

        </div>


        {/* =================================================
            INDUSTRY CARDS
        ================================================== */}

        <div className="industries-grid space-y-5 sm:space-y-6 md:space-y-7">

          {industries.map((industry, index) => {
            const imageLeft = index % 2 === 0;

            const buttonAnimation =
              index === 0
                ? "industry-mask1"
                : index === 1
                ? "industry-mask2"
                : "industry-mask3";

            return (
              <article
                key={industry.id}
                className="
                  industry-card
                  group
                  relative
                  grid
                  overflow-hidden
                  rounded-3xl
                  border
                  border-black/10
                  bg-black
                  shadow-lg
                  transition-all
                  duration-500
                  ease-out
                  hover:-translate-y-2
                  hover:border-[#EF3B3A]/50
                  hover:shadow-2xl
                  lg:grid-cols-2
                "
              >

                {/* IMAGE SIDE */}

                <div
                  className={`
                    relative
                    min-h-56
                    overflow-hidden
                    bg-black
                    sm:min-h-64
                    md:min-h-72
                    lg:min-h-96
                    ${
                      imageLeft
                        ? "lg:order-1"
                        : "lg:order-2"
                    }
                  `}
                >
                  <img
                    src={industry.image}
                    alt={industry.name}
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-1000
                      ease-out
                      group-hover:scale-105
                    "
                  />

                  <div
                    className="
                      absolute
                      inset-0
                      bg-black/10
                      transition-opacity
                      duration-500
                      group-hover:bg-black/20
                    "
                  />

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-linear-to-tr
                      from-[#EF3B3A]/35
                      via-transparent
                      to-transparent
                      opacity-60
                      transition-opacity
                      duration-700
                      group-hover:opacity-100
                    "
                  />

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-linear-to-r
                      from-transparent
                      via-white/10
                      to-transparent
                      opacity-0
                      transition-opacity
                      duration-700
                      group-hover:opacity-100
                    "
                  />

                </div>


                {/* CONTENT SIDE */}

                <div
                  className={`
                    relative
                    flex
                    flex-col
                    justify-center
                    overflow-hidden
                    bg-black
                    px-6
                    py-8
                    text-white
                    sm:px-8
                    sm:py-9
                    md:px-10
                    md:py-12
                    lg:px-14
                    lg:py-12
                    ${
                      imageLeft
                        ? "lg:order-2"
                        : "lg:order-1"
                    }
                  `}
                >

                  <div
                    className="
                      pointer-events-none
                      absolute
                      -bottom-20
                      -right-20
                      h-56
                      w-56
                      rounded-full
                      bg-[#EF3B3A]/10
                      blur-3xl
                      opacity-0
                      transition-opacity
                      duration-700
                      group-hover:opacity-100
                    "
                  />

                  <h3
                    className="
                      relative
                      z-10
                      mb-4
                      max-w-xl
                      text-[clamp(1.75rem,7vw,2.25rem)]
                      font-semibold
                      leading-[1.1]
                      tracking-tight
                      transition-transform
                      duration-500
                      group-hover:translate-x-1
                      sm:mb-5
                      sm:text-4xl
                      md:text-4xl
                      lg:text-5xl
                    "
                  >
                    {industry.name}
                  </h3>


                  <div
                    className="
                      relative
                      z-10
                      mb-4
                      h-px
                      w-10
                      bg-[#EF3B3A]
                      transition-all
                      duration-500
                      group-hover:w-20
                      sm:mb-5
                    "
                  />


                  <p
                    className="
                      relative
                      z-10
                      mb-6
                      max-w-lg
                      text-[15px]
                      leading-6
                      text-white/60
                      sm:mb-7
                      sm:text-base
                      sm:leading-relaxed
                      md:text-lg
                    "
                  >
                    {industry.description}
                  </p>


                  {/* READ MORE BUTTON */}

                  <a
                    href="/what-we-do#industries"
                    className={`industry-readmore ${buttonAnimation}`}
                  >
                    <span className="industry-readmore-text">
                      Read More
                    </span>

                    <span className="industry-readmore-arrow">
                      →
                    </span>
                  </a>

                </div>


                {/* CARD HIGHLIGHT */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-3xl
                    ring-1
                    ring-inset
                    ring-transparent
                    transition-all
                    duration-500
                    group-hover:ring-[#EF3B3A]/40
                  "
                />

              </article>
            );
          })}

        </div>

      </div>
    </section>
  );
};

export default IndustriesWeServe;