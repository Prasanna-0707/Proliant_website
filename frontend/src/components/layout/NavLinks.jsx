const NavLinks = ({ scrolled }) => {
  const links = [
    "Home",
    "Who We Are",
    "What We Do",
    "Careers",
  ];

  return (
    <nav className="flex items-center gap-10">
      {links.map((item, index) => (
        <a
          key={index}
          href="#"
          className="
            relative
            text-[16px]
            font-medium
            text-white
            transition-all
            duration-300

            hover:text-blue-400
            hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]
            hover:scale-110

            after:absolute
            after:left-0
            after:-bottom-2
            after:h-1
            after:w-0
            after:bg-blue-500
            after:transition-all
            after:duration-300
            hover:after:w-full
          "
        >
          {item}
        </a>
      ))}
    </nav>
  );
};

export default NavLinks;