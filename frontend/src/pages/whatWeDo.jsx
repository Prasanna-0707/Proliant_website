import WhatWeDoHero from "../sections/WhatWeDoSection/Hero/WhatWeDoHero";
import Capabilities from "../sections/WhatWeDoSection/Capabilities/Capabilities";
import Industries from "../sections/WhatWeDoSection/Industries/Industries";
import Technologies  from "../sections/WhatWeDoSection/Technologies/Technologies";
import Footer from "../components/common/Footer";

const WhatWeDoPage = () => {
  return (
    <main className="overflow-hidden bg-black text-white">
      <WhatWeDoHero />

      <Capabilities />

      <Industries />

      <Technologies />

      <Footer />
    </main>
  );
};

export default WhatWeDoPage;