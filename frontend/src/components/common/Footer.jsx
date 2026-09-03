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
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
          once: true,
        },
      });

      tl.from(".footer-brand", {
        opacity: 0,
        y: 35,
        duration: 0.8,
        ease: "power3.out",
      })
        .from(
          ".footer-column",
          {
            opacity: 0,
            y: 30,
            duration: 0.7,
            stagger: 0.12,
            ease: "power3.out",
          },
          "-=0.45"
        )
        .from(
          ".footer-bottom",
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.35"
        );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className={
        isLight
          ? "site-footer border-t border-black/15 bg-white px-8 py-10 text-black md:px-16 md:py-12 lg:px-24"
          : "site-footer border-t border-white/10 bg-black px-8 py-10 text-white md:px-16 md:py-12 lg:px-24"
      }
    >
      <div className="mx-auto max-w-7xl">

        {/* =========================
            MAIN FOOTER
        ========================== */}

        <div
          className={
            isLight
              ? "grid gap-10 border-b border-black/15 pb-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12"
              : "grid gap-10 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12"
          }
        >

          {/* =========================
              BRAND
          ========================== */}

          <div className="footer-brand">
            <div className="mb-5">
              <img
                src={isLight ? blackLogo : whiteLogo}
                alt="Proliant Data"
                className="h-9 w-auto object-contain md:h-10"
              />
            </div>

            <p
              className={
                isLight
                  ? "max-w-xs text-sm font-medium leading-relaxed text-black/75"
                  : "max-w-xs text-sm leading-relaxed text-white/35"
              }
            >
              Transforming enterprise complexity through data,
              technology, analytics and intelligent solutions.
            </p>
          </div>

          {/* =========================
              COMPANY
          ========================== */}

          <div className="footer-column">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#EF3B3A]">
              Company
            </p>

            <div
              className={
                isLight
                  ? "mt-4 flex flex-col gap-2.5 text-sm font-medium text-black/75"
                  : "mt-4 flex flex-col gap-2.5 text-sm text-white/45"
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

          <div className="footer-column">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#EF3B3A]">
              Legal
            </p>

            <div
              className={
                isLight
                  ? "mt-4 flex flex-col gap-2.5 text-sm font-medium text-black/75"
                  : "mt-4 flex flex-col gap-2.5 text-sm text-white/45"
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

          <div className="footer-column">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#EF3B3A]">
              Connect
            </p>

            <div
              className={
                isLight
                  ? "mt-4 flex flex-col gap-2.5 text-sm font-medium text-black/75"
                  : "mt-4 flex flex-col gap-2.5 text-sm text-white/45"
              }
            >
              {/* CONTACT */}

              <Link
                to="/contact"
                className="group flex w-fit items-center gap-2 transition-colors duration-300 hover:text-[#EF3B3A]"
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
              ? "footer-bottom flex flex-col gap-4 pt-5 text-xs font-medium text-black/65 md:flex-row md:items-center md:justify-between"
              : "footer-bottom flex flex-col gap-4 pt-5 text-xs text-white/30 md:flex-row md:items-center md:justify-between"
          }
        >
          <p>
            © {new Date().getFullYear()} Proliant Data LLC.
            All Rights Reserved.
          </p>

          <div className="flex items-center gap-4">
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
  );
};

export default Footer;