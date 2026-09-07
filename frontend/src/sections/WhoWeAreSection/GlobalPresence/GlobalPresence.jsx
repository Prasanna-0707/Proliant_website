import LocationsMap from "../../../components/maps/LocationsMap";

const GlobalPresence = () => {
  return (
    <section className="relative overflow-hidden bg-black text-white">

      {/* =======================================================
          HEADING
      ======================================================= */}

      <div
        className="
          mx-auto
          max-w-7xl
          px-6
          pb-0
          pt-10
          md:px-8
          md:pt-14
        "
      >
        <div
          className="
            md:mb-3
            lg:mb-4
          "
        >
          <p
            className="
              mb-2
              text-xs
              font-medium
              uppercase
              tracking-[3px]
              text-white
              md:text-sm
            "
          >
            Our Global{" "}
            <span className="text-[#EF3B3A]">
              Presence
            </span>
          </p>

          <h2
            className="
              max-w-3xl
              text-3xl
              font-bold
              leading-tight
              tracking-tight
              text-white
              sm:text-4xl
              md:text-5xl
            "
          >
            Connecting People,
            <br className="sm:hidden" />{" "}
            Data & Possibilities
          </h2>

          <p
            className="
              mt-3
              max-w-xl
              text-sm
              leading-6
              text-neutral-400
              md:text-base
              md:leading-7
            "
          >
            Explore our global locations and discover
            how Proliant Data delivers technology,
            data and business solutions worldwide.
          </p>
        </div>
      </div>

      {/* =======================================================
          MAP AREA
      ======================================================= */}

      <div className="relative -mt-4 md:-mt-6">
        <LocationsMap />

        {/* TOP GRADIENT */}
        <div
          className="
            pointer-events-none
            absolute
            left-0
            top-0
            z-10
            h-12
            w-full
            bg-linear-to-b
            from-black/20
            via-black/10
            to-transparent
            sm:h-16
          "
        />

        {/* BOTTOM GRADIENT */}
        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-0
            z-10
            h-12
            w-full
            bg-linear-to-t
            from-black/20
            via-black/10
            to-transparent
            sm:h-16
          "
        />
      </div>
    </section>
  );
};

export default GlobalPresence;