import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import blackLogo from "../../assets/logos/ProliantBlack/proliant_black.png";
import whiteLogo from "../../assets/logos/ProliantWhite/proliant_white.png";

gsap.registerPlugin(ScrollTrigger);

const Footer = ({ theme = "dark" }) => {
  const footerRef = useRef(null);

  const isLight = theme === "light";

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
          once: true,
        },
      });

      tl.from(".footer-brand", {
        opacity: 0,
        y: isMobile ? 20 : 35,
        duration: isMobile ? 0.6 : 0.8,
        ease: "power3.out",
      })
        .from(
          ".footer-column",
          {
            opacity: 0,
            y: isMobile ? 18 : 30,
            duration: isMobile ? 0.55 : 0.7,
            stagger: isMobile ? 0.08 : 0.12,
            ease: "power3.out",
          },
          isMobile ? "-=0.3" : "-=0.45"
        )
        .from(
          ".footer-bottom",
          {
            opacity: 0,
            y: isMobile ? 12 : 20,
            duration: isMobile ? 0.5 : 0.6,
            ease: "power3.out",
          },
          isMobile ? "-=0.25" : "-=0.35"
        );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* =========================
          RESPONSIVE FOOTER FIX
      ========================== */}

      <style>{`

        /* =========================================
           480px - 999px
           
           Brand stays on top.
           Company | Legal | Connect stay
           in ONE horizontal row.
        ========================================== */

        @media (min-width: 480px) and (max-width: 999px) {
          .footer-responsive-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .footer-responsive-brand {
            grid-column: 1 / -1;
          }

          .footer-responsive-column {
            grid-column: span 1 / span 1;
          }

          /* Move Connect slightly right */
          .footer-connect {
            transform: translateX(clamp(4px, 1.2vw, 12px));
          }
        }


        /* =========================================
           360px - 479px
           
           Keep Company | Legal | Connect
           in one row with equal visual spacing.
        ========================================== */

        @media (min-width: 360px) and (max-width: 479px) {
          .footer-responsive-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            column-gap: 8px;
            row-gap: 20px;
          }

          .footer-responsive-brand {
            grid-column: 1 / -1;
          }

          .footer-responsive-column {
            grid-column: span 1 / span 1;
            min-width: 0;
          }

          /*
            Small right adjustment for Connect
            so the visual spacing matches the
            Company -> Legal spacing.
          */
          .footer-connect {
            transform: translateX(clamp(5px, 1.8vw, 8px));
          }

          .footer-responsive-column p {
            font-size: 9px;
          }

          .footer-responsive-column div {
            font-size: 11px;
          }
        }


        /* =========================================
           BELOW 360px
           
           Keep the same three-column layout but
           use smaller spacing so there is no
           horizontal overflow.
        ========================================== */

        @media (max-width: 359px) {
          .footer-responsive-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            column-gap: 5px;
            row-gap: 18px;
          }

          .footer-responsive-brand {
            grid-column: 1 / -1;
          }

          .footer-responsive-column {
            grid-column: span 1 / span 1;
            min-width: 0;
          }

          .footer-connect {
            transform: translateX(4px);
          }

          .footer-responsive-column p {
            font-size: 8px;
          }

          .footer-responsive-column div {
            font-size: 10px;
          }
        }


        /* =========================================
           1000px - 1100px
           
           Nest Hub / larger tablet layouts.
        ========================================== */

        @media (min-width: 1000px) and (max-width: 1100px) {
          .footer-nest-hub {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .footer-nest-hub .footer-brand,
          .footer-nest-hub .footer-column {
            grid-column: span 1 / span 1;
          }

          .footer-connect {
            transform: none;
          }
        }

      `}</style>

      <footer
        ref={footerRef}
        className={
          isLight
            ? "site-footer border-t border-black/15 bg-white px-4 py-6 text-black sm:px-6 sm:py-7 md:px-10 md:py-9 lg:px-16 lg:py-12"
            : "site-footer border-t border-white/10 bg-black px-4 py-6 text-white sm:px-6 sm:py-7 md:px-10 md:py-9 lg:px-16 lg:py-12"
        }
      >
        <div className="mx-auto max-w-7xl">

          {/* =========================
              MAIN FOOTER
          ========================== */}

          <div
            className={
              isLight
                ? "footer-nest-hub footer-responsive-grid grid grid-cols-3 gap-x-4 gap-y-6 border-b border-black/15 pb-6 sm:gap-x-6 sm:gap-y-7 sm:pb-7 md:gap-x-8 md:gap-y-8 md:pb-8 lg:grid-cols-4 lg:gap-10 lg:pb-10"
                : "footer-nest-hub footer-responsive-grid grid grid-cols-3 gap-x-4 gap-y-6 border-b border-white/10 pb-6 sm:gap-x-6 sm:gap-y-7 sm:pb-7 md:gap-x-8 md:gap-y-8 md:pb-8 lg:grid-cols-4 lg:gap-10 lg:pb-10"
            }
          >

            {/* =========================
                BRAND
            ========================== */}

            <div
              className="
                footer-brand
                footer-responsive-brand
                col-span-3
                lg:col-span-1
              "
            >
              <div className="mb-3 sm:mb-4">
                <img
                  src={isLight ? blackLogo : whiteLogo}
                  alt="Proliant Data"
                  className="
                    h-7
                    w-auto
                    object-contain
                    sm:h-8
                    md:h-9
                    lg:h-10
                  "
                />
              </div>

              <p
                className={
                  isLight
                    ? "max-w-xl text-xs font-medium leading-relaxed text-black/75 sm:text-sm"
                    : "max-w-xl text-xs leading-relaxed text-white/35 sm:text-sm"
                }
              >
                Transforming enterprise complexity through data,
                technology, analytics and intelligent solutions.
              </p>
            </div>


            {/* =========================
                COMPANY
            ========================== */}

            <div
              className="
                footer-column
                footer-responsive-column
                min-w-0
                lg:col-span-1
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-widest
                  text-[#EF3B3A]
                  sm:text-xs
                "
              >
                Company
              </p>

              <div
                className={
                  isLight
                    ? "mt-2 flex flex-col gap-1.5 text-xs font-medium text-black/75 sm:mt-3 sm:gap-2 sm:text-sm"
                    : "mt-2 flex flex-col gap-1.5 text-xs text-white/45 sm:mt-3 sm:gap-2 sm:text-sm"
                }
              >
                <Link
                  to="/"
                  className="w-fit transition-colors duration-300 hover:text-[#EF3B3A]"
                >
                  Home
                </Link>

                <Link
                  to="/who-we-are"
                  className="w-fit transition-colors duration-300 hover:text-[#EF3B3A]"
                >
                  Who We Are
                </Link>

                <Link
                  to="/what-we-do"
                  className="w-fit transition-colors duration-300 hover:text-[#EF3B3A]"
                >
                  What We Do
                </Link>

                <Link
                  to="/careers"
                  className="w-fit transition-colors duration-300 hover:text-[#EF3B3A]"
                >
                  Careers
                </Link>
              </div>
            </div>


            {/* =========================
                LEGAL
            ========================== */}

            <div
              className="
                footer-column
                footer-responsive-column
                min-w-0
                lg:col-span-1
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-widest
                  text-[#EF3B3A]
                  sm:text-xs
                "
              >
                Legal
              </p>

              <div
                className={
                  isLight
                    ? "mt-2 flex flex-col gap-1.5 text-xs font-medium text-black/75 sm:mt-3 sm:gap-2 sm:text-sm"
                    : "mt-2 flex flex-col gap-1.5 text-xs text-white/45 sm:mt-3 sm:gap-2 sm:text-sm"
                }
              >
                <Link
                  to="/terms"
                  className="w-fit transition-colors duration-300 hover:text-[#EF3B3A]"
                >
                  Terms & Conditions
                </Link>

                <Link
                  to="/privacy"
                  className="w-fit transition-colors duration-300 hover:text-[#EF3B3A]"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>


            {/* =========================
                CONNECT
            ========================== */}

            <div
              className="
                footer-column
                footer-responsive-column
                footer-connect
                min-w-0
                lg:col-span-1
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-widest
                  text-[#EF3B3A]
                  sm:text-xs
                "
              >
                Connect
              </p>

              <div
                className={
                  isLight
                    ? "mt-2 flex flex-col gap-1.5 text-xs font-medium text-black/75 sm:mt-3 sm:gap-2 sm:text-sm"
                    : "mt-2 flex flex-col gap-1.5 text-xs text-white/45 sm:mt-3 sm:gap-2 sm:text-sm"
                }
              >

                {/* CONTACT */}

                <Link
                  to="/contact"
                  className="group flex w-fit items-center gap-1.5 transition-colors duration-300 hover:text-[#EF3B3A]"
                >
                  Contact Us

                  <span className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                    →
                  </span>
                </Link>


                {/* LINKEDIN */}

                <a
                  href="https://www.linkedin.com/company/proliant-data/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit transition-colors duration-300 hover:text-[#EF3B3A]"
                >
                  LinkedIn
                </a>

              </div>
            </div>

          </div>


          {/* =========================
              FOOTER BOTTOM
          ========================== */}

          <div
            className={
              isLight
                ? "footer-bottom flex flex-col gap-2 pt-3 text-[10px] font-medium text-black/65 sm:gap-3 sm:pt-4 sm:text-xs md:flex-row md:items-center md:justify-between"
                : "footer-bottom flex flex-col gap-2 pt-3 text-[10px] text-white/30 sm:gap-3 sm:pt-4 sm:text-xs md:flex-row md:items-center md:justify-between"
            }
          >
            <p>
              © {new Date().getFullYear()} Proliant Data LLC.
              All Rights Reserved.
            </p>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/privacy"
                className="transition-colors duration-300 hover:text-[#EF3B3A]"
              >
                Privacy
              </Link>

              <span className="opacity-40">
                •
              </span>

              <Link
                to="/terms"
                className="transition-colors duration-300 hover:text-[#EF3B3A]"
              >
                Terms
              </Link>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;