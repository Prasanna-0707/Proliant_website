import { technologies } from "./data";

const FeaturedTechnologies = () => {
  return (
    <section className="bg-black text-white py-24 md:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">

        {/* Heading */}
        <div className="mb-14">

          <p className="text-blue-500 uppercase tracking-[5px] text-sm font-medium mb-5">
            Technologies
          </p>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Featured Technologies
          </h2>

        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {technologies.map((tech) => (
            <div
              key={tech.id}
              className="
                group
                relative
                h-85
                rounded-[24px]
                overflow-hidden
                bg-zinc-900
                border border-white/10
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-white/30
              "
            >

              {/* Image Area */}
              <div className="absolute inset-0 bg-zinc-800">

                {tech.image ? (
                  <img
                    src={tech.image}
                    alt={tech.name}
                    className="
                      w-full
                      h-full
                      object-cover
                      transition-transform
                      duration-700
                      group-hover:scale-105
                    "
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-zinc-600 text-sm">
                      Image Placeholder
                    </span>
                  </div>
                )}

              </div>

              {/* Gradient */}
              <div
                className="
                  absolute
                  inset-0
                  bg-linear-to-t
                  from-black
                  via-black/50
                  to-transparent
                "
              />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">

                <div className="flex items-end justify-between gap-4">

                  <h3 className="max-w-[80%] text-xl md:text-2xl font-bold leading-tight">
                    {tech.name}
                  </h3>

                  {/* Plus */}
                  <div
                    className="
                      shrink-0
                      w-10
                      h-10
                      rounded-full
                      border
                      border-white/70
                      flex
                      items-center
                      justify-center
                      text-2xl
                      font-light
                      transition-all
                      duration-300
                      group-hover:bg-white
                      group-hover:text-black
                    "
                  >
                    +
                  </div>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default FeaturedTechnologies;