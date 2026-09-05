import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import Lightfall from "../../../components/ui/Lightfall";

const capabilities = [
  "Data Migration",
  "ETL & Integration",
  "Cutover Management",
  "Master Data",
  "AI-Powered Innovation",
  "Analytics & Reporting",
  "Services & AMS",
];

const WhatWeDoHero = () => {
  const sectionRef = useRef(null);
  const capabilityRef = useRef(null);

  const [activeCapability, setActiveCapability] = useState(0);

  /* =========================================================
     HERO INTRO ANIMATION
  ========================================================= */

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia("(max-width: 639px)").matches;
      const isTablet = window.matchMedia(
        "(min-width: 640px) and (max-width: 1023px)"
      ).matches;

      const headingY = isMobile ? 30 : isTablet ? 40 : 60;

      const intro = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
      });

      intro
        .from(".what-hero-label", {
          opacity: 0,
          y: isMobile ? 12 : 20,
          duration: isMobile ? 0.55 : 0.7,
        })

        .from(
          ".what-hero-line",
          {
            opacity: 0,
            y: headingY,
            filter: isMobile ? "blur(7px)" : "blur(12px)",
            duration: isMobile ? 0.8 : 1,
            stagger: isMobile ? 0.08 : 0.12,
          },
          "-=0.3"
        )

        .from(
          ".what-hero-copy",
          {
            opacity: 0,
            y: isMobile ? 12 : 20,
            duration: isMobile ? 0.65 : 0.8,
          },
          "-=0.35"
        )

        .from(
          ".hero-capability-label",
          {
            opacity: 0,
            y: isMobile ? 15 : 25,
            duration: isMobile ? 0.65 : 0.8,
          },
          "-=0.3"
        )

        .from(
          ".hero-scroll",
          {
            opacity: 0,
            duration: 0.6,
          },
          "-=0.2"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* =========================================================
     CAPABILITY ROTATION
  ========================================================= */

  useLayoutEffect(() => {
    const interval = setInterval(() => {
      setActiveCapability((current) => {
        return (current + 1) % capabilities.length;
      });
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     CAPABILITY TEXT ANIMATION
  ========================================================= */

  useLayoutEffect(() => {
    if (!capabilityRef.current) return;

    const isMobile = window.matchMedia("(max-width: 639px)").matches;

    gsap.fromTo(
      capabilityRef.current,
      {
        opacity: 0,
        y: isMobile ? 12 : 18,
        filter: isMobile ? "blur(5px)" : "blur(8px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: isMobile ? 0.5 : 0.65,
        ease: "power3.out",
      }
    );
  }, [activeCapability]);

  return (
    <section
      ref={sectionRef}
      className="
        what-do-hero
        relative
        h-[100svh]
        min-h-[100svh]
        overflow-hidden
        bg-black
      "
    >
      {/* =====================================================
          LIGHTFALL BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
        "
      >
        <Lightfall
          colors={[
            "#FFFFFF",
            "#E5E5E5",
            "#EF3B3A",
          ]}
          backgroundColor="#000000"
          speed={0.2}
          streakCount={1}
          streakWidth={1}
          streakLength={0.7}
          glow={0.45}
          density={0.35}
          twinkle={0.35}
          zoom={3}
          backgroundGlow={0.03}
          opacity={0.45}
          mouseInteraction
          mouseStrength={0.35}
          mouseRadius={0.55}
          color1="#FFFFFF"
          color2="#E5E5E5"
          color3="#EF3B3A"
        />
      </div>

      {/* =====================================================
          DARK OVERLAY
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-1
          bg-black/50
        "
      />

      {/* =====================================================
          CENTER DARKNESS
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-2
          bg-black/20
        "
      />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          h-full
          w-full
          max-w-7xl
          items-center
          px-5
          py-16

          sm:px-6
          sm:py-16

          md:px-10
          md:py-20

          lg:px-16
          lg:py-24
        "
      >
        <div className="w-full max-w-6xl">

          {/* =================================================
              EYEBROW
          ================================================== */}

          <div
            className="
              hero-eyebrow
              flex
              items-center
              gap-3

              sm:gap-4
            "
          >
            <span
              className="
                h-px
                w-7
                bg-[#EF3B3A]

                sm:w-10
              "
            />

            <span
              className="
                what-hero-label
                text-[10px]
                uppercase
                tracking-[0.25em]
                text-white/50

                sm:text-xs
                sm:tracking-[0.3em]
              "
            >
              What We Do
            </span>
          </div>

          {/* =================================================
              MAIN HEADING
          ================================================== */}

          <h1
            className="
              hero-title
              mt-4
              overflow-hidden
              text-[2.15rem]
              font-semibold
              leading-[1.02]
              tracking-tight

              sm:mt-5
              sm:text-5xl
              sm:leading-tight

              md:mt-6
              md:text-6xl

              lg:text-7xl
            "
          >
            <span className="what-hero-line block">
              Transform complexity
            </span>

            <span
              className="
                what-hero-line
                block
                text-white/30
              "
            >
              Create intelligence.
            </span>
          </h1>

          {/* =================================================
              DESCRIPTION
          ================================================== */}

          <p
            className="
              what-hero-copy
              mt-4
              max-w-[20rem]
              text-xs
              leading-relaxed
              text-white/45

              sm:mt-5
              sm:max-w-lg
              sm:text-sm

              md:mt-6
              md:max-w-xl
              md:text-base
            "
          >
            We bring together enterprise data, technology,
            analytics and intelligent solutions to help
            organizations build smarter, more connected
            businesses.
          </p>

          {/* =================================================
              CENTERED EXPERTISE
          ================================================== */}

          <div
            className="
              hero-capability-label
              mt-7
              flex
              flex-col
              items-center
              text-center

              sm:mt-8

              md:mt-10
            "
          >
            {/* Expertise Label */}

            <div
              className="
                flex
                items-center
                gap-3

                sm:gap-5
              "
            >
              <span
                className="
                  h-px
                  w-7
                  bg-[#EF3B3A]

                  sm:w-10
                "
              />

              <span
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.25em]
                  text-white/35

                  sm:text-xs
                  sm:tracking-[0.3em]
                "
              >
                Expertise
              </span>

              <span
                className="
                  h-px
                  w-7
                  bg-[#EF3B3A]

                  sm:w-10
                "
              />
            </div>

            {/* Active Capability */}

            <div
              ref={capabilityRef}
              className="
                mt-3
                min-h-10
                text-2xl
                font-semibold
                tracking-tight
                text-white

                sm:mt-4
                sm:min-h-12
                sm:text-4xl

                md:min-h-14
                md:text-5xl

                lg:text-6xl
              "
            >
              {capabilities[activeCapability]}
            </div>

            {/* Capability Progress */}

            <div
              className="
                mt-4
                flex
                items-center
                gap-1.5

                sm:mt-5
                sm:gap-2
              "
            >
              {capabilities.map((capability, index) => (
                <span
                  key={capability}
                  className={`
                    h-px
                    transition-all
                    duration-500
                    ${
                      index === activeCapability
                        ? "w-6 bg-[#EF3B3A] sm:w-8"
                        : "w-2 bg-white/20 sm:w-3"
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SCROLL INDICATOR
      ====================================================== */}

      <div
        className="
          hero-scroll
          absolute
          bottom-4
          left-1/2
          z-10
          flex
          -translate-x-1/2
          flex-col
          items-center
          gap-1.5

          sm:bottom-5
          sm:gap-2

          md:bottom-7
        "
      >
        <span
          className="
            text-[9px]
            uppercase
            tracking-[0.25em]
            text-white/25

            sm:text-[10px]
            sm:tracking-[0.3em]
          "
        >
          Scroll
        </span>

        <span
          className="
            h-6
            w-px
            bg-white/20

            sm:h-8
          "
        />
      </div>

      {/* =====================================================
          PAGE INDICATOR
      ====================================================== */}

      {/* <div
        className="
          absolute
          bottom-7
          right-8
          z-10
          text-xs
          tracking-[0.25em]
          text-white/20
          md:right-12
        "
      >
        01 / 03
      </div> */}
    </section>
  );
};

export default WhatWeDoHero;