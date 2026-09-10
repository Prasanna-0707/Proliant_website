import { motion } from "framer-motion";

import whoWeAreImage from "@/assets/images/Home/whoweare.png";

const WhoWeAre = () => {
  return (
    <section className="bg-black py-12 text-white sm:py-16 md:py-20 lg:py-24">
      {/* MASK3 ANIMATION */}
      <style>{`
        .mask3-button {
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

        .mask3-button::before {
          content: "";

          position: absolute;
          inset: -2px;

          z-index: 1;

          background: white;

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

        .mask3-button:hover::before {
          clip-path: polygon(
            0 0,
            100% 0,
            100% 100%,
            0 100%
          );
        }

        .mask3-button::after {
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

        .mask3-button:hover::after {
          transform:
            skewX(-25deg)
            translateX(800%);
        }

        .mask3-text,
        .mask3-arrow {
          position: relative;
          z-index: 3;

          color: white;

          transition:
            color 0.3s ease,
            transform 0.35s ease;
        }

        .mask3-button:hover .mask3-text,
        .mask3-button:hover .mask3-arrow {
          color: black;
        }

        .mask3-button:hover .mask3-arrow {
          transform: translateX(5px);
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">

        {/* Section Label */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
          className="mb-3 text-xs font-medium uppercase tracking-[2px] text-red-600 sm:mb-4 md:mb-5 md:text-sm"
        >
          Who We Are
        </motion.p>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.1,
          }}
          className="mb-8 max-w-3xl text-2xl font-bold leading-tight sm:mb-9 sm:text-3xl md:mb-10 md:text-4xl lg:mb-11 lg:text-5xl"
        >
          Empowering Businesses Through
          Data & AI Innovation
        </motion.h2>

        {/* Main Content */}
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-14">

          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.9,
              ease: "easeOut",
            }}
            className="relative"
          >
            <div className="absolute -inset-2 rounded-2xl bg-blue-500/10 blur-xl" />

            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-neutral-950">
              <motion.img
                src={whoWeAreImage}
                alt="Proliant Data AI and enterprise solutions"
                className="h-full w-full object-cover"
                whileHover={{ scale: 1.04 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                }}
              />
            </div>
          </motion.div>

          {/* CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 0.15,
            }}
            className="max-w-lg"
          >
            <p className="mb-6 text-sm leading-6 text-gray-300 sm:mb-7 sm:leading-7 md:mb-8 md:text-base">
              Founded in 2021, Proliant Data LLC has rapidly grown from a
              niche in data migration and governance into a trusted partner
              delivering end-to-end Enterprise Data Management, SAP solutions,
              advanced analytics, and AI innovation.
            </p>

            {/* READ MORE - MASK3 */}
            <a
              href="/who-we-are"
              className="mask3-button h-11! w-40! sm:h-12! sm:w-48!"
            >
              <span className="mask3-text">
                READ MORE
              </span>

              <span className="mask3-arrow">
                →
              </span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;