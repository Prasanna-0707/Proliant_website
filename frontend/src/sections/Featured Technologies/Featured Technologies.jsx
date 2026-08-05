import { technologies } from "./data";

const FeaturedTechnologies = () => {
  return (
    <section className="bg-zinc-950 text-white py-28">
      <div className="max-w-7xl mx-auto px-8">

        <p className="text-blue-500 uppercase tracking-[5px] mb-4">
          Technologies
        </p>

        <h2 className="text-5xl font-bold mb-16">
          Featured Technologies
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {technologies.map((tech) => (
            <div
              key={tech.id}
              className="border border-zinc-800 rounded-2xl p-8 text-center"
            >
              <h3 className="text-xl font-semibold">
                {tech.name}
              </h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturedTechnologies;