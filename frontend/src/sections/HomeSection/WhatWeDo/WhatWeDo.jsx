const WhatWeDo = () => {
  return (
    <section className="bg-white text-black py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-8">

        {/* Section Label */}
        <div className="mb-4">
          <p className="text-blue-600 uppercase tracking-[4px] text-xs md:text-sm font-medium">
            What We Do
          </p>
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold leading-[1.05] mb-8">
          What We Do
        </h2>

        {/* Divider */}
        <div className="border-t border-black/10 mb-8" />

        {/* Description */}
        <div className="max-w-4xl">
          <p className="text-base md:text-lg leading-7 text-neutral-600">
            Proliant Data accelerates data and digital transformation by
            delivering innovative, tailored solutions in enterprise data
            management, migration, governance, and analytics to unlock the
            full potential of your data.
          </p>
        </div>

        {/* Read More */}
        <div className="mt-8">
          <a
            href="/what-we-do"
            className="group inline-flex items-center justify-between w-55px border border-black/30 px-5 py-3 text-xs font-medium tracking-wider uppercase transition-all duration-300 hover:bg-black hover:text-white"
          >
            <span>Read More</span>

            <span className="text-lg font-light transition-transform duration-300 group-hover:translate-x-2">
              →
            </span>
          </a>
        </div>

      </div>
    </section>
  );
};

export default WhatWeDo;