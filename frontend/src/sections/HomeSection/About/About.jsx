import whoWeAreImage from "@/assets/images/who_we_are.png";

const About = () => {
  return (
    <section className="bg-black text-white py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-8">

        {/* Section Label */}
        <p className="text-blue-500 uppercase tracking-[4px] text-xs md:text-sm font-medium mb-5">
          Who We Are
        </p>

        {/* Heading */}
        <h2 className="max-w-3xl text-3xl md:text-4xl lg:text-[42px] font-bold leading-[1.1] mb-11">
          Empowering Businesses Through
          <br />
          Data & AI Innovation
        </h2>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1fr] gap-10 lg:gap-14 items-center">

          {/* IMAGE */}
          <div className="relative">

            {/* Subtle glow */}
            <div className="absolute -inset-2 rounded-[20px] bg-blue-500/10 blur-xl" />

            <div className="relative h-320px md:h-380px rounded-[20px] overflow-hidden border border-white/10 bg-neutral-950">

              <img
                src={whoWeAreImage}
                alt="Proliant Data AI and enterprise solutions"
                className="w-full h-full object-cover"
              />

            </div>

          </div>

          {/* CONTENT */}
          <div className="max-w-lg">

            <p className="text-sm md:text-base leading-7 text-gray-300 mb-8">
              Founded in 2021, Proliant Data LLC has rapidly grown from a niche
              in data migration and governance into a trusted partner
              delivering end-to-end Enterprise Data Management, SAP solutions,
              advanced analytics, and AI innovation.
            </p>

            {/* Read More */}
            <a
              href="/who-we-are"
              className="group inline-flex items-center justify-between w-220px border border-white/40 px-5 py-3 text-xs font-medium tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-black"
            >
              <span>Read More</span>

              <span className="text-lg font-light transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>
            </a>

          </div>

        </div>

      </div>
    </section>
  );
};

export default About;