import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CorePrinciples = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* =========================================================
         SECTION HEADING
      ========================================================= */

      gsap.from(".principles-label", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
        },
      });

      gsap.from(".principles-heading-line", {
        opacity: 0,
        y: 70,
        filter: "blur(8px)",
        duration: 1,
        stagger: 0.12,
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
          const direction = index % 2 === 0 ? -70 : 70;

          gsap.from(card, {
            opacity: 0,
            x: direction,
            y: 45,
            scale: 0.97,
            duration: 1,
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
            y: 20,
            duration: 0.6,
            delay: 0.25,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
            },
          });

          gsap.from(card.querySelectorAll(".principle-word"), {
            opacity: 0,
            y: 35,
            filter: "blur(5px)",
            duration: 0.7,
            stagger: 0.12,
            delay: 0.3,
            ease: "power4.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
            },
          });

          gsap.from(card.querySelector(".principle-description"), {
            opacity: 0,
            y: 25,
            duration: 0.8,
            delay: 0.55,
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
            duration: 0.9,
            delay: 0.2,
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
            duration: 1,
            delay: 0.7,
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
          y: index === 1 ? -12 : 8,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
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
        px-8
        py-20
        text-white
        md:px-16
        md:py-24
        lg:px-24
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            SECTION HEADING
        ====================================================== */}

        <div className="principles-heading-wrap relative z-10 max-w-3xl">

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
              mt-5
              text-[clamp(1.875rem,7vw,3.75rem)]
              font-semibold
              leading-none
              tracking-tight
              md:text-6xl
              lg:text-7xl
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

        <div className="principles-grid relative mt-14 md:mt-18">

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
              px-7
              py-9
              transition-colors
              duration-500
              hover:border-white/20
              md:w-5/6
              md:px-10
              md:py-11
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
                gap-8
                md:grid-cols-2
                md:items-center
                md:gap-10
              "
            >

              <div>

                <p
                  className="
                    principle-number
                    text-xs
                    uppercase
                    tracking-widest
                    text-[#EF3B3A]
                  "
                >
                  01
                </p>

                <h3
                  className="
                    principle-title
                    mt-3
                    text-[clamp(1.5rem,5vw,2.25rem)]
                    font-semibold
                    italic
                    leading-none
                    tracking-tight
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
                  text-base
                  leading-relaxed
                  text-white/55
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
                mt-9
                h-px
                w-full
                origin-left
                bg-white/10
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
              mt-8
              w-full
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-neutral-950
              px-7
              py-9
              transition-colors
              duration-500
              hover:border-white/20
              md:mt-10
              md:w-3/4
              md:px-10
              md:py-11
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
                gap-8
                md:grid-cols-2
                md:items-center
                md:gap-10
              "
            >

              <div>

                <p
                  className="
                    principle-number
                    text-xs
                    uppercase
                    tracking-widest
                    text-[#EF3B3A]
                  "
                >
                  02
                </p>

                <h3
                  className="
                    principle-title
                    mt-3
                    text-[clamp(1.5rem,5vw,2.25rem)]
                    font-semibold
                    italic
                    leading-none
                    tracking-tight
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
                  text-base
                  leading-relaxed
                  text-white/55
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
                mt-9
                h-px
                w-full
                origin-left
                bg-white/10
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
              mt-8
              ml-auto
              w-full
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-neutral-950
              px-7
              py-9
              transition-colors
              duration-500
              hover:border-white/20
              md:mt-12
              md:w-4/5
              md:px-10
              md:py-11
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
                gap-8
                md:grid-cols-2
                md:items-center
                md:gap-10
              "
            >

              <div>

                <p
                  className="
                    principle-number
                    text-xs
                    uppercase
                    tracking-widest
                    text-[#EF3B3A]
                  "
                >
                  03
                </p>

                <h3
                  className="
                    principle-title
                    mt-3
                    text-[clamp(1.5rem,5vw,2.25rem)]
                    font-semibold
                    italic
                    leading-none
                    tracking-tight
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
                  text-base
                  leading-relaxed
                  text-white/55
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
                mt-9
                h-px
                w-full
                origin-left
                bg-white/10
              "
            />

          </article>

        </div>
      </div>
    </section>
  );
};

export default CorePrinciples;