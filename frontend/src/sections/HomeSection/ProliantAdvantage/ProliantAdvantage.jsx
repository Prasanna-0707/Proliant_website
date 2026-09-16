import { motion } from "framer-motion";

const ProliantAdvantage = () => {
  return (
    <section
      className="
        bg-black
        py-10
        text-white
        sm:py-12
        md:py-16
        lg:py-24
      "
    >
      {/* READ MORE - SAME ANIMATION AS WHO WE ARE */}
      <style>{`
        .proliant-mask3-button {
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

        .proliant-mask3-button::before {
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

        .proliant-mask3-button:hover::before {
          clip-path: polygon(
            0 0,
            100% 0,
            100% 100%,
            0 100%
          );
        }

        .proliant-mask3-button::after {
          content: "";
          position: absolute;
          top: -20%;
          left: -40%;
          width: 25%;
          height: 140%;
          z-index: 2;
          background: rgba(255, 255, 255, 0.25);

          transform:
            skewX(-25deg)
            translateX(-500%);

          transition: transform 0.7s ease;
        }

        .proliant-mask3-button:hover::after {
          transform:
            skewX(-25deg)
            translateX(800%);
        }

        .proliant-mask3-text {
          position: relative;
          z-index: 3;
          color: white;
          transition: color 0.3s ease;
        }

        .proliant-mask3-button:hover .proliant-mask3-text {
          color: black;
        }

        .proliant-mask3-arrow {
          position: relative;
          z-index: 3;
          margin-left: 14px;
          color: white;
          transition: color 0.3s ease, transform 0.3s ease;
        }

        .proliant-mask3-button:hover .proliant-mask3-arrow {
          color: black;
          transform: translateX(5px);
        }

        @media (max-width: 639px) {
          .proliant-mask3-button {
            width: 170px;
            height: 44px;
          }

          .proliant-mask3-arrow {
            margin-left: 10px;
          }
        }
      `}</style>

      <div
        className="
          mx-auto
          max-w-7xl
          px-5
          sm:px-6
          md:px-8
        "
      >

        {/* =========================
            HEADING
        ========================== */}

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="
            text-[clamp(2.15rem,7vw,4.5rem)]
            font-bold
            leading-[1.05]
            tracking-tight
            sm:text-[clamp(2.3rem,7vw,4.5rem)]
          "
        >
          The Proliant Advantage
        </motion.h2>

        {/* =========================
            DIVIDER
        ========================== */}

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
            delay: 0.1,
          }}
          className="
            mt-5
            origin-left
            border-t
            border-white/30
            sm:mt-6
            md:mt-8
            lg:mt-9
          "
        />

        {/* =========================
            CONTENT
        ========================== */}

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
            delay: 0.15,
          }}
          className="max-w-6xl"
        >

          {/* =========================
              INTRO
          ========================== */}

          <p
            className="
              mt-5
              max-w-6xl
              text-[clamp(1.2rem,3vw,2.15rem)]
              font-normal
              leading-[1.25]
              text-white
              sm:mt-6
              md:mt-7
              lg:mt-8
            "
          >
            Our approach is built on a foundation of specialized talent,
            proprietary technology, and a commitment to true partnership.
          </p>

          {/* =========================
              DESCRIPTION
          ========================== */}

          <p
            className="
              mt-4
              max-w-6xl
              text-[14px]
              leading-[1.55]
              text-white/85
              sm:mt-5
              sm:text-[15px]
              sm:leading-6
              md:mt-6
              md:text-base
              md:leading-7
              lg:text-lg
              lg:leading-8
            "
          >
            The Proliant Advantage is rooted in our specialist, high-caliber
            talent model, with a team 100% dedicated to SAP Data Migration
            and Governance. Our commitment to well-being results in 0%
            resource turnover, providing clients with unparalleled project
            continuity and deep system familiarity. We leverage proprietary
            AI-driven accelerators to streamline complex migrations, reduce
            manual effort, and ensure data quality from day one. This unique
            combination of expertise and innovation is delivered through a
            transparent, outcome-driven partnership model committed to your
            success.
          </p>

          {/* =========================
              READ MORE
          ========================== */}

          <div
            className="
              mt-6
              sm:mt-7
              md:mt-8
              lg:mt-10
            "
          >
            <a
              href="/who-we-are"
              className="proliant-mask3-button"
            >
              <span className="proliant-mask3-text">
                READ MORE
              </span>

              <span className="proliant-mask3-arrow">
                →
              </span>
            </a>
          </div>

        </motion.div>
      </div>
    </section>
  );
};

export default ProliantAdvantage;