import StatsCounter from "@/components/ui/stats-counter";
import peopleIcon from "@/assets/images/icons8-people.gif";
import globeIcon from "@/assets/images/globe-icon-final.png";
import mapsIcon from "@/assets/images/maps-icon.png";

const ProliantInNumbers = () => {
  return (
    <section className="bg-white py-8 text-black sm:py-10 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">

        {/* Section Heading */}
        <div className="mb-8 sm:mb-10 md:mb-14 lg:mb-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            Proliant in Numbers
          </h2>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-10 md:grid-cols-3 md:gap-8 lg:gap-10">

          {/* Employees */}
          <div className="flex flex-col items-center text-center">

            <div className="mb-3 flex items-center justify-center gap-2 sm:mb-4 sm:gap-3 md:mb-6 md:gap-4 lg:mb-8">

              <img
                src={peopleIcon}
                alt="Employees"
                className="h-8 w-8 object-contain sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16"
              />

              <StatsCounter
                value={150}
                suffix="+"
                duration={2}
                className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
              />

            </div>

            <div className="w-full max-w-xs border-t border-black pt-2 sm:pt-3 md:pt-5 lg:pt-6">
              <p className="text-xs font-medium sm:text-sm md:text-xl lg:text-2xl">
                Employees
              </p>
            </div>

          </div>

          {/* Global Deployments */}
          <div className="flex flex-col items-center text-center">

            <div className="mb-3 flex items-center justify-center gap-2 sm:mb-4 sm:gap-3 md:mb-6 md:gap-4 lg:mb-8">

              <img
                src={globeIcon}
                alt="Global Deployments"
                className="h-7 w-7 object-contain sm:h-9 sm:w-9 md:h-11 md:w-11 lg:h-14 lg:w-14 xl:h-16 xl:w-16"
              />

              <StatsCounter
                value={5}
                suffix="+"
                duration={2}
                className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
              />

            </div>

            <div className="w-full max-w-xs border-t border-black pt-2 sm:pt-3 md:pt-5 lg:pt-6">
              <p className="text-xs font-medium sm:text-sm md:text-xl lg:text-2xl">
                Global Deployments
              </p>
            </div>

          </div>

          {/* Countries */}
          <div className="col-span-2 flex flex-col items-center text-center md:col-span-1">

            <div className="mb-3 flex items-center justify-center gap-2 sm:mb-4 sm:gap-3 md:mb-6 md:gap-4 lg:mb-8">

              <img
                src={mapsIcon}
                alt="Countries"
                className="h-7 w-7 object-contain sm:h-9 sm:w-9 md:h-11 md:w-11 lg:h-14 lg:w-14 xl:h-16 xl:w-16"
              />

              <StatsCounter
                value={4}
                duration={2}
                className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
              />

            </div>

            <div className="w-full max-w-xs border-t border-black pt-2 sm:pt-3 md:pt-5 lg:pt-6">
              <p className="text-xs font-medium sm:text-sm md:text-xl lg:text-2xl">
                Countries
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default ProliantInNumbers;