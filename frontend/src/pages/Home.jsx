import Hero from "@/sections/Hero/Hero";
import About from "@/sections/About/About";
import WhatWeDo from "@/sections/WhatWeDo/WhatWeDo";

import FeaturedTechnologies from "@/sections/Featured Technologies/Featured Technologies";
import IndustriesWeServe from "@/sections/Industries We Serve/IndustriesWeServe";
import Footer from "@/sections/Footer/Footer";

import ProliantInNumbers from "@/sections/ProliantInNumbers/ProliantInNumbers";

const Home = () => {
  return (
    <>
        <Hero />
        <ProliantInNumbers />
        <About />
        <WhatWeDo />
        <FeaturedTechnologies />
        <IndustriesWeServe />
        <Footer />
    </>
  );
};

export default Home;