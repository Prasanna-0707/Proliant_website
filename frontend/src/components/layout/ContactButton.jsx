import GooeyNav from "@/components/ui/GooeyNav";

const ContactButton = () => {
  const items = [
    {
      label: "Contact",
      href: "#contact",
    },
  ];

  return (
    <GooeyNav
      items={items}
      particleCount={15}
      particleDistances={[90, 10]}
      particleR={100}
      initialActiveIndex={-1}
      animationTime={600}
      timeVariance={300}
      colors={[1, 1, 1, 1, 1, 1, 1, 1]}
    />
  );
};

export default ContactButton;