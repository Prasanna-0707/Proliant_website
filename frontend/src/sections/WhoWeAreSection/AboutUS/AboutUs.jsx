import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Responsive animation values
      const isMobile = window.matchMedia("(max-width: 639px)").matches;
      const isTablet = window.matchMedia(
        "(min-width: 640px) and (max-width: 1279px)"
      ).matches;

      const headingY = isMobile ? 30 : isTablet ? 40 : 60;
      const copyY = isMobile ? 20 : isTablet ? 30 : 40;
      const pointY = isMobile ? 20 : isTablet ? 25 : 35;

      /* =====================================================
        ABOUT US LABEL
      ===================================================== */

      gsap.from(".story-label", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        x: isMobile ? -15 : -30,
        duration: 0.8,
        ease: "power3.out",
      });

      /* =====================================================
        ABOUT US HEADING
      ===================================================== */

      gsap.from(".story-heading-line", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: headingY,
        filter: isMobile ? "blur(6px)" : "blur(10px)",
        duration: isMobile ? 0.75 : 0.9,
        stagger: isMobile ? 0.08 : 0.12,
        ease: "power4.out",
      });

      /* =====================================================
        ABOUT US DESCRIPTION
      ===================================================== */

      gsap.from(".story-copy", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: copyY,
        filter: isMobile ? "blur(4px)" : "blur(6px)",
        duration: isMobile ? 0.75 : 0.9,
        delay: isMobile ? 0.1 : 0.2,
        ease: "power3.out",
      });

      /* =====================================================
        TIMELINE LINE
      ===================================================== */

      gsap.from(".story-line", {
        scrollTrigger: {
          trigger: ".story-timeline",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        scaleX: 0,
        transformOrigin: "left center",
        duration: isMobile ? 1 : 1.4,
        ease: "power3.inOut",
      });

      /* =====================================================
        TIMELINE POINTS
      ===================================================== */

      gsap.from(".story-point", {
        scrollTrigger: {
          trigger: ".story-timeline",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: pointY,
        stagger: isMobile ? 0.12 : 0.18,
        duration: isMobile ? 0.7 : 0.8,
        ease: "power3.out",
      });

      /* =====================================================
        TIMELINE DOTS
      ===================================================== */

      gsap.from(".story-point-dot", {
        scrollTrigger: {
          trigger: ".story-timeline",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        scale: 0,
        opacity: 0,
        stagger: isMobile ? 0.12 : 0.18,
        duration: isMobile ? 0.4 : 0.5,
        ease: "back.out(1.7)",
      });

      /* =====================================================
        REFRESH SCROLLTRIGGER
      ===================================================== */

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="
        story-section
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
        xl:py-24
      "
    >
      <div className="mx-auto max-w-1500px">

        {/* =====================================================
            ABOUT US CONTENT
        ====================================================== */}

        <div
          className="
            grid
            gap-8

            md:gap-10

            lg:grid-cols-[0.7fr_1.3fr]
            lg:items-start
            lg:gap-12

            xl:gap-20
          "
        >

          {/* LEFT — HEADING */}

          <div>
            <p
              className="
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
              About Us
            </p>

            <h2
              className="
                mt-3
                text-[clamp(1.875rem,8vw,3rem)]
                font-semibold
                leading-[0.92]
                tracking-tight

                sm:text-[clamp(2rem,6vw,3.25rem)]

                md:text-5xl

                lg:text-6xl

                xl:text-7xl
              "
            >
              <span className="story-heading-line block">
                From data
              </span>

              <span className="story-heading-line block">
                to
              </span>

              <span className="story-heading-line block text-[#EF3B3A]">
                transformation.
              </span>
            </h2>
          </div>

          {/* RIGHT — CONTENT */}

          <div
            className="
              story-copy
              max-w-4xl

              lg:pt-1
            "
          >
            <p
              className="
                mt-3
                text-[0.95rem]
                leading-[1.65]
                text-black/50

                sm:text-base

                md:text-lg
                md:leading-[1.7]
              "
            >
              Our growth is fueled by a team of seasoned
              consultants, architects, and technologists with
              decades of experience in driving complex global
              transformations. With a technology-agnostic,
              innovation-first approach, we design scalable,
              business-aligned solutions that deliver real impact.
              From solving today&apos;s challenges to enabling
              tomorrow&apos;s possibilities, Proliant helps
              enterprises harness data, optimize operations,
              and future-proof their business.
            </p>
          </div>
        </div>

        {/* =====================================================
            JOURNEY / TIMELINE
        ====================================================== */}

        <div
          className="
            story-timeline
            relative
            mt-10
            border-t
            border-black/10
            pt-7

            sm:mt-12
            sm:pt-8

            md:mt-14
            md:pt-10

            lg:mt-16
            lg:pt-10

            xl:mt-20
            xl:pt-12
          "
        >

          {/* Animated Timeline Line */}

          <div
            className="
              story-line
              absolute
              left-0
              right-0
              top-0
              h-px
              origin-left
              bg-black/10
            "
          />

          <div
            className="
              grid
              gap-8

              sm:gap-8

              md:grid-cols-2
              md:gap-x-8
              md:gap-y-10

              lg:grid-cols-4
              lg:gap-6
          "
          >

            {/* =================================================
                01 — DATA MIGRATION
            ================================================== */}

            <div
              className="
                story-point
                relative
                pt-3

                md:pt-4

                lg:pt-5
              "
            >
              <span
                className="
                  story-point-dot
                  absolute
                  left-0
                  top-0
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-[#EF3B3A]
                "
              />

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-[#EF3B3A]
                "
              >
                The Beginning
              </p>

              <h3
                className="
                  mt-2
                  text-lg
                  font-semibold
                  tracking-tight

                  sm:text-xl

                  md:text-2xl
                "
              >
                Data Migration
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  leading-relaxed
                  text-black/45
                "
              >
                Building our foundation in data migration and
                governance.
              </p>
            </div>

            {/* =================================================
                02 — ENTERPRISE DATA
            ================================================== */}

            <div
              className="
                story-point
                relative
                pt-3

                md:pt-4

                lg:pt-5
              "
            >
              <span
                className="
                  story-point-dot
                  absolute
                  left-0
                  top-0
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-[#EF3B3A]
                "
              />

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-[#EF3B3A]
                "
              >
                Expansion
              </p>

              <h3
                className="
                  mt-2
                  text-lg
                  font-semibold
                  tracking-tight

                  sm:text-xl

                  md:text-2xl
                "
              >
                Enterprise Data
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  leading-relaxed
                  text-black/45
                "
              >
                Expanding into end-to-end enterprise data
                management.
              </p>
            </div>

            {/* =================================================
                03 — SAP & ANALYTICS
            ================================================== */}

            <div
              className="
                story-point
                relative
                pt-3

                md:pt-4

                lg:pt-5
              "
            >
              <span
                className="
                  story-point-dot
                  absolute
                  left-0
                  top-0
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-[#EF3B3A]
                "
              />

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-[#EF3B3A]
                "
              >
                Intelligence
              </p>

              <h3
                className="
                  mt-2
                  text-lg
                  font-semibold
                  tracking-tight

                  sm:text-xl

                  md:text-2xl
                "
              >
                SAP & Analytics
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  leading-relaxed
                  text-black/45
                "
              >
                Connecting enterprise systems with intelligent
                insights.
              </p>
            </div>

            {/* =================================================
                04 — AI INNOVATION
            ================================================== */}

            <div
              className="
                story-point
                relative
                pt-3

                md:pt-4

                lg:pt-5
              "
            >
              <span
                className="
                  story-point-dot
                  absolute
                  left-0
                  top-0
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-[#EF3B3A]
                "
              />

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-[#EF3B3A]
                "
              >
                Next
              </p>

              <h3
                className="
                  mt-2
                  text-lg
                  font-semibold
                  tracking-tight

                  sm:text-xl

                  md:text-2xl
                "
              >
                AI Innovation
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  leading-relaxed
                  text-black/45
                "
              >
                Building the next generation of intelligent
                transformation.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutUs;