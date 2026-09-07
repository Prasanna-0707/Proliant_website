import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import WebThreads from "@/components/ui/WebThreads";

const Hero = () => {
  const heroRef = useRef(null);
  const lineRefs = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const lines = lineRefs.current;
      const isMobile = window.innerWidth < 768;

      gsap.set(lines, {
        opacity: 0,
        y: isMobile ? 25 : 45,
        filter: isMobile ? "blur(8px)" : "blur(12px)",
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
        duration: isMobile ? 0.8 : 1.1,
      })
        .to(
          lines[1],
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: isMobile ? 0.8 : 1.1,
          },
          isMobile ? "-=0.4" : "-=0.55"
        )
        .to(
          lines[2],
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: isMobile ? 0.8 : 1.1,
          },
          isMobile ? "-=0.4" : "-=0.55"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative h-75 overflow-hidden bg-black text-white sm:h-72 md:min-h-screen"
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
      <div className="pointer-events-none absolute inset-0 z-1 bg-black/40" />

      {/* =========================
          HERO TEXT
      ========================== */}
      <div className="relative z-2 flex h-full items-center pt-8 sm:pt-10 md:min-h-screen md:pt-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8">

          <div className="max-w-6xl">

            {/* Line 1 */}
            <h1
              ref={(el) => (lineRefs.current[0] = el)}
              className="text-xl font-bold leading-[1.15] sm:text-2xl md:text-5xl lg:text-6xl"
            >
              Your Trusted Partner in Accelerating
            </h1>

            {/* Line 2 */}
            <h1
              ref={(el) => (lineRefs.current[1] = el)}
              className="text-xl font-bold leading-[1.15] sm:text-2xl md:text-5xl lg:text-6xl"
            >
              Digital Transformation &
            </h1>

            {/* Line 3 */}
            <h1
              ref={(el) => (lineRefs.current[2] = el)}
              className="text-xl font-bold leading-[1.15] sm:text-2xl md:text-5xl lg:text-6xl"
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