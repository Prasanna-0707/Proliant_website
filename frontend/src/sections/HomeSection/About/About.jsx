import whoWeAreImage from "@/assets/images/who_we_are.png";

const About = () => {
  return (
    <section className="bg-black text-white py-20 md:py-24">

      {/* MASK2 ANIMATION */}
      <style>{`
        .mask2-button {
          position: relative;
          width: 190px;
          height: 46px;
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 8px;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          cursor: pointer;
        }

        .mask2-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background: white;

          -webkit-mask-image: url("https://raw.githubusercontent.com/robin-dela/css-mask-animation/master/img/nature-sprite.png");
          mask-image: url("https://raw.githubusercontent.com/robin-dela/css-mask-animation/master/img/nature-sprite.png");

          -webkit-mask-size: 2300% 100%;
          mask-size: 2300% 100%;

          -webkit-mask-position: 100% 0;
          mask-position: 100% 0;

          animation: mask2Out 0.7s steps(22) forwards;
        }

        .mask2-button:hover::before {
          animation: mask2In 0.7s steps(22) forwards;
        }

        @keyframes mask2In {
          from {
            -webkit-mask-position: 100% 0;
            mask-position: 100% 0;
          }

          to {
            -webkit-mask-position: 0 0;
            mask-position: 0 0;
          }
        }

        @keyframes mask2Out {
          from {
            -webkit-mask-position: 0 0;
            mask-position: 0 0;
          }

          to {
            -webkit-mask-position: 100% 0;
            mask-position: 100% 0;
          }
        }

        .mask2-text {
          position: relative;
          z-index: 2;
          color: white;
          transition: color 0.3s ease;
        }

        .mask2-button:hover .mask2-text {
          color: black;
        }

        .mask2-arrow {
          position: relative;
          z-index: 2;
          margin-left: 14px;
          color: white;
          transition: color 0.3s ease, transform 0.3s ease;
        }

        .mask2-button:hover .mask2-arrow {
          color: black;
          transform: translateX(5px);
        }
      `}</style>

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

            {/* READ MORE - MASK2 ANIMATION */}
            <a
              href="/who-we-are"
              className="mask2-button"
            >
              <span className="mask2-text">
                READ MORE
              </span>

              <span className="mask2-arrow">
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