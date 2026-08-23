import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import FoodProcessing from "@/assets/images/Home/Food_Processing.jpg";
import AeroSpace from "@/assets/images/Home/Aero_Space.jpg";
import HS from "@/assets/images/Home/HS.jpg";

gsap.registerPlugin(ScrollTrigger);

const industries = [
  {
    id: 1,
    name: "Health & Services",
    image: HS,
    description:
      "Data-driven solutions that help healthcare and service organizations improve operations, governance, and digital transformation.",
  },
  {
    id: 2,
    name: "Food Processing",
    image: FoodProcessing,
    description:
      "Technology and data solutions designed to help food processing organizations modernize operations and make better business decisions.",
  },
  {
    id: 3,
    name: "Aerospace Manufacturer",
    image: AeroSpace,
    description:
      "Enterprise data and digital solutions that support complex aerospace manufacturing environments and business transformation.",
  },
];

const IndustriesWeServe = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* =====================================================
         HEADER ANIMATIONS
      ===================================================== */

      gsap.from(".industries-label", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power3.out",
        immediateRender: false,
      });

      gsap.from(".industries-heading", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 40,
        filter: "blur(8px)",
        duration: 0.9,
        ease: "power4.out",
        immediateRender: false,
      });

      /* =====================================================
         CARD ANIMATIONS
      ===================================================== */

      gsap.utils.toArray(".industry-card").forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          y: 45,
          duration: 0.8,
          delay: index * 0.08,
          ease: "power3.out",
          immediateRender: false,
        });
      });

      /* =====================================================
         IMAGE LOAD FIX
         Prevents ScrollTrigger from calculating positions
         before images have finished loading.
      ===================================================== */

      const images = sectionRef.current.querySelectorAll("img");

      const refreshScrollTrigger = () => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      };

      images.forEach((image) => {
        if (image.complete) {
          return;
        }

        image.addEventListener("load", refreshScrollTrigger);
      });

      /* Initial layout calculation */
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      /* Extra safety after browser layout settles */
      const refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);

      return () => {
        clearTimeout(refreshTimer);

        images.forEach((image) => {
          image.removeEventListener("load", refreshScrollTrigger);
        });
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        overflow-hidden
        bg-white
        py-20
        text-black
        md:py-24
      "
    >
      <div className="mx-auto max-w-7xl px-8">

        {/* =================================================
            SECTION HEADER
        ================================================== */}

        <div className="mb-12 md:mb-14">

          <p
            className="
              industries-label
              mb-4
              text-xs
              font-medium
              uppercase
              tracking-widest
              text-[#EF3B3A]
            "
          >
            Industries We Serve
          </p>

          <h2
            className="
              industries-heading
              max-w-5xl
              text-4xl
              font-semibold
              leading-tight
              tracking-tight
              md:text-5xl
              lg:text-6xl
            "
          >
            Expertise Across Key Industries
          </h2>

        </div>


        {/* =================================================
            INDUSTRY CARDS
        ================================================== */}

        <div className="industries-grid space-y-6 md:space-y-7">

          {industries.map((industry, index) => {

            const imageLeft = index % 2 === 0;

            return (
              <article
                key={industry.id}
                className="
                  industry-card
                  group
                  relative
                  grid
                  overflow-hidden
                  rounded-3xl
                  border
                  border-black/10
                  bg-black
                  shadow-lg
                  transition-all
                  duration-500
                  ease-out
                  hover:-translate-y-2
                  hover:border-[#EF3B3A]/50
                  hover:shadow-2xl
                  lg:grid-cols-2
                "
              >

                {/* =================================================
                    IMAGE SIDE
                ================================================== */}

                <div
                  className={`
                    relative
                    min-h-72
                    overflow-hidden
                    bg-black
                    md:min-h-80
                    lg:min-h-96
                    ${imageLeft ? "lg:order-1" : "lg:order-2"}
                  `}
                >

                  <img
                    src={industry.image}
                    alt={industry.name}
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-1000
                      ease-out
                      group-hover:scale-105
                    "
                  />

                  {/* Dark Overlay */}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-black/10
                      transition-opacity
                      duration-500
                      group-hover:bg-black/20
                    "
                  />

                  {/* Red Corner Tint */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-linear-to-tr
                      from-[#EF3B3A]/35
                      via-transparent
                      to-transparent
                      opacity-60
                      transition-opacity
                      duration-700
                      group-hover:opacity-100
                    "
                  />

                  {/* Image Shine */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-linear-to-r
                      from-transparent
                      via-white/10
                      to-transparent
                      opacity-0
                      transition-opacity
                      duration-700
                      group-hover:opacity-100
                    "
                  />

                </div>


                {/* =================================================
                    BLACK CONTENT SIDE
                ================================================== */}

                <div
                  className={`
                    relative
                    flex
                    flex-col
                    justify-center
                    overflow-hidden
                    bg-black
                    px-8
                    py-10
                    text-white
                    md:px-10
                    md:py-12
                    lg:px-14
                    lg:py-12
                    ${imageLeft ? "lg:order-2" : "lg:order-1"}
                  `}
                >

                  {/* Red Ambient Glow */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      -bottom-20
                      -right-20
                      h-56
                      w-56
                      rounded-full
                      bg-[#EF3B3A]/10
                      blur-3xl
                      opacity-0
                      transition-opacity
                      duration-700
                      group-hover:opacity-100
                    "
                  />

                  {/* Number */}

                  <span
                    className="
                      relative
                      z-10
                      mb-5
                      text-xs
                      tracking-widest
                      text-[#EF3B3A]
                    "
                  >
                    0{industry.id}
                  </span>


                  {/* Title */}

                  <h3
                    className="
                      relative
                      z-10
                      mb-5
                      max-w-xl
                      text-3xl
                      font-semibold
                      leading-tight
                      tracking-tight
                      transition-transform
                      duration-500
                      group-hover:translate-x-1
                      md:text-4xl
                      lg:text-5xl
                    "
                  >
                    {industry.name}
                  </h3>


                  {/* Red Accent */}

                  <div
                    className="
                      relative
                      z-10
                      mb-5
                      h-px
                      w-10
                      bg-[#EF3B3A]
                      transition-all
                      duration-500
                      group-hover:w-20
                    "
                  />


                  {/* Description */}

                  <p
                    className="
                      relative
                      z-10
                      mb-7
                      max-w-lg
                      text-base
                      leading-relaxed
                      text-white/60
                      md:text-lg
                    "
                  >
                    {industry.description}
                  </p>


                  {/* Read More */}

                  <a
                    href="/what-we-do"
                    className="
                      group/button
                      relative
                      z-10
                      inline-flex
                      w-48
                      items-center
                      justify-between
                      border
                      border-white/50
                      px-5
                      py-3
                      text-xs
                      font-medium
                      uppercase
                      tracking-widest
                      text-white
                      transition-all
                      duration-300
                      hover:border-[#EF3B3A]
                      hover:bg-[#EF3B3A]
                      hover:text-white
                    "
                  >

                    <span>
                      Read More
                    </span>

                    <span
                      className="
                        text-lg
                        transition-transform
                        duration-300
                        group-hover/button:translate-x-1
                      "
                    >
                      →
                    </span>

                  </a>

                </div>


                {/* =================================================
                    CARD HIGHLIGHT
                ================================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-3xl
                    ring-1
                    ring-inset
                    ring-transparent
                    transition-all
                    duration-500
                    group-hover:ring-[#EF3B3A]/40
                  "
                />

              </article>
            );
          })}

        </div>

      </div>
    </section>
  );
};

export default IndustriesWeServe;