import { motion } from "framer-motion";

import whatWeDoImage from "../../../assets/images/Home/whatwedo.png";

const WhatWeDo = () => {
  return (
    <section className="bg-white py-16 text-black md:py-20">
      {/* MASK2 BUTTON ANIMATION */}
      <style>{`
        .whatwedo-mask2-button {
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

        .whatwedo-mask2-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background: black;

          -webkit-mask-image: url("https://raw.githubusercontent.com/robin-dela/css-mask-animation/master/img/nature-sprite.png");
          mask-image: url("https://raw.githubusercontent.com/robin-dela/css-mask-animation/master/img/nature-sprite.png");

          -webkit-mask-size: 2300% 100%;
          mask-size: 2300% 100%;

          -webkit-mask-position: 100% 0;
          mask-position: 100% 0;

          animation: whatWeDoMaskOut 0.7s steps(22) forwards;
        }

        .whatwedo-mask2-button:hover::before {
          animation: whatWeDoMaskIn 0.7s steps(22) forwards;
        }

        @keyframes whatWeDoMaskIn {
          from {
            -webkit-mask-position: 100% 0;
            mask-position: 100% 0;
          }

          to {
            -webkit-mask-position: 0 0;
            mask-position: 0 0;
          }
        }

        @keyframes whatWeDoMaskOut {
          from {
            -webkit-mask-position: 0 0;
            mask-position: 0 0;
          }

          to {
            -webkit-mask-position: 100% 0;
            mask-position: 100% 0;
          }
        }

        .whatwedo-mask2-text {
          position: relative;
          z-index: 2;
          color: black;
          transition: color 0.3s ease;
        }

        .whatwedo-mask2-button:hover .whatwedo-mask2-text {
          color: white;
        }

        .whatwedo-mask2-arrow {
          position: relative;
          z-index: 2;
          margin-left: 14px;
          color: black;
          transition: color 0.3s ease, transform 0.3s ease;
        }

        .whatwedo-mask2-button:hover .whatwedo-mask2-arrow {
          color: white;
          transform: translateX(5px);
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-8">
        {/* SECTION LABEL */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-4"
        >
          <p className="text-xs font-medium uppercase tracking-[4px] text-blue-600 md:text-sm">
            Our Capabilities
          </p>
        </motion.div>

        {/* MAIN CONTENT */}
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14 lg:gap-20">
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
            <h2 className="mb-8 text-4xl font-bold leading-tight sm:text-5xl md:text-5xl lg:text-6xl">
              Turning Data Into Business Impact
            </h2>

            {/* DIVIDER */}
            <div className="mb-8 border-t border-black/10" />

            {/* DESCRIPTION */}
            <div className="max-w-4xl">
              <p className="text-base leading-7 text-neutral-600 md:text-lg">
                Proliant Data accelerates data and digital transformation by
                delivering innovative, tailored solutions in enterprise data
                management, migration, governance, and analytics to unlock the
                full potential of your data.
              </p>
            </div>

            {/* READ MORE - MASK2 ANIMATION */}
            <div className="mt-8">
              <a
                href="/what-we-do"
                className="whatwedo-mask2-button"
              >
                <span className="whatwedo-mask2-text">
                  READ MORE
                </span>

                <span className="whatwedo-mask2-arrow">
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