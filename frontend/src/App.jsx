import Navbar from "@/components/layout/Navbar";

import Hero from "@/sections/Hero/Hero";
import About from "@/sections/About/About";
import WhatWeDo from "@/sections/WhatWeDo";
import WhyChooseProliant from "@/sections/WhyChooseProliant";
import OurProcess from "@/sections/Our Process";
import FeaturedTechnologies from "@/sections/Featured Technologies";
import IndustriesWeServe from "@/sections/Industries We Serve";
import ContactCTA from "@/sections/ContactCTA";

function App() {
  return (
    <>
      <Navbar />

      <Hero />

      <About />

      <WhatWeDo />

      <WhyChooseProliant />

      <OurProcess />
      
      <FeaturedTechnologies />

      <IndustriesWeServe />
      
      <ContactCTA />
    </>
  );
}

export default App;