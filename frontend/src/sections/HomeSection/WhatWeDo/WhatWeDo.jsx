import { motion } from "framer-motion";

import whatWeDoImage from "../../../assets/images/Home/whatwedo.png";

const WhatWeDo = () => {
  return (
    <section className="bg-white py-10 text-black sm:py-12 md:py-20">
      {/* MASK3 BUTTON ANIMATION */}
      <style>{`
        .whatwedo-mask3-button {
          position: relative;
          width: 190px;
          height: 46px;
          border: 1px solid rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          cursor: pointer;
        }

        .whatwedo-mask3-button::before {
          content: "";

          position: absolute;
          inset: -2px;

          z-index: 1;

          background: black;

          clip-path: polygon(
            0 0,
            0 0,
            0 100%,
            0 100%
          );

          transition:
            clip-path
            0.65s
            cubic-bezier(
              0.76,
              0,
              0.24,
              1
            );
        }

        .whatwedo-mask3-button:hover::before {
          clip-path: polygon(
            0 0,
            100% 0,
            100% 100%,
            0 100%
          );
        }

        .whatwedo-mask3-button::after {
          content: "";

          position: absolute;

          top: -20%;
          left: -40%;

          width: 25%;
          height: 140%;

          z-index: 2;

          background: rgba(255,255,255,0.25);

          transform:
            skewX(-25deg)
            translateX(-500%);

          transition: transform 0.7s ease;
        }

        .whatwedo-mask3-button:hover::after {
          transform:
            skewX(-25deg)
            translateX(800%);
        }

        .whatwedo-mask3-text,
        .whatwedo-mask3-arrow {
          position: relative;
          z-index: 3;

          color: black;

          transition:
            color 0.3s ease,
            transform 0.35s ease;
        }

        .whatwedo-mask3-button:hover .whatwedo-mask3-text,
        .whatwedo-mask3-button:hover .whatwedo-mask3-arrow {
          color: white;
        }

        .whatwedo-mask3-button:hover .whatwedo-mask3-arrow {
          transform: translateX(5px);
        }

        @media (max-width: 639px) {
          .whatwedo-mask3-button {
            width: 170px;
            height: 44px;
          }

          .whatwedo-mask3-arrow {
            margin-left: 10px;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-8">

        {/* SECTION LABEL */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-3 sm:mb-4"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[2px] text-red-600 sm:mb-5 md:text-sm">
            What We Do
          </p>
        </motion.div>

        {/* MAIN CONTENT */}
        <div className="grid items-center gap-8 sm:gap-10 md:grid-cols-2 md:gap-14 lg:gap-20">

          {/* LEFT - TEXT */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
          >
            {/* HEADING */}
            <h2 className="mb-6 text-[clamp(2rem,8vw,3rem)] font-bold leading-[1.1] sm:mb-7 sm:text-5xl md:mb-8 md:text-5xl lg:text-6xl">
              Turning Data Into Business Impact
            </h2>

            {/* DIVIDER */}
            <div className="mb-6 border-t border-black/10 sm:mb-7 md:mb-8" />

            {/* DESCRIPTION */}
            <div className="max-w-4xl">
              <p className="text-[15px] leading-6 text-neutral-600 sm:text-base sm:leading-7 md:text-lg">
                Proliant Data accelerates data and digital transformation by
                delivering innovative, tailored solutions in enterprise data
                management, migration, governance, and analytics to unlock the
                full potential of your data.
              </p>
            </div>

            {/* READ MORE - MASK3 */}
            <div className="mt-6 sm:mt-7 md:mt-8">
              <a
                href="/what-we-do"
                className="whatwedo-mask3-button"
              >
                <span className="whatwedo-mask3-text">
                  READ MORE
                </span>

                <span className="whatwedo-mask3-arrow">
                  →
                </span>
              </a>
            </div>
          </motion.div>

          {/* RIGHT - IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.9,
              ease: "easeOut",
              delay: 0.15,
            }}
            className="overflow-hidden rounded-2xl"
          >
            <motion.img
              src={whatWeDoImage}
              alt="Proliant Data capabilities"
              className="h-auto w-full object-cover"
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;