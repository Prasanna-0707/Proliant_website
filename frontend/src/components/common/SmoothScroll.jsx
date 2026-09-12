import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SmoothScroll = () => {
  const location = useLocation();
  const lenisRef = useRef(null);

  /* =====================================================
     LENIS INITIALIZATION
  ===================================================== */

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.7,
      smoothWheel: true,
      smoothTouch: false,
      syncTouch: false,
      autoRaf: false,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;

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
      lenisRef.current = null;
    };
  }, []);

  /* =====================================================
     ROUTE CHANGE
  ===================================================== */

  useEffect(() => {
    const lenis = lenisRef.current;

    if (!lenis) return;

    /*
     * Immediately stop any previous smooth-scroll
     * animation.
     */
    lenis.stop();

    /*
     * Reset Lenis internal scroll position.
     */
    lenis.scrollTo(0, {
      immediate: true,
      force: true,
    });

    /*
     * Reset browser scroll position as well.
     */
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    /*
     * Wait until the new route/page has rendered.
     */
    let attempts = 0;
    let animationFrame;

    const handleNavigation = () => {
      attempts += 1;

      /*
       * No hash
       * ------------------------------
       * Open the new page at Hero.
       */

      if (!location.hash) {
        lenis.scrollTo(0, {
          immediate: true,
          force: true,
        });

        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "auto",
        });

        lenis.start();

        ScrollTrigger.refresh();

        return;
      }

      /*
       * Hash exists
       * ------------------------------
       * Find requested section.
       */

      const sectionId = decodeURIComponent(
        location.hash.substring(1)
      );

      const section = document.getElementById(sectionId);

      if (section) {
        /*
         * Get exact section position.
         */
        const sectionTop =
          section.getBoundingClientRect().top +
          window.scrollY;

        /*
         * Move Lenis to requested section.
         */
        lenis.scrollTo(sectionTop, {
          immediate: true,
          force: true,
        });

        window.scrollTo({
          top: sectionTop,
          left: 0,
          behavior: "auto",
        });

        /*
         * Start smooth scrolling again after
         * destination is reached.
         */
        requestAnimationFrame(() => {
          lenis.start();
          ScrollTrigger.refresh();
        });

        return;
      }

      /*
       * Section is not rendered yet.
       * Keep checking.
       */

      if (attempts < 120) {
        animationFrame =
          requestAnimationFrame(handleNavigation);
      } else {
        lenis.start();
      }
    };

    /*
     * Give React Router one frame to render
     * the destination page.
     */
    animationFrame =
      requestAnimationFrame(handleNavigation);

    return () => {
      cancelAnimationFrame(animationFrame);

      /*
       * Make sure Lenis doesn't remain stopped
       * if the route changes again quickly.
       */
      if (lenisRef.current) {
        lenisRef.current.start();
      }
    };
  }, [location.pathname, location.hash]);

  return null;
};

export default SmoothScroll;