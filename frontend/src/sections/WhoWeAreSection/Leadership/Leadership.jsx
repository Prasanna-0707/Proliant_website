import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import RamSir from "@/assets/images/WhoweAre/Ram sir.jpeg";
import VamshiSir from "@/assets/images/WhoweAre/Vamshi sir.jpg";
import KiranSir from "@/assets/images/WhoweAre/Kiran sir.png";

gsap.registerPlugin(ScrollTrigger);

const leaders = [
  {
    id: 1,
    name: "Vamshi Polam",
    role: "CEO",
    image: VamshiSir,
  },
  {
    id: 2,
    name: "Ram Bolla",
    role: "Managing Director",
    image: RamSir,
  },
  {
    id: 3,
    name: "Kiran Reddy",
    role: "Director",
    image: KiranSir,
  },
];

const Leadership = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* =====================================================
         RESPONSIVE ANIMATION VALUES
      ===================================================== */

      const isMobile = window.matchMedia("(max-width: 639px)").matches;
      const isTablet = window.matchMedia(
        "(min-width: 640px) and (max-width: 1023px)"
      ).matches;

      const headingY = isMobile ? 30 : isTablet ? 40 : 55;
      const cardY = isMobile ? 30 : isTablet ? 40 : 50;

      /* =====================================================
         HEADING ANIMATION
      ===================================================== */

      gsap.from(".leaders-label", {
        opacity: 0,
        y: isMobile ? 12 : 20,
        duration: isMobile ? 0.5 : 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".leaders-heading-line", {
        opacity: 0,
        y: headingY,
        filter: isMobile ? "blur(5px)" : "blur(8px)",
        duration: isMobile ? 0.75 : 0.9,
        stagger: isMobile ? 0.08 : 0.12,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".leaders-description", {
        opacity: 0,
        y: isMobile ? 15 : 25,
        duration: isMobile ? 0.65 : 0.8,
        delay: isMobile ? 0.15 : 0.25,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      /* =====================================================
         LEADER CARDS
      ===================================================== */

      gsap.utils.toArray(".leader-card").forEach((card, index) => {
        const image = card.querySelector(".leader-image");
        const glow = card.querySelector(".leader-glow");
        const content = card.querySelector(".leader-content");
        const name = card.querySelector(".leader-name");
        const line = card.querySelector(".leader-line");
        const highlight = card.querySelector(".leader-highlight");

        /* ===================================================
           CARD ENTRANCE
        =================================================== */

        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: cardY,
          },
          {
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.75 : 0.9,
            delay: index * (isMobile ? 0.08 : 0.12),
            ease: "power4.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );

        /* ===================================================
           IMAGE ENTRANCE
        =================================================== */

        gsap.fromTo(
          image,
          {
            scale: isMobile ? 1.04 : 1.08,
          },
          {
            scale: 1,
            duration: isMobile ? 0.9 : 1.2,
            delay: index * (isMobile ? 0.08 : 0.12),
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );

        /* ===================================================
           CONTENT ENTRANCE
        =================================================== */

        gsap.fromTo(
          content,
          {
            opacity: 0,
            y: isMobile ? 18 : 25,
          },
          {
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.7 : 0.8,
            delay:
              (isMobile ? 0.2 : 0.25) +
              index * (isMobile ? 0.08 : 0.12),
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );

        /* ===================================================
           HOVER
        ===================================================== */

        const handleEnter = () => {
          gsap.to(".leader-card", {
            opacity: 0.55,
            scale: 0.985,
            duration: 0.4,
            ease: "power2.out",
          });

          gsap.to(card, {
            opacity: 1,
            scale: 1.02,
            y: -8,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(image, {
            scale: 1.07,
            duration: 0.8,
            ease: "power3.out",
          });

          gsap.to(glow, {
            opacity: 1,
            scale: 1.1,
            duration: 0.5,
            ease: "power2.out",
          });

          gsap.to(highlight, {
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
          });

          gsap.to(content, {
            y: -5,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(name, {
            x: 8,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(line, {
            width: "100%",
            duration: 0.55,
            ease: "power3.out",
          });
        };

        /* ===================================================
           LEAVE
        ===================================================== */

        const handleLeave = () => {
          gsap.to(".leader-card", {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
          });

          gsap.to(card, {
            y: 0,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(image, {
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
          });

          gsap.to(glow, {
            opacity: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          });

          gsap.to(highlight, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.out",
          });

          gsap.to(content, {
            y: 0,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(name, {
            x: 0,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(line, {
            width: "0%",
            duration: 0.45,
            ease: "power3.out",
          });
        };

        card.addEventListener("mouseenter", handleEnter);
        card.addEventListener("mouseleave", handleLeave);

        card._handleEnter = handleEnter;
        card._handleLeave = handleLeave;
      });
    }, sectionRef);

    return () => {
      gsap.utils.toArray(".leader-card").forEach((card) => {
        if (card._handleEnter) {
          card.removeEventListener(
            "mouseenter",
            card._handleEnter
          );
        }

        if (card._handleLeave) {
          card.removeEventListener(
            "mouseleave",
            card._handleLeave
          );
        }
      });

      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="leaders"
      className="
        leaders-section
        bg-white
        px-5
        py-10
        text-black

        sm:px-6
        sm:py-12

        md:px-10
        md:py-14

        lg:px-16
        lg:py-16

        xl:px-24
        xl:py-20
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADING
        ================================================== */}

        <div
          className="
            leaders-intro
            pb-5

            sm:pb-6

            md:pb-7
          "
        >

          <p
            className="
              leaders-label
              text-xs
              font-bold
              uppercase
              tracking-widest
              text-[#EF3B3A]

              sm:text-sm
            "
          >
            Leadership
          </p>

          <h2
            className="
              mt-3
              text-[clamp(1.875rem,7vw,3rem)]
              font-semibold
              leading-[0.95]
              tracking-tight

              sm:text-[clamp(2rem,6vw,3.25rem)]

              md:text-5xl

              lg:text-6xl

              xl:text-7xl
            "
          >
            <span className="leaders-heading-line inline-block">
              The people behind{" "}
            </span>

            <span className="leaders-heading-line inline-block text-[#EF3B3A]">
              Proliant.
            </span>
          </h2>

          <div
            className="
              leaders-description
              mt-3
              max-w-3xl
              lg:max-w-none
              lg:whitespace-nowrap
            "
          >
            <p
              className="
                text-xs
                leading-relaxed
                text-black/50

                sm:text-sm

                md:text-base
              "
            >
              Leadership that combines enterprise experience,
              technology expertise, and a vision for intelligent
              transformation.
            </p>
          </div>

        </div>


        {/* =================================================
            LEADER CARDS
        ================================================== */}

        <div
          className="
            leaders-grid
            mt-2
            grid
            gap-3

            sm:gap-4

            md:grid-cols-2
            md:gap-4

            lg:grid-cols-3
          "
        >

          {leaders.map((leader) => (
            <article
              key={leader.id}
              className="
                leader-card
                group
                relative
                aspect-square
                overflow-hidden
                bg-black
                transition-transform
                duration-500
                ease-out
              "
            >

              {/* ==========================================
                  IMAGE
              =========================================== */}

              <div
                className="
                  leader-image
                  absolute
                  inset-0
                  overflow-hidden
                  bg-neutral-950
                "
              >

                <img
                  src={leader.image}
                  alt={leader.name}
                  className="
                    h-full
                    w-full
                    object-cover
                    object-center
                  "
                />

              </div>


              {/* ==========================================
                  DARK GRADIENT
              =========================================== */}

              <div
                className="
                  absolute
                  inset-0
                  bg-linear-to-t
                  from-black
                  via-black/30
                  to-transparent
                  opacity-80
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                "
              />


              {/* ==========================================
                  RED AMBIENT GLOW
              =========================================== */}

              <div
                className="
                  leader-glow
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-[#EF3B3A]/20
                  opacity-0
                  blur-3xl

                  sm:h-48
                  sm:w-48
                "
              />


              {/* ==========================================
                  CARD HIGHLIGHT
              =========================================== */}

              <div
                className="
                  leader-highlight
                  pointer-events-none
                  absolute
                  inset-0
                  border
                  border-[#EF3B3A]/60
                  opacity-0
                "
              />


              {/* ==========================================
                  RED ACCENT
              =========================================== */}

              <div
                className="
                  leader-line
                  absolute
                  bottom-0
                  left-0
                  h-1
                  w-0
                  bg-[#EF3B3A]
                "
              />


              {/* ==========================================
                  CONTENT
              =========================================== */}

              <div
                className="
                  leader-content
                  absolute
                  bottom-0
                  left-0
                  right-0
                  p-4
                  text-white

                  sm:p-5

                  md:p-5

                  lg:p-6
                "
              >

                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-widest
                    text-[#EF3B3A]

                    sm:text-sm
                  "
                >
                  {leader.role}
                </p>

                <h3
                  className="
                    leader-name
                    mt-1.5
                    text-lg
                    font-semibold
                    tracking-tight

                    sm:text-xl

                    md:text-2xl
                  "
                >
                  {leader.name}
                </h3>

                <div
                  className="
                    mt-2
                    h-px
                    w-7
                    bg-[#EF3B3A]
                  "
                />

              </div>

            </article>
          ))}

        </div>

      </div>
    </section>
  );
};

export default Leadership;