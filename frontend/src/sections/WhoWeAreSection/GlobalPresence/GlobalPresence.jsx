import LocationsMap from "../../../components/maps/LocationsMap";

const GlobalPresence = () => {
  return (
    <section className="relative bg-black text-white overflow-hidden">

      {/* Section Heading */}
      <div className="relative z-20 text-center pt-24 pb-16">
        <h2 className="text-4xl md:text-5xl font-bold">
          Our Global Presence
        </h2>

        <p className="mt-4 text-gray-400">
          Connecting businesses across the globe.
        </p>
      </div>

      {/* Map Area */}
      <div className="relative">

        <LocationsMap />

        {/* TOP GRADIENT */}
        <div
          className="
            pointer-events-none
            absolute
            top-0
            left-0
            w-full
            h-20
            bg-gradient-to-b
            from-black/20
            via-black/10
            to-transparent
            z-10
          "
        />

        {/* BOTTOM GRADIENT */}
        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-0
            w-full
            h-20
            bg-gradient-to-t
            from-black/20
            via-black/10
            to-transparent
            z-10
          "
        />

      </div>

    </section>
  );
};

export default GlobalPresence;