import { useState } from "react";
import BlurText from "@/components/BlurText";

const Hero = () => {
  const [line1Complete, setLine1Complete] = useState(false);
  const [line2Complete, setLine2Complete] = useState(false);

  return (
    <section className="min-h-[70vh] sm:min-h-screen bg-black flex items-center pt-16">
      <div className="max-w-7xl mx-auto w-full px-8">

        <div className="max-w-6xl">

          {/* Line 1 */}
          <BlurText
            text="Your Trusted Partner in Accelerating"
            delay={100}
            animateBy="words"
            direction="top"
            threshold={0}
            rootMargin="100px"
            stepDuration={0.35}
            startAnimation={true}
            onAnimationComplete={() => setLine1Complete(true)}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15]"
          />

          {/* Line 2 */}
          <BlurText
            text="Digital Transformation &"
            delay={100}
            animateBy="words"
            direction="top"
            threshold={0}
            rootMargin="100px"
            stepDuration={0.35}
            startAnimation={line1Complete}
            onAnimationComplete={() => setLine2Complete(true)}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15]"
          />

          {/* Line 3 */}
          <BlurText
            text="Data-Driven Innovation"
            delay={100}
            animateBy="words"
            direction="top"
            threshold={0}
            rootMargin="100px"
            stepDuration={0.35}
            startAnimation={line2Complete}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15] mb-8"
          />

        </div>

      </div>
    </section>
  );
};

export default Hero;