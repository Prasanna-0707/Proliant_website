import StatsCounter from "@/components/ui/stats-counter";

const ProliantInNumbers = () => {
  return (
    <section className="bg-white text-black py-24 md:py-28">
      <div className="max-w-7xl mx-auto px-8">

        {/* Section Heading */}
        <div className="mb-20">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
            Proliant in Numbers
          </h2>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10">

          {/* Employees */}
          <div className="flex flex-col items-center text-center">

            <div className="flex items-center justify-center gap-4 mb-8">
              <StatsCounter
                value={130}
                suffix="+"
                duration={2}
                className="text-6xl md:text-7xl lg:text-8xl font-bold"
              />
            </div>

            <div className="w-full max-w-xs border-t border-black pt-6">
              <p className="text-2xl md:text-3xl font-medium">
                Employees
              </p>
            </div>

          </div>

          {/* Global Deployments */}
          <div className="flex flex-col items-center text-center">

            <div className="flex items-center justify-center gap-4 mb-8">
              <StatsCounter
                value={5}
                suffix="+"
                duration={2}
                className="text-6xl md:text-7xl lg:text-8xl font-bold"
              />
            </div>

            <div className="w-full max-w-xs border-t border-black pt-6">
              <p className="text-2xl md:text-3xl font-medium">
                Global Deployments
              </p>
            </div>

          </div>

          {/* Countries */}
          <div className="flex flex-col items-center text-center">

            <div className="flex items-center justify-center gap-4 mb-8">
              <StatsCounter
                value={4}
                duration={2}
                className="text-6xl md:text-7xl lg:text-8xl font-bold"
              />
            </div>

            <div className="w-full max-w-xs border-t border-black pt-6">
              <p className="text-2xl md:text-3xl font-medium">
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