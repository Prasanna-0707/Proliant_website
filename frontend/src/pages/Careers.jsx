import CareersHero from "../sections/CareersSection/CareersHero/CareersHero";
import LifeAtProliant from "../sections/CareersSection/LifeAtProliant/LifeAtProliant";
import CareersContact from "../sections/CareersSection/ContactUs/ContactUs";
import Footer from "../components/common/Footer";

const Careers = () => {
  return (
    <main className="bg-white text-black">
      <CareersHero />

      <LifeAtProliant />

      <CareersContact />
      
      <Footer theme="light" />
    </main>
  );
};

export default Careers;