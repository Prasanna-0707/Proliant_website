import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import WebThreads from "@/components/ui/WebThreads";

const Hero = () => {
  const heroRef = useRef(null);
  const lineRefs = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const lines = lineRefs.current;

      gsap.set(lines, {
        opacity: 0,
        y: 45,
        filter: "blur(12px)",
      });

      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.to(lines[0], {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.1,
      })
        .to(
          lines[1],
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.1,
          },
          "-=0.55"
        )
        .to(
          lines[2],
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.1,
          },
          "-=0.55"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden bg-black text-white"
    >

      {/* =========================
          WEB THREADS BACKGROUND
      ========================== */}

      <div className="absolute inset-0 z-0">
        <WebThreads
          color1="#DA3838"
          color2="#FFFFFF"
          color3="#DA3838"
          speed={0.35}
          threadCount={4}
          frequency={4.5}
          spread={0.13}
          taper={1}
          position={0.5}
          fanMode="center"
          glow={0.024}
          falloff={0.6}
          thickness={1.55}
          brightness={0.6}
          opacity={1}
          mirror
          shimmer={false}
          grain
          grainIntensity={0.05}
          mouseInteraction
          mouseStrength={0.3}
        />
      </div>

      {/* =========================
          DARK OVERLAY
      ========================== */}

      <div className="absolute inset-0 z-1 bg-black/40 pointer-events-none" />

      {/* =========================
          HERO TEXT
      ========================== */}

      <div className="relative z-2 min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto w-full px-8">

          <div className="max-w-6xl">

            {/* Line 1 */}
            <h1
              ref={(el) => (lineRefs.current[0] = el)}
              className="text-[clamp(2rem,8vw,3rem)] md:text-5xl lg:text-6xl font-bold leading-[1.15]"
            >
              Your Trusted Partner in Accelerating
            </h1>

            {/* Line 2 */}
            <h1
              ref={(el) => (lineRefs.current[1] = el)}
              className="text-[clamp(2rem,8vw,3rem)] md:text-5xl lg:text-6xl font-bold leading-[1.15]"
            >
              Digital Transformation &
            </h1>

            {/* Line 3 */}
            <h1
              ref={(el) => (lineRefs.current[2] = el)}
              className="text-[clamp(2rem,8vw,3rem)] md:text-5xl lg:text-6xl font-bold leading-[1.15]"
            >
              Data-Driven Innovation
            </h1>

          </div>

        </div>
      </div>

    </section>
  );
};

export default Hero;