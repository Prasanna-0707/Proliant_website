import Hero from "@/sections/HomeSection/Hero/Hero";
import WhoWeAre from "@/sections/HomeSection/WhoWeAre/WhoWeAre";
import WhatWeDo from "@/sections/HomeSection/WhatWeDo/WhatWeDo";

import FeaturedTechnologies from "@/sections/HomeSection/Featured Technologies/Featured Technologies";
import IndustriesWeServe from "@/sections/HomeSection/Industries We Serve/IndustriesWeServe";
import Footer from "../components/common/Footer";

import ProliantInNumbers from "@/sections/HomeSection/ProliantInNumbers/ProliantInNumbers";

const Home = () => {
  return (
    <>
        <Hero />

        <ProliantInNumbers />

        <WhoWeAre />

        <WhatWeDo />

        <FeaturedTechnologies />

        <IndustriesWeServe />
        
        <Footer />
    </>
  );
};

export default Home;