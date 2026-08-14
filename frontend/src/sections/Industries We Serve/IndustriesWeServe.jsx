const industries = [
  {
    id: 1,
    name: "Health & Services",
    image: "/images/industries/health.jpg",
    description:
      "Data-driven solutions that help healthcare and service organizations improve operations, governance, and digital transformation.",
  },
  {
    id: 2,
    name: "Food Processing",
    image: "/images/industries/food.jpg",
    description:
      "Technology and data solutions designed to help food processing organizations modernize operations and make better business decisions.",
  },
  {
    id: 3,
    name: "Aerospace Manufacturer",
    image: "/images/industries/aerospace.jpg",
    description:
      "Enterprise data and digital solutions that support complex aerospace manufacturing environments and business transformation.",
  },
];

const IndustriesWeServe = () => {
  return (
    <section className="bg-white text-black py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">

        {/* Section Header */}
        <div className="mb-20">

          <p className="text-blue-600 uppercase tracking-[5px] text-sm font-medium mb-6">
            Industries We Serve
          </p>

          <h2 className="max-w-5xl text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05]">
            Expertise Across Key Industries
          </h2>

        </div>

        {/* Industry Cards */}
        <div className="space-y-10">

          {industries.map((industry, index) => {
            const imageLeft = index % 2 === 0;

            return (
              <div
                key={industry.id}
                className="
                  group
                  grid
                  grid-cols-1
                  lg:grid-cols-2
                  min-h-130
                  overflow-hidden
                  border
                  border-black/10
                "
              >

                {/* IMAGE SIDE */}
                <div
                  className={`
                    relative
                    overflow-hidden
                    min-h-90
                    lg:min-h-130
                    bg-white
                    ${imageLeft ? "lg:order-1" : "lg:order-2"}
                  `}
                >

                  <img
                    src={industry.image}
                    alt={industry.name}
                    className="
                      absolute
                      inset-0
                      w-full
                      h-full
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-105
                    "
                  />

                </div>


                {/* BLACK CONTENT SIDE */}
                <div
                  className={`
                    flex
                    flex-col
                    justify-center
                    bg-black
                    text-white
                    px-10
                    md:px-14
                    lg:px-20
                    py-16
                    ${imageLeft ? "lg:order-2" : "lg:order-1"}
                  `}
                >

                  {/* Number */}
                  <span className="text-sm tracking-[4px] text-blue-500 mb-8">
                    0{industry.id}
                  </span>


                  {/* Title */}
                  <h3
                    className="
                      text-4xl
                      md:text-5xl
                      lg:text-6xl
                      font-semibold
                      leading-[1.05]
                      tracking-tight
                      mb-8
                      max-w-xl
                    "
                  >
                    {industry.name}
                  </h3>


                  {/* Description */}
                  <p
                    className="
                      text-gray-300
                      text-lg
                      leading-8
                      max-w-lg
                      mb-10
                    "
                  >
                    {industry.description}
                  </p>


                  {/* Read More */}
                  <a
                    href="/what-we-do"
                    className="
                      group/button
                      inline-flex
                      items-center
                      justify-between
                      w-48
                      border
                      border-white/60
                      px-6
                      py-4
                      text-sm
                      font-medium
                      uppercase
                      tracking-wider
                      text-white
                      transition-all
                      duration-300
                      hover:bg-white
                      hover:text-black
                    "
                  >

                    <span>
                      Read More
                    </span>

                    <span
                      className="
                        text-xl
                        transition-transform
                        duration-300
                        group-hover/button:translate-x-1
                      "
                    >
                      →
                    </span>

                  </a>

                </div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
};

export default IndustriesWeServe;