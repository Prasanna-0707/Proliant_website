import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  HeartPulse,
  ShieldCheck,
  Factory,
  ShoppingCart,
  Monitor,
  Dna,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const industries = [
  {
    number: "01",
    title: "Healthcare",
    description:
      "Turning complex data environments into connected, actionable intelligence.",
    icon: HeartPulse,
  },
  {
    number: "02",
    title: "Financial Services",
    description:
      "Helping financial organizations create trusted data and intelligent decision-making.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Manufacturing",
    description:
      "Connecting operational and enterprise data to improve visibility and performance.",
    icon: Factory,
  },
  {
    number: "04",
    title: "Retail & Consumer",
    description:
      "Creating connected data experiences across customers, operations and business functions.",
    icon: ShoppingCart,
  },
  {
    number: "05",
    title: "Technology",
    description:
      "Enabling technology organizations to scale their data and digital transformation.",
    icon: Monitor,
  },
  {
    number: "06",
    title: "Life Sciences",
    description:
      "Building data foundations that support innovation, insight and transformation.",
    icon: Dna,
  },
];

const Industries = () => {
  const sectionRef = useRef(null);
  const detailRef = useRef(null);
  const coreRef = useRef(null);

  const [activeIndustry, setActiveIndustry] = useState(0);

  /* =====================================================
     SECTION ANIMATIONS
  ====================================================== */

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: ".industries-section",
          start: "top 80%",
          once: true,
        },
      });

      intro
        .from(".industries-label", {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: "power3.out",
        })
        .from(
          ".industries-heading",
          {
            opacity: 0,
            y: 45,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.25"
        )
        .from(
          ".industry-visual",
          {
            opacity: 0,
            y: 30,
            scale: 0.97,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.3"
        )
        .from(
          ".industry-detail",
          {
            opacity: 0,
            x: 30,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.45"
        );

      /* ---------------------------------------------
         CORE ANIMATION
      ---------------------------------------------- */

      gsap.from(coreRef.current, {
        scrollTrigger: {
          trigger: ".industry-visual",
          start: "top 75%",
          once: true,
        },
        opacity: 0,
        scale: 0.6,
        duration: 0.9,
        ease: "back.out(1.6)",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* =====================================================
     ACTIVE INDUSTRY CHANGE
  ====================================================== */

  useLayoutEffect(() => {
    if (!detailRef.current) return;

    gsap.fromTo(
      detailRef.current,
      {
        opacity: 0,
        y: 18,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power3.out",
      }
    );

    if (coreRef.current) {
      gsap.fromTo(
        coreRef.current,
        {
          scale: 0.96,
        },
        {
          scale: 1,
          duration: 0.45,
          ease: "back.out(1.8)",
        }
      );
    }
  }, [activeIndustry]);

  const currentIndustry = industries[activeIndustry];

  return (
    <section
      ref={sectionRef}
      id="industries"
      className="
        industries-section
        relative
        overflow-hidden
        bg-black
        px-6
        py-16
        text-white
        md:px-12
        md:py-20
        lg:px-16
        lg:py-24
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADING
        ================================================== */}

        <div>
          <p
            className="
              industries-label
              text-xs
              font-medium
              uppercase
              tracking-widest
              text-red-500
            "
          >
            Industries
          </p>

          <h2
            className="
              industries-heading
              mt-4
              text-4xl
              font-semibold
              leading-tight
              tracking-tight
              sm:text-5xl
              md:text-6xl
            "
          >
            Technology with{" "}
            <span className="text-white/25">
              industry context.
            </span>
          </h2>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================== */}

        <div
          className="
            mt-10
            grid
            gap-10
            lg:grid-cols-2
            lg:gap-14
          "
        >

          {/* =================================================
              LEFT NETWORK
          ================================================== */}

          <div
            className="
              industry-visual
              relative
              aspect-4/3
              overflow-hidden
              border
              border-white/10
              bg-white/2
            "
          >

            {/* ---------------------------------------------
                RED GLOW
            ---------------------------------------------- */}

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-64
                w-64
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-red-500/10
                blur-3xl
              "
            />

            {/* ---------------------------------------------
                CONNECTION LINES
            ---------------------------------------------- */}

            <svg
              className="
                pointer-events-none
                absolute
                inset-0
                h-full
                w-full
              "
              viewBox="0 0 600 450"
              preserveAspectRatio="none"
            >

              {/* 01 — Healthcare */}

              <line
                x1="300"
                y1="225"
                x2="300"
                y2="75"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
              />

              {/* 02 — Financial Services */}

              <line
                x1="300"
                y1="225"
                x2="470"
                y2="145"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
              />

              {/* 03 — Manufacturing */}

              <line
                x1="300"
                y1="225"
                x2="470"
                y2="305"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
              />

              {/* 04 — Retail & Consumer */}

              <line
                x1="300"
                y1="225"
                x2="300"
                y2="375"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
              />

              {/* 05 — Technology */}

              <line
                x1="300"
                y1="225"
                x2="130"
                y2="305"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
              />

              {/* 06 — Life Sciences */}

              <line
                x1="300"
                y1="225"
                x2="130"
                y2="145"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
              />

            </svg>

            {/* =================================================
                INDUSTRY NODES
            ================================================== */}

            {/* 01 — Healthcare */}

            <IndustryNode
              industry={industries[0]}
              active={activeIndustry === 0}
              position={{
                left: "50%",
                top: "16.67%",
              }}
              onClick={() => setActiveIndustry(0)}
            />

            {/* 02 — Financial Services */}

            <IndustryNode
              industry={industries[1]}
              active={activeIndustry === 1}
              position={{
                left: "78.33%",
                top: "32.22%",
              }}
              onClick={() => setActiveIndustry(1)}
            />

            {/* 03 — Manufacturing */}

            <IndustryNode
              industry={industries[2]}
              active={activeIndustry === 2}
              position={{
                left: "78.33%",
                top: "67.78%",
              }}
              onClick={() => setActiveIndustry(2)}
            />

            {/* 04 — Retail & Consumer */}

            <IndustryNode
              industry={industries[3]}
              active={activeIndustry === 3}
              position={{
                left: "50%",
                top: "83.33%",
              }}
              onClick={() => setActiveIndustry(3)}
            />

            {/* 05 — Technology */}

            <IndustryNode
              industry={industries[4]}
              active={activeIndustry === 4}
              position={{
                left: "21.67%",
                top: "67.78%",
              }}
              onClick={() => setActiveIndustry(4)}
            />

            {/* 06 — Life Sciences */}

            <IndustryNode
              industry={industries[5]}
              active={activeIndustry === 5}
              position={{
                left: "21.67%",
                top: "32.22%",
              }}
              onClick={() => setActiveIndustry(5)}
            />

            {/* =================================================
                PROLIANT INTELLIGENCE
            ================================================== */}

            <div
              ref={coreRef}
              className="
                intelligence-core
                absolute
                left-1/2
                top-1/2
                z-20
                flex
                h-32
                w-32
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-red-500
                bg-black
                shadow-lg
              "
            >

              <div className="text-center">

                <div
                  className="
                    text-xs
                    font-medium
                    tracking-widest
                    text-red-500
                  "
                >
                  PROLIANT
                </div>

                <div
                  className="
                    mt-1
                    text-xs
                    uppercase
                    tracking-widest
                    text-white/45
                  "
                >
                  Intelligence
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              RIGHT CONTENT
          ================================================== */}

          <div
            ref={detailRef}
            className="
              industry-detail
              flex
              flex-col
              justify-center
              lg:px-4
            "
          >

            <span
              className="
                text-xs
                font-medium
                tracking-widest
                text-red-500
              "
            >
              {currentIndustry.number}
            </span>

            <h3
              className="
                mt-4
                text-4xl
                font-semibold
                leading-tight
                tracking-tight
                sm:text-5xl
                md:text-6xl
              "
            >
              {currentIndustry.title}
            </h3>

            <p
              className="
                mt-5
                max-w-xl
                text-base
                leading-relaxed
                text-white/45
                md:text-lg
              "
            >
              {currentIndustry.description}
            </p>

            <div className="mt-8 h-px w-full bg-white/10" />

            <div
              className="
                mt-5
                flex
                items-center
                justify-between
              "
            >

              <span
                className="
                  text-xs
                  uppercase
                  tracking-widest
                  text-white/25
                "
              >
                Industry Focus
              </span>

              <span
                className="
                  text-lg
                  text-red-500
                  transition-transform
                  duration-300
                  hover:translate-x-2
                "
              >
                →
              </span>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

/* =========================================================
   INDUSTRY NODE
========================================================= */

const IndustryNode = ({
  industry,
  active,
  position,
  onClick,
}) => {
  const Icon = industry.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Select ${industry.title}`}
      style={{
        position: "absolute",
        left: position.left,
        top: position.top,
        transform: "translate(-50%, -50%)",
      }}
      className={`
        industry-node
        z-30
        flex
        h-24
        w-24
        flex-col
        items-center
        justify-center
        rounded-full
        border
        text-center
        transition-all
        duration-300
        sm:h-28
        sm:w-28
        ${
          active
            ? "scale-105 border-red-500 bg-black shadow-lg"
            : "border-white/20 bg-black hover:scale-105 hover:border-white/40"
        }
      `}
    >

      <span
        className={`
          text-xs
          font-medium
          tracking-widest
          ${
            active
              ? "text-red-500"
              : "text-white/40"
          }
        `}
      >
        {industry.number}
      </span>

      <span
        className="
          mt-1
          max-w-20
          text-xs
          font-medium
          leading-tight
          text-white
        "
      >
        {industry.title}
      </span>

      <Icon
        className={`
          mt-2
          h-4
          w-4
          ${
            active
              ? "text-white"
              : "text-white/45"
          }
        `}
        strokeWidth={1.5}
      />

    </button>
  );
};

export default Industries;