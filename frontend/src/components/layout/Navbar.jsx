import { useState, useEffect } from "react";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import ContactButton from "./ContactButton";
import MobileMenu from "./MobileMenu";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full h-20 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/45 backdrop-blur-md border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-8">
        <Logo />

        <div className="hidden lg:flex items-center gap-12">
          <NavLinks scrolled={scrolled} />
        </div>

        <div className="hidden lg:block">
          <ContactButton scrolled={scrolled} />
        </div>

        <div className="lg:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;