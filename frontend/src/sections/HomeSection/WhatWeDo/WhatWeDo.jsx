const WhatWeDo = () => {
  return (
    <section className="bg-white py-16 text-black md:py-20">
      <div className="mx-auto max-w-7xl px-8">
        {/* Section Label */}
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-[4px] text-blue-600 md:text-sm">
            What We Do
          </p>
        </div>

        {/* Heading */}
        <h2 className="mb-8 text-[clamp(1.875rem,7vw,2.625rem)] font-bold leading-[1.05]">
          What We Do
        </h2>

        {/* Divider */}
        <div className="mb-8 border-t border-black/10" />

        {/* Description */}
        <div className="max-w-4xl">
          <p className="text-base leading-7 text-neutral-600 md:text-lg">
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
            className="group inline-flex w-55 items-center justify-between border border-black/30 px-5 py-3 text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:bg-black hover:text-white"
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