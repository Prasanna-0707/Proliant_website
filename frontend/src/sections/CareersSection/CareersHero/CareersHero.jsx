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
      className="relative min-h-screen overflow-hidden bg-black text-white"
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
        className="career-hero-video absolute inset-0 h-full w-full object-cover opacity-0"
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

      <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/20 to-transparent" />

      <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />

      {/* =========================
          CAREERS LABEL
      ========================== */}

      <div className="absolute left-8 top-20 z-10 flex items-center gap-3 md:left-16 md:top-24 lg:left-24">
        <span className="h-9 w-1 bg-[#EF3B3A]" />

        <span className="career-hero-label text-xs font-medium uppercase tracking-[0.2em] text-white/65">
          Careers
        </span>
      </div>

      {/* =========================
          HERO CONTENT
      ========================== */}

      <div className="relative z-10 flex min-h-screen items-center px-8 pt-12 md:px-16 lg:px-24">
        <div className="max-w-4xl">
          <h1 className="text-[clamp(1.875rem,7vw,3.75rem)] font-semibold leading-none tracking-tight sm:text-6xl md:text-7xl lg:text-7xl">
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

          <p className="career-hero-copy mt-6 max-w-lg text-sm leading-relaxed text-white/60 md:text-base">
            Join a team that combines people, data and technology to solve
            meaningful problems for organizations around the world.
          </p>

          <a
            href="#get-in-touch"
            className="career-hero-button mt-7 inline-flex items-center gap-4 rounded-full bg-white px-6 py-3 text-xs font-medium uppercase tracking-widest text-black transition-all duration-300 hover:bg-[#EF3B3A] hover:text-white"
          >
            Explore Opportunities

            <span className="text-base">→</span>
          </a>
        </div>
      </div>

      {/* =========================
          SCROLL INDICATOR
      ========================== */}

      <div className="absolute bottom-7 left-8 z-10 flex items-center gap-3 md:left-16 lg:left-24">
        <span className="text-[10px] uppercase tracking-widest text-white/40">
          Scroll
        </span>

        <span className="h-px w-10 bg-white/30" />
      </div>
    </section>
  );
};

export default CareersHero;