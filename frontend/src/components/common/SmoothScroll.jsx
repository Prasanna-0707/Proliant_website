import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({
        duration: 0.7,
        smoothWheel: true,
        smoothTouch: false,
        syncTouch: false,
        autoRaf: false,
        wheelMultiplier: 1,
      });

    const handleScroll = () => {
      ScrollTrigger.update();
    };

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", handleScroll);

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    const refreshScrollTrigger = () => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    };

    refreshScrollTrigger();
    window.addEventListener("load", refreshScrollTrigger);

    return () => {
      window.removeEventListener("load", refreshScrollTrigger);

      lenis.off("scroll", handleScroll);
      gsap.ticker.remove(updateLenis);

      lenis.destroy();
    };
  }, []);

  return null;
};

export default SmoothScroll;