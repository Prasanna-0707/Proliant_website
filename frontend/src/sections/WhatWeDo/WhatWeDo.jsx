import {
  capabilities,
  industries,
  technologies,
} from "./data";

const WhatWeDo = () => {
  return (
    <section className="bg-black text-white py-28">
      <div className="max-w-7xl mx-auto px-8">

        <div className="grid grid-cols-3 gap-16">

          {/* Capabilities */}
          <div>
            <h3 className="text-blue-500 uppercase tracking-[5px] mb-8">
              Capabilities
            </h3>

            <ul className="space-y-6">
              {capabilities.map((item) => (
                <li
                  key={item.id}
                  className="text-2xl text-gray-200"
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h3 className="text-blue-500 uppercase tracking-[5px] mb-8">
              Industries
            </h3>

            <ul className="space-y-6">
              {industries.map((item) => (
                <li
                  key={item.id}
                  className="text-2xl text-gray-200"
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Technologies */}
          <div>
            <h3 className="text-blue-500 uppercase tracking-[5px] mb-8">
              Technologies
            </h3>

            <ul className="space-y-6">
              {technologies.map((item) => (
                <li
                  key={item.id}
                  className="text-2xl text-gray-200"
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
};

export default WhatWeDo;