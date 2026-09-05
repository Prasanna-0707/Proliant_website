import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

import DotField from "@/components/ui/DotField";

const Hero = () => {
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* =====================================================
         RESPONSIVE ANIMATION VALUES
      ===================================================== */

      const isMobile = window.matchMedia("(max-width: 639px)").matches;

      const isTablet = window.matchMedia(
        "(min-width: 640px) and (max-width: 1279px)"
      ).matches;

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
          y: isMobile ? 15 : isTablet ? 20 : 25,
          duration: isMobile ? 0.6 : 0.7,
          ease: "power3.out",
        })

        /* -------------------------------------------------
           TITLE
        ------------------------------------------------- */

        .from(
          ".who-hero-title-line",
          {
            opacity: 0,
            y: isMobile ? 45 : isTablet ? 60 : 80,
            filter: isMobile ? "blur(8px)" : "blur(12px)",
            duration: isMobile ? 0.8 : 1,
            stagger: isMobile ? 0.08 : 0.12,
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
            y: isMobile ? 20 : 30,
            duration: isMobile ? 0.65 : 0.8,
            ease: "power3.out",
          },
          isMobile ? "-=0.3" : "-=0.45"
        )

        /* -------------------------------------------------
           SCROLL INDICATOR
        ------------------------------------------------- */

        .from(
          ".who-hero-scroll",
          {
            opacity: 0,
            y: isMobile ? 12 : 20,
            duration: isMobile ? 0.55 : 0.7,
            ease: "power3.out",
          },
          isMobile ? "-=0.2" : "-=0.3"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="
        relative
        flex
        items-center
        overflow-hidden
        bg-black

        /* =================================================
           MOBILE
           ================================================= */

        h-[60svh]
        min-h-[400px]
        max-h-[550px]

        /* =================================================
           LARGE MOBILE / SMALL TABLET
           ================================================= */

        sm:h-[55svh]
        sm:min-h-[430px]
        sm:max-h-[600px]

        /* =================================================
           TABLET
           ================================================= */

        md:h-[50svh]
        md:min-h-[500px]
        md:max-h-[680px]

        /* =================================================
           DESKTOP
           ================================================= */

        xl:min-h-screen
        xl:h-auto

        /* =================================================
           SHORT DESKTOP / NEST HUB
           ================================================= */

        [@media(min-width:1024px)_and_(max-height:800px)]:h-screen
        [@media(min-width:1024px)_and_(max-height:800px)]:min-h-screen
        [@media(min-width:1024px)_and_(max-height:800px)]:max-h-none
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

      {/* ==========================================
          DARK OVERLAY
      =========================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-1
          bg-black/35
        "
      />

      {/* ==========================================
          VERTICAL ACCENT
      =========================================== */}

      <div
        className="
          absolute
          left-4
          top-1/2
          h-16
          w-2px
          -translate-y-1/2
          bg-[#EF3B3A]

          sm:left-5
          sm:h-20

          md:left-10
          md:h-24
        "
      />

      {/* ==========================================
          HERO CONTENT
      =========================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-1500px

          px-5
          py-12

          /* -----------------------------------------
             SMALL MOBILE
             ----------------------------------------- */

          translate-y-4

          /* -----------------------------------------
             iPhone Mini / very small screens
             ----------------------------------------- */

          [@media(max-width:374px)]:translate-y-8

          /* -----------------------------------------
             LARGE MOBILE / TABLET
             ----------------------------------------- */

          sm:px-8
          sm:py-14
          sm:translate-y-0

          /* -----------------------------------------
             TABLET
             ----------------------------------------- */

          md:px-16
          md:py-20

          /* -----------------------------------------
             iPad Mini only: 768px - 819px
             Adds a little more space between the
             header/logo and WHO WE ARE.
             ----------------------------------------- */

          [@media(min-width:768px)_and_(max-width:819px)]:translate-y-4

          /* -----------------------------------------
             LARGE TABLET / iPad Air
             820px+
             ----------------------------------------- */

          lg:px-24
          lg:py-32
        "
      >
        <div className="max-w-6xl">

          {/* ==========================================
              LABEL
          =========================================== */}

          <p
            className="
              who-hero-label
              mb-4
              text-xs
              font-medium
              uppercase
              tracking-[2px]
              text-[#EF3B3A]

              sm:mb-5
              md:text-sm
            "
          >
            Who We Are
          </p>

          {/* ==========================================
              TITLE
          =========================================== */}

          <h1
            className="
              text-[clamp(2rem,8vw,3.75rem)]
              font-semibold
              leading-[0.92]
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
              mt-6
              max-w-2xl
              text-base
              leading-relaxed
              text-white/55

              sm:mt-7

              md:mt-9
              md:text-lg

              lg:mt-10
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
              mt-7
              flex
              items-center
              gap-3
              text-xs
              uppercase
              tracking-[0.16em]
              text-white/35

              sm:mt-8
              sm:gap-4
              sm:text-sm
              sm:tracking-[0.2em]

              md:mt-10

              lg:mt-12
            "
          >
            <span
              className="
                h-px
                w-8
                bg-[#EF3B3A]

                sm:w-10
                md:w-12
              "
            />

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
          bottom-4
          right-4
          text-[10px]
          tracking-[0.25em]
          text-white/25

          sm:bottom-5
          sm:right-5

          sm:text-xs
          sm:tracking-[0.3em]

          md:bottom-8
          md:right-16
        "
      >
        01 / 05
      </div>
    </section>
  );
};

export default Hero;