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
      const intro = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
      });

      intro
        .from(".what-hero-label", {
          opacity: 0,
          y: 20,
          duration: 0.7,
        })

        .from(
          ".what-hero-line",
          {
            opacity: 0,
            y: 60,
            filter: "blur(12px)",
            duration: 1,
            stagger: 0.12,
          },
          "-=0.35"
        )

        .from(
          ".what-hero-copy",
          {
            opacity: 0,
            y: 20,
            duration: 0.8,
          },
          "-=0.45"
        )

        .from(
          ".hero-capability-label",
          {
            opacity: 0,
            y: 25,
            duration: 0.8,
          },
          "-=0.35"
        )

        .from(
          ".hero-scroll",
          {
            opacity: 0,
            duration: 0.6,
          },
          "-=0.25"
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

    gsap.fromTo(
      capabilityRef.current,
      {
        opacity: 0,
        y: 18,
        filter: "blur(8px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.65,
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
        h-screen
        min-h-screen
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
          px-8
          py-24
          md:px-12
          lg:px-16
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
              gap-4
            "
          >
            <span className="h-px w-10 bg-[#EF3B3A]" />

            <span
              className="
                what-hero-label
                text-xs
                uppercase
                tracking-[0.3em]
                text-white/50
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
              mt-6
              overflow-hidden
              text-4xl
              font-semibold
              leading-tight
              tracking-tight
              sm:text-5xl
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
              mt-6
              max-w-xl
              text-sm
              leading-relaxed
              text-white/45
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
              mt-10
              flex
              flex-col
              items-center
              text-center
            "
          >
            {/* Expertise Label */}

            <div
              className="
                flex
                items-center
                gap-5
              "
            >
              <span className="h-px w-10 bg-[#EF3B3A]" />

              <span
                className="
                  text-xs
                  uppercase
                  tracking-[0.3em]
                  text-white/35
                "
              >
                Expertise
              </span>

              <span className="h-px w-10 bg-[#EF3B3A]" />
            </div>

            {/* Active Capability */}

            <div
              ref={capabilityRef}
              className="
                mt-4
                min-h-14
                text-3xl
                font-semibold
                tracking-tight
                text-white
                sm:text-4xl
                md:text-5xl
                lg:text-6xl
              "
            >
              {capabilities[activeCapability]}
            </div>

            {/* Capability Progress */}

            <div className="mt-5 flex items-center gap-2">
              {capabilities.map((capability, index) => (
                <span
                  key={capability}
                  className={`
                    h-px
                    transition-all
                    duration-500
                    ${
                      index === activeCapability
                        ? "w-8 bg-[#EF3B3A]"
                        : "w-3 bg-white/20"
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
          bottom-7
          left-1/2
          z-10
          flex
          -translate-x-1/2
          flex-col
          items-center
          gap-2
        "
      >
        <span
          className="
            text-[10px]
            uppercase
            tracking-[0.3em]
            text-white/25
          "
        >
          Scroll
        </span>

        <span
          className="
            h-8
            w-px
            bg-white/20
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