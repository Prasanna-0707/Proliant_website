const About = () => {
  return (
    <section className="bg-black text-white py-28">
      <div className="max-w-7xl mx-auto px-8">

        <p className="text-blue-500 uppercase tracking-[5px] mb-4">
          Who We Are
        </p>

        <h2 className="text-5xl font-bold mb-8">
          Empowering Businesses Through
          <br />
          Data & AI Innovation
        </h2>

        <div className="grid grid-cols-2 gap-20 items-center">

          {/* Left Side */}
          <div className="bg-zinc-900 rounded-3xl h-[450px] flex items-center justify-center">
            <span className="text-gray-500 text-xl">
              Image Placeholder
            </span>
          </div>

          {/* Right Side */}
          <div>

            <p className="text-gray-300 leading-8 mb-8">
              Proliant Data delivers enterprise-grade data management,
              migration, AI-powered innovation, analytics, and digital
              transformation solutions that help organizations modernize
              their business processes and accelerate growth.
            </p>

            <p className="text-gray-400 leading-8">
              With expertise across healthcare, manufacturing,
              retail, finance, and technology, we help enterprises
              transform complex data into valuable business insights.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
};

export default About;