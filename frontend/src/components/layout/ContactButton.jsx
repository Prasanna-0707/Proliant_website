import { LiquidMetalButton } from "@/components/ui/liquid-metal";

const ContactButton = () => {
  return (
    <LiquidMetalButton
      metalConfig={{
        colorBack: "#2563eb",
        colorTint: "#60a5fa",
      }}
    >
      Contact
    </LiquidMetalButton>
  );
};

export default ContactButton;