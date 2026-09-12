import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Hero from "../sections/WhoWeAreSection/WhoWeAreHero/WhoWeAreHero";
import AboutUs from "../sections/WhoWeAreSection/AboutUS/AboutUs";
import CorePrinciples from "../sections/WhoWeAreSection/CorePrinciples/CorePrinciples";
import Leadership from "../sections/WhoWeAreSection/Leadership/Leadership";

import GlobalPresence from "../sections/WhoWeAreSection/GlobalPresence/GlobalPresence";
import Footer from "../components/common/Footer";

gsap.registerPlugin(ScrollTrigger);

const WhoWeAre = () => {
  const pageRef = useRef(null);
  return (
    <main
      ref={pageRef}
      className="overflow-hidden bg-black text-white"
    >
      <Hero />

      <AboutUs />

      <CorePrinciples />

      <Leadership />
      <GlobalPresence />
      <Footer />
    </main>
  );
};

export default WhoWeAre;