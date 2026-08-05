import { contactData } from "./data";

const ContactCTA = () => {
  return (
    <section className="bg-blue-600 text-white py-28">
      <div className="max-w-4xl mx-auto px-8 text-center">

        <h2 className="text-5xl font-bold mb-6">
          {contactData.title}
        </h2>

        <p className="text-xl mb-10">
          {contactData.description}
        </p>

        <button className="bg-white text-black px-10 py-4 rounded-full font-semibold">
          {contactData.button}
        </button>

      </div>
    </section>
  );
};

export default ContactCTA;