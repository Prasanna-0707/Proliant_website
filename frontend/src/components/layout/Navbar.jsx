import Logo from "./Logo";
import NavLinks from "./NavLinks";
import ContactButton from "./ContactButton";
import MobileMenu from "./MobileMenu";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 w-full h-20 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-8">

        <Logo />

        <div className="hidden lg:flex items-center gap-12">
          <NavLinks />
        </div>

        <div className="hidden lg:block">
          <ContactButton />
        </div>

        <div className="lg:hidden">
          <MobileMenu />
        </div>

      </div>
    </header>
  );
};

export default Navbar;