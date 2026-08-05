import { processSteps } from "./data";

const OurProcess = () => {
  return (
    <section className="bg-black text-white py-28">
      <div className="max-w-7xl mx-auto px-8">

        <p className="text-blue-500 uppercase tracking-[5px] mb-4">
          Our Process
        </p>

        <h2 className="text-5xl font-bold mb-16">
          How We Deliver Success
        </h2>

        <div className="grid md:grid-cols-5 gap-8">
          {processSteps.map((step) => (
            <div
              key={step.id}
              className="border border-zinc-800 rounded-2xl p-6"
            >
              <h3 className="text-5xl font-bold text-blue-500 mb-6">
                {step.step}
              </h3>

              <h4 className="text-2xl font-semibold mb-4">
                {step.title}
              </h4>

              <p className="text-gray-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default OurProcess;