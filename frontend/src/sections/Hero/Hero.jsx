const Hero = () => {
  return (
    <section className="h-screen bg-black flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-8 text-center">

        <p className="text-blue-500 uppercase tracking-[6px] font-medium mb-6">
          AI Powered Data Solutions
        </p>

        <h1 className="text-6xl font-bold text-white leading-tight mb-8">
          Transforming
          <br />
          Data Into Intelligence
        </h1>

        <p className="text-gray-400 text-xl max-w-3xl mx-auto mb-12">
          Empowering enterprises through AI, Enterprise Data Management,
          Migration, Analytics and Digital Transformation.
        </p>

        <div className="flex justify-center gap-6">

          <button className="px-8 py-4 rounded-full bg-blue-600 text-white">
            Explore Services
          </button>

          <button className="px-8 py-4 rounded-full border border-white text-white">
            Contact Us
          </button>

        </div>

      </div>
    </section>
  );
};

export default Hero;