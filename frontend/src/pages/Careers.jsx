import CareersHero from "../sections/CareersSection/CareersHero/CareersHero";
import LifeAtProliant from "../sections/CareersSection/LifeAtProliant/LifeAtProliant";
import Jobs from "../sections/CareersSection/Jobs/jobs";
import Footer from "../components/common/Footer";

const Careers = () => {
  return (
    <main className="bg-white text-black">
      <CareersHero />

      <LifeAtProliant />

      <Jobs />
      
      <Footer theme="light" />
    </main>
  );
};

export default Careers;