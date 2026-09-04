import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import enterpriseDataImage from "@/assets/images/Home/EDI.png";
import cutoverImage from "@/assets/images/Home/CA.jpg";
import aiInnovationImage from "@/assets/images/Home/API.jpg";
import applicationManagementImage from "@/assets/images/Home/AMS.jpg";

gsap.registerPlugin(ScrollTrigger);

const FeaturedTechnologies = () => {
  const sectionRef = useRef(null);
  const [openCard, setOpenCard] = useState(null);

  const technologies = [
    {
      id: 1,
      name: "Enterprise Data Management",
      image: enterpriseDataImage,
      description:
        "Proliant Data provides enterprise-grade capabilities across governance, quality, migration, and analytics to accelerate digital transformation.",
    },
    {
      id: 2,
      name: "Cutover Management",
      image: cutoverImage,
      description:
        "Proliant's proprietary tool, ZenithCutPro, streamlines and governs cutover execution for large-scale SAP and enterprise transformations—ensuring precision, visibility, and control across global rollouts.",
    },
    {
      id: 3,
      name: "AI-Powered Innovation",
      image: aiInnovationImage,
      description:
        "Driving transformation with next-generation tools, accelerators, and automation that enhance speed, accuracy, and decision-making.",
    },
    {
      id: 4,
      name: "Application Management Services (AMS)",
      image: applicationManagementImage,
      description:
        "Continuous Data Management, Governance, and Application Support services that ensure stability, performance, and continuous improvement across enterprise systems.",
    },
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".featured-tech-card");
      const images = gsap.utils.toArray(".featured-tech-card img");

      gsap.set(".featured-tech-label", {
        opacity: 0,
        y: 20,
      });

      gsap.set(".featured-tech-heading", {
        opacity: 0,
        y: 45,
        filter: "blur(8px)",
      });

      gsap.set(cards, {
        opacity: 0,
        y: 50,
      });

      const createAnimations = () => {
        ScrollTrigger.refresh();

        gsap.to(".featured-tech-label", {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        });

        gsap.to(".featured-tech-heading", {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power4.out",
        });

        gsap.to(cards, {
          scrollTrigger: {
            trigger: ".featured-tech-grid",
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.14,
          ease: "power3.out",
        });

        ScrollTrigger.refresh();
      };

      const waitForImages = () => {
        const pendingImages = images.filter(
          (image) => !image.complete
        );

        if (pendingImages.length === 0) {
          createAnimations();
          return;
        }

        let loaded = 0;

        const handleImageLoad = () => {
          loaded += 1;

          if (loaded === pendingImages.length) {
            createAnimations();
          }
        };

        pendingImages.forEach((image) => {
          image.addEventListener("load", handleImageLoad, {
            once: true,
          });

          image.addEventListener("error", handleImageLoad, {
            once: true,
          });
        });
      };

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          waitForImages();
        });
      } else {
        waitForImages();
      }

      const refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);

      window.addEventListener("load", ScrollTrigger.refresh);

      return () => {
        clearTimeout(refreshTimer);
        window.removeEventListener("load", ScrollTrigger.refresh);
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleCardToggle = (id) => {
    setOpenCard((current) => (current === id ? null : id));
  };

  return (
    <section
      ref={sectionRef}
      className="
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

        {/* ==========================================
            HEADING
        ========================================== */}

        <div className="mb-12 md:mb-14">
          <p
            className="mb-5 text-xs font-medium uppercase tracking-[2px] text-red-600 md:text-sm"
          >
            Technologies
          </p>

          <h2
            className="
              featured-tech-heading
              text-3xl
              font-semibold
              leading-tight
              tracking-tight
              sm:text-4xl
              md:text-5xl
              lg:text-6xl
            "
          >
            Featured Technologies
          </h2>
        </div>

        {/* ==========================================
            CARDS
        ========================================== */}

        <div
          className="
            featured-tech-grid
            grid
            grid-cols-1
            gap-5
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {technologies.map((tech) => {
            const isOpen = openCard === tech.id;

            return (
              <article
                key={tech.id}
                className="
                  featured-tech-card
                  group
                  relative
                  h-96
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/10
                  bg-zinc-900
                  transition-all
                  duration-500
                  ease-out
                  hover:-translate-y-2
                  hover:border-[#EF3B3A]/60
                "
              >

                {/* ======================================
                    IMAGE
                ======================================= */}

                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={tech.image}
                    alt={tech.name}
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-105
                    "
                    onLoad={() => {
                      console.log(
                        "IMAGE LOADED:",
                        tech.name,
                        tech.image
                      );
                    }}
                    onError={(e) => {
                      console.error(
                        "IMAGE FAILED:",
                        tech.name,
                        tech.image
                      );
                      console.error(
                        "SRC:",
                        e.currentTarget.src
                      );
                    }}
                  />
                </div>

                {/* ======================================
                    IMAGE DARK GRADIENT
                ======================================= */}

                <div
                  className="
                    absolute
                    inset-0
                    bg-linear-to-t
                    from-black
                    via-black/55
                    to-black/10
                    opacity-95
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                  "
                />

                {/* ======================================
                    RED ATMOSPHERIC GLOW
                ======================================= */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-48
                    w-48
                    rounded-full
                    bg-[#EF3B3A]/20
                    opacity-0
                    blur-3xl
                    transition-opacity
                    duration-700
                    group-hover:opacity-100
                  "
                />

                {/* ======================================
                    CARD NUMBER
                ======================================= */}

                {/*
                <div
                  className="
                    absolute
                    left-5
                    top-5
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/30
                    bg-black/30
                    text-xs
                    text-white/80
                    backdrop-blur-sm
                    transition-all
                    duration-500
                    group-hover:border-[#EF3B3A]
                    group-hover:bg-[#EF3B3A]
                    group-hover:text-white
                  "
                >
                  0{tech.id}
                </div>
                */}

                {/* ======================================
                    ORIGINAL CARD CONTENT
                ======================================= */}

                <div
                  className="
                    absolute
                    bottom-0
                    left-0
                    right-0
                    p-5
                    md:p-6
                  "
                >
                  <div className="flex items-end justify-between gap-4">

                    <h3
                      className="
                        max-w-4/5
                        text-lg
                        font-semibold
                        leading-tight
                        tracking-tight
                        text-white
                        transition-transform
                        duration-500
                        group-hover:translate-x-1
                        md:text-xl
                      "
                    >
                      {tech.name}
                    </h3>

                    {/* ==================================
                        PLUS BUTTON
                    =================================== */}

                    <button
                      type="button"
                      aria-label={
                        isOpen
                          ? `Close ${tech.name}`
                          : `Show details for ${tech.name}`
                      }
                      aria-expanded={isOpen}
                      onClick={() => handleCardToggle(tech.id)}
                      className="
                        relative
                        z-30
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/70
                        bg-black/30
                        text-xl
                        font-light
                        text-white
                        backdrop-blur-sm
                        transition-all
                        duration-500
                        group-hover:border-[#EF3B3A]
                        group-hover:bg-[#EF3B3A]
                      "
                    >
                      <span
                        className={`
                          transition-transform
                          duration-300
                          ease-out
                          ${isOpen ? "rotate-45" : "rotate-0"}
                        `}
                      >
                        +
                      </span>
                    </button>
                  </div>

                  {/* ==================================
                      RED ACCENT LINE
                  =================================== */}

                  <div
                    className="
                      mt-4
                      h-px
                      w-8
                      bg-[#EF3B3A]
                      transition-all
                      duration-500
                      group-hover:w-16
                    "
                  />
                </div>

                {/* ======================================
                    DETAIL CARD
                    OPENS FROM CENTER OF TECHNOLOGY CARD
                ======================================= */}

                {/* ======================================
    DETAIL CARD
    OPENS FROM PLUS ICON
======================================= */}

                <div
                  className={`
                    absolute
                    inset-8
                    z-20
                    flex
                    items-start
                    justify-start
                    overflow-hidden
                    rounded-xl
                    border
                    border-black/10
                    bg-white
                    p-4
                    text-black
                    shadow-2xl
                    origin-bottom-right
                    transition-all
                    duration-500
                    ease-out
                    md:inset-10
                    md:p-5
                    ${
                      isOpen
                        ? "scale-100 opacity-100"
                        : "pointer-events-none scale-0 opacity-0"
                    }
                  `}
                >
                  <div className="w-full">

                    {/* DETAIL TITLE */}

                    <h4
                      className="
                        text-base
                        font-semibold
                        leading-tight
                        tracking-tight
                        text-black
                        md:text-lg
                      "
                    >
                      {tech.name}
                    </h4>

                    {/* RED LINE */}

                    <div
                      className="
                        mt-2
                        h-px
                        w-8
                        bg-[#EF3B3A]
                      "
                    />

                    {/* DESCRIPTION */}

                    <p
                      className="
                        mt-3
                        text-xs
                        leading-relaxed
                        text-black
                        md:text-sm
                      "
                    >
                      {tech.description}
                    </p>

                  </div>
                </div>

              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTechnologies;