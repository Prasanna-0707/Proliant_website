import { LiquidMetalButton } from "@/components/ui/liquid-metal";

const ContactButton = () => {
  return (
    <LiquidMetalButton
      metalConfig={{
        colorBack: "#EF3B3A ",
        colorTint: "#FF7777",
      }}
    >
      Contact
    </LiquidMetalButton>
  );
};

export default ContactButton;