import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

import DotField from "@/components/ui/DotField";

const Hero = () => {
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* =====================================================
         HERO INTRO ANIMATION
      ===================================================== */

      const heroTl = gsap.timeline();

      heroTl
        /* -------------------------------------------------
           LABEL
        ------------------------------------------------- */
        .from(".who-hero-label", {
          opacity: 0,
          y: 25,
          duration: 0.7,
          ease: "power3.out",
        })

        /* -------------------------------------------------
           TITLE
        ------------------------------------------------- */
        .from(
          ".who-hero-title-line",
          {
            opacity: 0,
            y: 80,
            filter: "blur(12px)",
            duration: 1,
            stagger: 0.12,
            ease: "power4.out",
          },
          "-=0.35"
        )

        /* -------------------------------------------------
           DESCRIPTION
        ------------------------------------------------- */
        .from(
          ".who-hero-description",
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.45"
        )

        /* -------------------------------------------------
           SCROLL INDICATOR
        ------------------------------------------------- */
        .from(
          ".who-hero-scroll",
          {
            opacity: 0,
            y: 20,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.3"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="about"
      className="
        relative
        flex
        min-h-screen
        items-center
        overflow-hidden
        bg-black
      "
    >
      {/* ==========================================
          DOT FIELD HERO BACKGROUND
      =========================================== */}

      <div
        className="
          absolute
          inset-0
          z-0
        "
      >
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          bulgeStrength={67}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={500}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom="#EF3B3A"
          gradientTo="#B497CF"
          glowColor="#120F17"
        />
      </div>

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-1
          bg-black/35
        "
      />

      {/* Vertical accent */}

      <div
        className="
          absolute
          left-6
          top-1/2
          h-24
          w-2px
          -translate-y-1/2
          bg-[#EF3B3A]
          md:left-10
        "
      />

      {/* Hero content */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-1500px
          px-8
          py-32
          md:px-16
          lg:px-24
        "
      >
        <div className="max-w-6xl">

          {/* ==========================================
              LABEL
          =========================================== */}

          <p
            className="
              who-hero-label
              mb-8
              text-sm
              uppercase
              tracking-[0.35em]
              text-[#EF3B3A]
              md:text-base
            "
          >
            Who We Are
          </p>

          {/* ==========================================
              TITLE
          =========================================== */}

          <h1
            className="
              text-[clamp(1.875rem,7vw,3.75rem)]
              font-semibold
              leading-[0.9]
              tracking-[-0.055em]
              sm:text-6xl
              md:text-7xl
              lg:text-[clamp(4rem,8vw,8rem)]
            "
          >
            <span className="who-hero-title-line block">
              Building
            </span>

            <span className="who-hero-title-line block">
              intelligence
            </span>

            <span className="who-hero-title-line block text-white/35">
              behind business.
            </span>
          </h1>

          {/* ==========================================
              DESCRIPTION
          =========================================== */}

          <p
            className="
              who-hero-description
              mt-10
              max-w-2xl
              text-base
              leading-relaxed
              text-white/55
              md:text-lg
              lg:text-xl
            "
          >
            Proliant Data combines enterprise data, SAP,
            analytics and AI to help organizations transform
            complexity into measurable business value.
          </p>

          {/* ==========================================
              SCROLL INDICATOR
          =========================================== */}

          <div
            className="
              who-hero-scroll
              mt-12
              flex
              items-center
              gap-4
              text-sm
              uppercase
              tracking-[0.2em]
              text-white/35
            "
          >
            <span className="h-px w-12 bg-[#EF3B3A]" />

            <span>Scroll to explore</span>
          </div>

        </div>
      </div>

      {/* ==========================================
          PAGE INDICATOR
      =========================================== */}

      <div
        className="
          absolute
          bottom-8
          right-8
          text-xs
          tracking-[0.3em]
          text-white/25
          md:right-16
        "
      >
        01 / 05
      </div>
    </section>
  );
};

export default Hero;