import logo from "@/assets/logos/ProliantWhite/proliant_white.png";

const Logo = () => {
  return (
    <img
      src={logo}
      alt="Proliant Logo"
      className="h-12 w-auto object-contain cursor-pointer"
    />
  );
};

export default Logo;