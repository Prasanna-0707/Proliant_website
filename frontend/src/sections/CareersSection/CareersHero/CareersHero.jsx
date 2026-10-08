import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

import careerVideo from "../../../assets/videos/Careers/earth.mp4";

const CareersHero = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // =========================
      // HERO VIDEO FADE-IN
      // =========================
      gsap.to(".career-hero-video", {
        opacity: 1,
        duration: 1.8,
        ease: "power2.out",
      });

      // =========================
      // CAREERS LABEL
      // =========================
      gsap.from(".career-hero-label", {
        opacity: 0,
        x: -20,
        duration: 0.7,
        ease: "power3.out",
      });

      // =========================
      // HERO TITLE
      // =========================
      gsap.from(".career-hero-title-line", {
        opacity: 0,
        y: 45,
        filter: "blur(8px)",
        duration: 0.9,
        stagger: 0.1,
        delay: 0.15,
        ease: "power4.out",
      });

      // =========================
      // HERO COPY
      // =========================
      gsap.from(".career-hero-copy", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        delay: 0.5,
        ease: "power3.out",
      });

      // =========================
      // HERO BUTTON
      // =========================
      gsap.from(".career-hero-button", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        delay: 0.65,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        relative

        /* =========================
           HERO HEIGHT
           Same compact mobile height
           as the previous sections
        ========================== */

        h-[42svh]
        min-h-[42svh]

        sm:h-[42svh]
        sm:min-h-[42svh]

        md:h-[42svh]
        md:min-h-[42svh]

        lg:h-[100svh]
        lg:min-h-[100svh]

        overflow-hidden
        bg-black
        text-white
      "
    >
      {/* =========================
          HERO VIDEO
      ========================== */}

      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="
          career-hero-video
          absolute
          inset-0
          h-full
          w-full
          object-cover
          opacity-0
        "
        style={{
          objectPosition: "40% center",
          filter: "brightness(1.35) contrast(1.12)",
        }}
      >
        <source src={careerVideo} type="video/mp4" />

        Your browser does not support the video element.
      </video>

      {/* =========================
          SOFT OVERLAY
      ========================== */}

      <div className="absolute inset-0 bg-black/10" />

      <div
        className="
          absolute
          inset-0
          bg-linear-to-r
          from-black/65
          via-black/20
          to-transparent
        "
      />

      <div
        className="
          absolute
          inset-0
          bg-linear-to-t
          from-black/30
          via-transparent
          to-transparent
        "
      />

      {/* =========================
          CAREERS LABEL
      ========================== */}

      <div
        className="
          absolute
          left-5
          top-16
          z-10
          flex
          items-center
          gap-2

          sm:left-8
          sm:top-20
          sm:gap-3

          md:left-16
          md:top-24

          lg:left-24
        "
      >
        <span
          className="
            h-7
            w-1
            bg-[#EF3B3A]

            sm:h-9
          "
        />

        <span
          className="
            career-hero-label
            text-[9px]
            font-medium
            uppercase
            tracking-[0.2em]
            text-white/65

            sm:text-xs
          "
        >
          Careers
        </span>
      </div>

      {/* =========================
          HERO CONTENT
      ========================== */}

      <div
        className="
          relative
          z-10
          flex
          h-full
          min-h-0
          items-start
          px-5
          pt-28

          sm:px-8
          sm:pt-32

          md:items-center
          md:px-16
          md:pt-12

          lg:px-24
        "
      >
        <div
          className="
            max-w-4xl
            w-full
          "
        >
          {/* =========================
              HERO TITLE
          ========================== */}

          <h1
            className="
              text-[1.75rem]
              font-semibold
              leading-[0.98]
              tracking-tight

              sm:text-5xl
              sm:leading-none

              md:text-7xl

              lg:text-7xl
            "
          >
            <span className="career-hero-title-line block">
              Work locally,
            </span>

            <span className="career-hero-title-line block">
              thrive globally.
            </span>

            <span className="career-hero-title-line block text-white/35">
              Build what&apos;s next.
            </span>
          </h1>

          {/* =========================
              HERO DESCRIPTION
          ========================== */}

          <p
            className="
              career-hero-copy
              mt-3
              max-w-[20rem]
              text-[10px]
              leading-relaxed
              text-white/60

              sm:mt-5
              sm:max-w-lg
              sm:text-sm

              md:mt-6
              md:text-base
            "
          >
            Join a team that combines people, data and technology to solve
            meaningful problems for organizations around the world.
          </p>

          {/* =========================
              HERO BUTTON
          ========================== */}

          <a
            href="#get-in-touch"
            className="
              career-hero-button
              mt-4
              inline-flex
              items-center
              gap-3
              rounded-full
              bg-white
              px-4
              py-2
              text-[9px]
              font-medium
              uppercase
              tracking-widest
              text-black
              transition-all
              duration-300
              hover:bg-[#EF3B3A]
              hover:text-white

              sm:mt-7
              sm:gap-4
              sm:px-6
              sm:py-3
              sm:text-xs
            "
          >
            Explore Opportunities

            <span className="text-sm sm:text-base">
              →
            </span>
          </a>
        </div>
      </div>

      {/* =========================
          SCROLL INDICATOR
      ========================== */}

      <div
        className="
          absolute
          bottom-4
          left-5
          z-10
          flex
          items-center
          gap-2

          sm:bottom-5
          sm:left-8
          sm:gap-3

          md:bottom-7
          md:left-16

          lg:left-24
        "
      >
        <span
          className="
            text-[8px]
            uppercase
            tracking-widest
            text-white/40

            sm:text-[10px]
          "
        >
          Scroll
        </span>

        <span
          className="
            h-px
            w-7
            bg-white/30

            sm:w-10
          "
        />
      </div>
    </section>
  );
};

export default CareersHero;