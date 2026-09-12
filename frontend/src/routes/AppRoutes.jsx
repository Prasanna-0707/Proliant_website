import { Routes, Route } from "react-router-dom";

import Home from "@/pages/Home";
import WhoWeAre from "@/pages/WhoWeAre";
import WhatWeDoPage from "@/pages/WhatWeDo";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/who-we-are" element={<WhoWeAre />} />
      <Route path="/what-we-do" element={<WhatWeDoPage />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
};

export default AppRoutes;