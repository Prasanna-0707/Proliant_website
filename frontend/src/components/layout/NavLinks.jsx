import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const NavLinks = ({ scrolled }) => {
  const [openMenu, setOpenMenu] = useState(null);

  const navigate = useNavigate();

  const scrollToSection = (path, sectionId) => {
    setOpenMenu(null);

    navigate(`${path}#${sectionId}`);

    setTimeout(() => {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
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
          section: "contact",
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
        /* =================================================
           NORMAL LINKS
           Home / Careers
        ================================================= */

        if (!item.dropdown) {
          return (
            <Link
              key={item.name}
              to={item.path}
              className="
                group
                relative
                inline-flex
                items-center
                text-[16px]
                font-medium
                text-white
                transition-all
                duration-300
                hover:scale-105
              "
            >
              {/* Text */}
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

              {/* Underline */}
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
            </Link>
          );
        }

        /* =================================================
           DROPDOWN LINKS
           Who We Are / What We Do
        ================================================= */

        return (
          <div
            key={item.name}
            className="relative"
            onMouseEnter={() => setOpenMenu(item.name)}
            onMouseLeave={() => setOpenMenu(null)}
          >
            {/* =================================================
                MAIN PAGE LINK
            ================================================= */}

            <Link
              to={item.path}
              className="
                group
                relative
                inline-flex
                items-center
                gap-2
                text-[16px]
                font-medium
                text-white
                transition-all
                duration-300
                hover:scale-105
              "
            >
              {/* Text */}
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

              {/* Arrow */}
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

              {/* Underline */}
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
            </Link>

            {/* =================================================
                DROPDOWN
            ================================================= */}

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
                    : "invisible -translate-y-2 pointer-events-none opacity-0"
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
                        item.path,
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
                        translate-x-8px
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