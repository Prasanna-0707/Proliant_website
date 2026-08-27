import { useState } from "react";
import { Menu, X } from "lucide-react";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
  { name: "Home", path: "/" },
  { name: "Who We Are", path: "/who-we-are" },
  { name: "What We Do", path: "/what-we-do" },
  { name: "Careers", path: "/careers" },
  { name: "Contact", path: "/contact" },
];

  return (
    <div className="relative">
      <button
        type="button"
        className="text-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-56 bg-black border border-white/10 shadow-lg z-50">
          <nav className="flex flex-col">
            {links.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className="px-6 py-4 text-white text-[16px] font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;