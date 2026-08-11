const ContactButton = ({ scrolled }) => {
  return (
    <button
      className={`px-8 py-3 rounded-full font-medium cursor-pointer transition-all duration-300 border
      ${
        scrolled
          ? "bg-black text-white border-black hover:bg-gray-800"
          : "bg-white text-black border-white hover:bg-gray-100"
      }`}
    >
      Contact
    </button>
  );
};

export default ContactButton;