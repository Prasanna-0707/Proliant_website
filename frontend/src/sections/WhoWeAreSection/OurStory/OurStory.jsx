import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const OurStory = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* =====================================================
         SECTION INTRO
      ===================================================== */

      gsap.from(".story-heading", {
        scrollTrigger: {
          trigger: ".story-section",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 60,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".story-copy", {
        scrollTrigger: {
          trigger: ".story-section",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.15,
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
        duration: 1.4,
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
        y: 35,
        stagger: 0.18,
        duration: 0.8,
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
        stagger: 0.18,
        duration: 0.5,
        ease: "back.out(1.7)",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        story-section
        bg-white
        px-8
        py-16
        text-black
        md:px-16
        md:py-20
        lg:px-24
        lg:py-24
      "
    >
      <div className="mx-auto max-w-1500px">

        {/* =====================================================
            ABOUT US CONTENT
        ====================================================== */}

        <div
          className="
            grid
            gap-10
            lg:grid-cols-[0.7fr_1.3fr]
            lg:items-start
            lg:gap-20
          "
        >

          {/* LEFT — HEADING */}

          <div>
            <p
              className="
                text-sm
                uppercase
                tracking-[0.3em]
                text-[#EF3B3A]
              "
            >
              About Us
            </p>

            <h2
              className="
                story-heading
                mt-4
                text-5xl
                font-semibold
                leading-[0.9]
                tracking-tight
                md:text-6xl
                lg:text-7xl
              "
            >
              From data
              <br />
              to
              <br />
              <span className="text-black/30">
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
                text-lg
                leading-[1.7]
                text-black/80
                md:text-xl
                lg:text-2xl
              "
            >
              Founded in 2021, Proliant Data LLC has rapidly
              grown from a niche in data migration and governance
              into a trusted partner delivering end-to-end
              Enterprise Data Management, SAP solutions,
              advanced analytics, and AI innovation.
            </p>

            <p
              className="
                mt-5
                text-base
                leading-[1.7]
                text-black/50
                md:text-lg
              "
            >
              Our journey is driven by a technology-agnostic,
              innovation-first approach, creating scalable,
              business-aligned solutions designed to deliver
              real impact.
            </p>

            <p
              className="
                mt-5
                text-base
                leading-[1.7]
                text-black/50
                md:text-lg
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
            mt-16
            border-t
            border-black/10
            pt-10
            md:mt-20
            md:pt-12
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
              gap-10
              md:grid-cols-4
              md:gap-6
            "
          >

            {/* =================================================
                01 — DATA MIGRATION
            ================================================== */}

            <div
              className="
                story-point
                relative
                pt-4
                md:pt-5
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
                  text-xl
                  font-semibold
                  tracking-tight
                  md:text-2xl
                "
              >
                Data Migration
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-black/45">
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
                pt-4
                md:pt-5
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
                  text-xl
                  font-semibold
                  tracking-tight
                  md:text-2xl
                "
              >
                Enterprise Data
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-black/45">
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
                pt-4
                md:pt-5
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
                  text-xl
                  font-semibold
                  tracking-tight
                  md:text-2xl
                "
              >
                SAP & Analytics
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-black/45">
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
                pt-4
                md:pt-5
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
                  text-xl
                  font-semibold
                  tracking-tight
                  md:text-2xl
                "
              >
                AI Innovation
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-black/45">
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

export default OurStory;