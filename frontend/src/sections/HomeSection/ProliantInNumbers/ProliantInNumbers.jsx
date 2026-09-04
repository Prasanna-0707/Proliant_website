import StatsCounter from "@/components/ui/stats-counter";
import peopleIcon from "@/assets/images/icons8-people.gif";
import globeIcon from "@/assets/images/globe-icon-final.png";
import mapsIcon from "@/assets/images/maps-icon.png";

const ProliantInNumbers = () => {
  return (
    <section className="bg-white text-black py-24 md:py-28">
      <div className="max-w-7xl mx-auto px-8">

        {/* Section Heading */}
        <div className="mb-20">
          <h2 className="text-[clamp(2rem,5vw,3.75rem)] font-bold tracking-tight">
            Proliant in Numbers
          </h2>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10">

          {/* Employees */}
          <div className="flex flex-col items-center text-center">

            <div className="flex items-center justify-center gap-4 mb-8">

              <img
                src={peopleIcon}
                alt="Employees"
                className="w-[clamp(4rem,10vw,7rem)] h-[clamp(4rem,10vw,7rem)] object-contain"
              />

              <StatsCounter
                value={150}
                suffix="+"
                duration={2}
                className="text-[clamp(2.75rem,8vw,6rem)] font-bold"
              />

            </div>

            <div className="w-full max-w-xs border-t border-black pt-6">
              <p className="text-[clamp(1.25rem,3vw,1.875rem)] font-medium">
                Employees
              </p>
            </div>

          </div>

          {/* Global Deployments */}
          <div className="flex flex-col items-center text-center">

            <div className="flex items-center justify-center gap-4 mb-8">

              <img
                src={globeIcon}
                alt="Global Deployments"
                className="w-[clamp(2.75rem,8vw,6rem)] h-[clamp(2.75rem,8vw,6rem)] object-contain"
              />

              <StatsCounter
                value={5}
                suffix="+"
                duration={2}
                className="text-[clamp(2.75rem,8vw,6rem)] font-bold"
              />

            </div>

            <div className="w-full max-w-xs border-t border-black pt-6">
              <p className="text-[clamp(1.25rem,3vw,1.875rem)] font-medium">
                Global Deployments
              </p>
            </div>

          </div>

          {/* Countries */}
          <div className="flex flex-col items-center text-center">

            <div className="flex items-center justify-center gap-4 mb-8">

              <img
                src={mapsIcon}
                alt="Countries"
                className="w-[clamp(2.75rem,8vw,6rem)] h-[clamp(2.75rem,8vw,6rem)] object-contain"
              />

              <StatsCounter
                value={4}
                duration={2}
                className="text-[clamp(2.75rem,8vw,6rem)] font-bold"
              />

            </div>

            <div className="w-full max-w-xs border-t border-black pt-6">
              <p className="text-[clamp(1.25rem,3vw,1.875rem)] font-medium">
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