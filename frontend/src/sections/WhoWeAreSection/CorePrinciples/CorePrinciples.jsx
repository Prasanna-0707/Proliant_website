import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CorePrinciples = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* =========================================================
         RESPONSIVE ANIMATION VALUES
      ========================================================= */

      const isMobile = window.matchMedia("(max-width: 639px)").matches;
      const isTablet = window.matchMedia(
        "(min-width: 640px) and (max-width: 1279px)"
      ).matches;

      const headingY = isMobile ? 35 : isTablet ? 50 : 70;
      const cardX = isMobile ? 35 : isTablet ? 50 : 70;
      const cardY = isMobile ? 25 : isTablet ? 35 : 45;

      /* =========================================================
         SECTION HEADING
      ========================================================= */

      gsap.from(".principles-label", {
        opacity: 0,
        y: isMobile ? 12 : 20,
        duration: isMobile ? 0.6 : 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
        },
      });

      gsap.from(".principles-heading-line", {
        opacity: 0,
        y: headingY,
        filter: isMobile ? "blur(5px)" : "blur(8px)",
        duration: isMobile ? 0.8 : 1,
        stagger: isMobile ? 0.08 : 0.12,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
        },
      });

      /* =========================================================
         CARDS — STAGGERED REVEAL
      ========================================================= */

      gsap.utils
        .toArray(".principle-card")
        .forEach((card, index) => {
          const direction =
            index % 2 === 0 ? -cardX : cardX;

          gsap.from(card, {
            opacity: 0,
            x: direction,
            y: cardY,
            scale: isMobile ? 0.985 : 0.97,
            duration: isMobile ? 0.8 : 1,
            ease: "power4.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
            },
          });

          /* =====================================================
             CARD CONTENT
          ===================================================== */

          gsap.from(card.querySelector(".principle-number"), {
            opacity: 0,
            y: isMobile ? 12 : 20,
            duration: isMobile ? 0.5 : 0.6,
            delay: isMobile ? 0.15 : 0.25,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
            },
          });

          gsap.from(card.querySelectorAll(".principle-word"), {
            opacity: 0,
            y: isMobile ? 20 : 35,
            filter: isMobile ? "blur(3px)" : "blur(5px)",
            duration: isMobile ? 0.6 : 0.7,
            stagger: isMobile ? 0.08 : 0.12,
            delay: isMobile ? 0.2 : 0.3,
            ease: "power4.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
            },
          });

          gsap.from(card.querySelector(".principle-description"), {
            opacity: 0,
            y: isMobile ? 15 : 25,
            duration: isMobile ? 0.7 : 0.8,
            delay: isMobile ? 0.35 : 0.55,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
            },
          });

          /* =====================================================
             RED SIDE ACCENT
          ===================================================== */

          gsap.from(card.querySelector(".principle-accent"), {
            scaleY: 0,
            transformOrigin:
              index === 1 ? "top center" : "bottom center",
            duration: isMobile ? 0.7 : 0.9,
            delay: isMobile ? 0.15 : 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
            },
          });

          /* =====================================================
             BOTTOM LINE DRAW
          ===================================================== */

          gsap.from(card.querySelector(".principle-line"), {
            scaleX: 0,
            transformOrigin: "left center",
            duration: isMobile ? 0.8 : 1,
            delay: isMobile ? 0.5 : 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
            },
          });

          /* =====================================================
             HOVER ANIMATION
          ===================================================== */

          const title = card.querySelector(".principle-title");
          const glow = card.querySelector(".principle-glow");
          const line = card.querySelector(".principle-line");

          const enter = () => {
            gsap.to(title, {
              x: 12,
              duration: 0.5,
              ease: "power3.out",
            });

            gsap.to(glow, {
              opacity: 0.08,
              duration: 0.5,
              ease: "power2.out",
            });

            gsap.to(line, {
              scaleX: 1,
              backgroundColor: "#EF3B3A",
              duration: 0.5,
              ease: "power3.out",
            });
          };

          const leave = () => {
            gsap.to(title, {
              x: 0,
              duration: 0.5,
              ease: "power3.out",
            });

            gsap.to(glow, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.out",
            });

            gsap.to(line, {
              backgroundColor: "rgba(255,255,255,0.1)",
              duration: 0.5,
              ease: "power3.out",
            });
          };

          card.addEventListener("mouseenter", enter);
          card.addEventListener("mouseleave", leave);

          card._principleEnter = enter;
          card._principleLeave = leave;
        });

      /* =========================================================
         CARD PARALLAX / FLOATING FEEL
      ========================================================= */

      gsap.utils.toArray(".principle-card").forEach((card, index) => {
        gsap.to(card, {
          y: isMobile
            ? index === 1
              ? -6
              : 4
            : isTablet
            ? index === 1
              ? -8
              : 6
            : index === 1
            ? -12
            : 8,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: isMobile ? 2 : 1.5,
          },
        });
      });
    }, sectionRef);

    return () => {
      gsap.utils.toArray(".principle-card").forEach((card) => {
        if (card._principleEnter) {
          card.removeEventListener(
            "mouseenter",
            card._principleEnter
          );
        }

        if (card._principleLeave) {
          card.removeEventListener(
            "mouseleave",
            card._principleLeave
          );
        }
      });

      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="principles"
      className="
        relative
        overflow-hidden
        bg-black
        px-5
        py-12
        text-white

        sm:px-6
        sm:py-14

        md:px-10
        md:py-16

        lg:px-16
        lg:py-20

        xl:px-24
        xl:py-24
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            SECTION HEADING
        ====================================================== */}

        <div
          className="
            principles-heading-wrap
            relative
            z-10
            max-w-3xl
          "
        >

          <p
            className="
              principles-label
              text-xs
              font-medium
              uppercase
              tracking-widest
              text-[#EF3B3A]
            "
          >
            Core Principles
          </p>

          <h2
            className="
              mt-4
              text-[clamp(1.875rem,7vw,3rem)]
              font-semibold
              leading-[0.95]
              tracking-tight

              sm:text-[clamp(2rem,6vw,3.25rem)]

              md:mt-5
              md:text-5xl

              lg:text-6xl

              xl:text-7xl
            "
          >
            <span className="principles-heading-line block">
              Principles that move
            </span>

            <span className="principles-heading-line block text-white/25">
              businesses forward.
            </span>
          </h2>
        </div>


        {/* =====================================================
            PRINCIPLES
        ====================================================== */}

        <div
          className="
            principles-grid
            relative
            mt-10

            sm:mt-12

            md:mt-14

            lg:mt-16
          "
        >

          {/* ===================================================
              01 — MISSION
          =================================================== */}

          <article
            className="
              principle-card
              principle-card-1
              group
              relative
              ml-auto
              w-full
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-neutral-950
              px-5
              py-7
              transition-colors
              duration-500
              hover:border-white/20

              sm:px-7
              sm:py-8

              md:w-5/6
              md:px-10
              md:py-10
            "
          >

            <div
              className="
                principle-accent
                absolute
                left-0
                top-0
                h-full
                w-1
                origin-bottom
                bg-[#EF3B3A]
              "
            />

            <div
              className="
                principle-glow
                pointer-events-none
                absolute
                -right-24
                -top-24
                h-56
                w-56
                rounded-full
                bg-[#EF3B3A]
                opacity-0
                blur-3xl
              "
            />

            <div
              className="
                relative
                z-10
                grid
                gap-6

                md:grid-cols-2
                md:items-center
                md:gap-10
              "
            >

              <div>
                <h3
                  className="
                    principle-title
                    mt-2
                    text-[clamp(1.5rem,5vw,2rem)]
                    font-semibold
                    italic
                    leading-none
                    tracking-tight

                    sm:text-[clamp(1.75rem,4vw,2.25rem)]

                    md:text-5xl

                    lg:text-6xl
                  "
                >
                  <span className="principle-word inline-block">
                    Our
                  </span>{" "}

                  <span className="principle-word inline-block">
                    Mission
                  </span>
                </h3>

              </div>

              <p
                className="
                  principle-description
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-white/55

                  sm:text-base

                  md:text-lg
                "
              >
                Accelerate your data and digital transformation
                with invaluable insights and cutting-edge
                technology. We provide innovative, tailored
                solutions that not only unlock the full potential
                of your data but also optimize your technology and
                resources for sustainable growth.
              </p>

            </div>

            <div
              className="
                principle-line
                mt-7
                h-px
                w-full
                origin-left
                bg-white/10

                md:mt-9
              "
            />

          </article>


          {/* ===================================================
              02 — VISION
          =================================================== */}

          <article
            className="
              principle-card
              principle-card-2
              group
              relative
              mt-6
              w-full
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-neutral-950
              px-5
              py-7
              transition-colors
              duration-500
              hover:border-white/20

              sm:mt-7
              sm:px-7
              sm:py-8

              md:mt-10
              md:w-3/4
              md:px-10
              md:py-10
            "
          >

            <div
              className="
                principle-accent
                absolute
                right-0
                top-0
                h-full
                w-1
                origin-top
                bg-[#EF3B3A]
              "
            />

            <div
              className="
                principle-glow
                pointer-events-none
                absolute
                -bottom-24
                -left-24
                h-56
                w-56
                rounded-full
                bg-[#EF3B3A]
                opacity-0
                blur-3xl
              "
            />

            <div
              className="
                relative
                z-10
                grid
                gap-6

                md:grid-cols-2
                md:items-center
                md:gap-10
              "
            >

              <div>
                <h3
                  className="
                    principle-title
                    mt-2
                    text-[clamp(1.5rem,5vw,2rem)]
                    font-semibold
                    italic
                    leading-none
                    tracking-tight

                    sm:text-[clamp(1.75rem,4vw,2.25rem)]

                    md:text-5xl

                    lg:text-6xl
                  "
                >
                  <span className="principle-word inline-block">
                    Our
                  </span>{" "}

                  <span className="principle-word inline-block">
                    Vision
                  </span>
                </h3>

              </div>

              <p
                className="
                  principle-description
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-white/55

                  sm:text-base

                  md:text-lg
                "
              >
                To be the leading Data Technology solutions and
                Staffing partner, empowering businesses with
                innovative strategies that drive growth,
                efficiency, and a competitive edge.
              </p>

            </div>

            <div
              className="
                principle-line
                mt-7
                h-px
                w-full
                origin-left
                bg-white/10

                md:mt-9
              "
            />

          </article>


          {/* ===================================================
              03 — VALUES
          =================================================== */}

          <article
            className="
              principle-card
              principle-card-3
              group
              relative
              mt-6
              ml-auto
              w-full
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-neutral-950
              px-5
              py-7
              transition-colors
              duration-500
              hover:border-white/20

              sm:mt-7
              sm:px-7
              sm:py-8

              md:mt-12
              md:w-4/5
              md:px-10
              md:py-10
            "
          >

            <div
              className="
                principle-accent
                absolute
                left-0
                top-0
                h-full
                w-1
                origin-bottom
                bg-[#EF3B3A]
              "
            />

            <div
              className="
                principle-glow
                pointer-events-none
                absolute
                -bottom-24
                -right-24
                h-56
                w-56
                rounded-full
                bg-[#EF3B3A]
                opacity-0
                blur-3xl
              "
            />

            <div
              className="
                relative
                z-10
                grid
                gap-6

                md:grid-cols-2
                md:items-center
                md:gap-10
              "
            >

              <div>
                <h3
                  className="
                    principle-title
                    mt-2
                    text-[clamp(1.5rem,5vw,2rem)]
                    font-semibold
                    italic
                    leading-none
                    tracking-tight

                    sm:text-[clamp(1.75rem,4vw,2.25rem)]

                    md:text-5xl

                    lg:text-6xl
                  "
                >
                  <span className="principle-word inline-block">
                    Our
                  </span>{" "}

                  <span className="principle-word inline-block">
                    Values
                  </span>
                </h3>

              </div>

              <p
                className="
                  principle-description
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-white/55

                  sm:text-base

                  md:text-lg
                "
              >
                We champion innovation and excellence, uphold
                collaboration and integrity with transparency and
                teamwork, and nurture a culture of empathy by
                prioritizing the well-being and inclusion of both
                our clients and team.
              </p>

            </div>

            <div
              className="
                principle-line
                mt-7
                h-px
                w-full
                origin-left
                bg-white/10

                md:mt-9
              "
            />

          </article>

        </div>
      </div>
    </section>
  );
};

export default CorePrinciples;