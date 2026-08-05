import { whyChooseData } from "./data";

const WhyChooseProliant = () => {
  return (
    <section className="bg-zinc-950 text-white py-28">
      <div className="max-w-7xl mx-auto px-8">

        <p className="text-blue-500 uppercase tracking-[5px] mb-4">
          Why Choose Us
        </p>

        <h2 className="text-5xl font-bold mb-16">
          Why Choose Proliant
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {whyChooseData.map((item) => (
            <div
              key={item.id}
              className="border border-zinc-800 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-semibold mb-4">
                {item.title}
              </h3>

              <p className="text-gray-400 leading-7">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseProliant;