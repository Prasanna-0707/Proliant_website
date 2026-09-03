import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NavLinks = ({ scrolled }) => {
  const [openMenu, setOpenMenu] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  /*
   * =================================================
   * SCROLL TO HASH SECTION AFTER PAGE LOAD
   * =================================================
   */

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const sectionId = location.hash.substring(1);

    let attempts = 0;
    let animationFrame;

    const findSection = () => {
      const section = document.getElementById(sectionId);

      if (section) {
        /*
         * Give the new page a moment to finish rendering
         * before starting the scroll.
         */
        requestAnimationFrame(() => {
          section.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });

        return;
      }

      attempts += 1;

      /*
       * Keep checking while the destination section
       * is still being rendered.
       */
      if (attempts < 120) {
        animationFrame = requestAnimationFrame(findSection);
      }
    };

    animationFrame = requestAnimationFrame(findSection);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [location.pathname, location.hash]);

  /*
   * =================================================
   * MAIN PAGE NAVIGATION
   * =================================================
   *
   * Clicking:
   * Home
   * Who We Are
   * What We Do
   * Careers
   *
   * should always open the Hero / top of the page.
   */

  const navigateToPage = (path) => {
    setOpenMenu(null);

    /*
     * Already on the same page
     */
    if (location.pathname === path) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      /*
       * Remove any old hash from the URL.
       */
      if (location.hash) {
        navigate(path, {
          replace: true,
        });
      }

      return;
    }

    /*
     * Different page.
     *
     * No hash means the page opens from Hero/top.
     */
    navigate(path);
  };

  /*
   * =================================================
   * SECTION NAVIGATION
   * =================================================
   */

  const scrollToSection = (path, sectionId) => {
    setOpenMenu(null);

    /*
     * =================================================
     * SAME PAGE
     * =================================================
     */

    if (location.pathname === path) {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        /*
         * Update URL without triggering another
         * React Router navigation.
         */
        window.history.replaceState(
          null,
          "",
          `${path}#${sectionId}`
        );
      }

      return;
    }

    /*
     * =================================================
     * DIFFERENT PAGE
     * =================================================
     *
     * React Router changes the page first.
     *
     * Then the useEffect above waits until the
     * destination section exists and scrolls to it.
     */

    navigate(`${path}#${sectionId}`);
  };

  const links = [
    {
      name: "Home",
      path: "/",
    },

    {
      name: "Who We Are",
      path: "/who-we-are",
      dropdown: [
        {
          name: "About",
          section: "about",
        },
        {
          name: "Leaders",
          section: "leaders",
        },
        {
          name: "Contact Us",
          path: "/contact",
          section: "get-in-touch",
        },
      ],
    },

    {
      name: "What We Do",
      path: "/what-we-do",
      dropdown: [
        {
          name: "Capabilities",
          section: "capabilities",
        },
        {
          name: "Industries",
          section: "industries",
        },
        {
          name: "Technologies",
          section: "technologies",
        },
      ],
    },

    {
      name: "Careers",
      path: "/careers",
    },
  ];

  return (
    <nav className="flex items-center gap-10">
      {links.map((item) => {
        /*
         * =================================================
         * NORMAL LINKS
         * Home / Careers
         * =================================================
         */

        if (!item.dropdown) {
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => navigateToPage(item.path)}
              className="
                group
                relative
                inline-flex
                items-center
                border-0
                bg-transparent
                p-0
                text-[16px]
                font-medium
                text-white
                transition-all
                duration-300
                hover:scale-105
              "
            >
              <span
                className="
                  transition-all
                  duration-300
                  group-hover:text-[#EF3B3A]
                  group-hover:drop-shadow-[0_0_12px_rgba(239,59,58,0.7)]
                "
              >
                {item.name}
              </span>

              <span
                className="
                  absolute
                  left-0
                  -bottom-2
                  h-0.5
                  w-0
                  rounded-full
                  bg-[#EF3B3A]
                  transition-all
                  duration-300
                  group-hover:w-full
                "
              />
            </button>
          );
        }

        /*
         * =================================================
         * DROPDOWN LINKS
         * =================================================
         */

        return (
          <div
            key={item.name}
            className="relative"
            onMouseEnter={() => setOpenMenu(item.name)}
            onMouseLeave={() => setOpenMenu(null)}
          >
            {/* MAIN PAGE BUTTON */}

            <button
              type="button"
              onClick={() => navigateToPage(item.path)}
              className="
                group
                relative
                inline-flex
                items-center
                gap-2
                border-0
                bg-transparent
                p-0
                text-[16px]
                font-medium
                text-white
                transition-all
                duration-300
                hover:scale-105
              "
            >
              <span
                className="
                  transition-all
                  duration-300
                  group-hover:text-[#EF3B3A]
                  group-hover:drop-shadow-[0_0_12px_rgba(239,59,58,0.7)]
                "
              >
                {item.name}
              </span>

              <span
                className={`
                  text-[10px]
                  transition-all
                  duration-300
                  ${
                    openMenu === item.name
                      ? "rotate-180 text-[#EF3B3A]"
                      : "text-white"
                  }
                `}
              >
                ▼
              </span>

              <span
                className="
                  absolute
                  left-0
                  -bottom-2
                  h-0.5
                  w-0
                  rounded-full
                  bg-[#EF3B3A]
                  transition-all
                  duration-300
                  group-hover:w-full
                "
              />
            </button>

            {/* DROPDOWN */}

            <div
              className={`
                absolute
                left-1/2
                top-full
                -translate-x-1/2
                pt-5
                transition-all
                duration-300
                ${
                  openMenu === item.name
                    ? "visible translate-y-0 opacity-100"
                    : "invisible pointer-events-none -translate-y-2 opacity-0"
                }
              `}
            >
              <div
                className="
                  w-56
                  overflow-hidden
                  rounded-xl
                  border
                  border-white/10
                  bg-black/95
                  backdrop-blur-xl
                  shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                "
              >
                {item.dropdown.map((subItem, index) => (
                  <button
                    key={subItem.name}
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        subItem.path || item.path,
                        subItem.section
                      )
                    }
                    className={`
                      group/item
                      flex
                      w-full
                      items-center
                      justify-between
                      px-5
                      py-4
                      text-left
                      text-sm
                      text-white/75
                      transition-all
                      duration-300
                      hover:bg-white/5
                      hover:text-white
                      ${
                        index !== item.dropdown.length - 1
                          ? "border-b border-white/5"
                          : ""
                      }
                    `}
                  >
                    <span
                      className="
                        transition-all
                        duration-300
                        group-hover/item:translate-x-1
                        group-hover/item:text-[#EF3B3A]
                      "
                    >
                      {subItem.name}
                    </span>

                    <span
                      className="
                        translate-x-2
                        text-[#EF3B3A]
                        opacity-0
                        transition-all
                        duration-300
                        group-hover/item:translate-x-0
                        group-hover/item:opacity-100
                      "
                    >
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
};

export default NavLinks;