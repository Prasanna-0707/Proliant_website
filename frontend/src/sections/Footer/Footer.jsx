import Globe from "react-globe.gl";
import { locations } from "./data";
import logo from "../../assets/logos/ProliantWhite/proliant_white.png";

const Footer = () => {
  return (
    <footer className="bg-black text-white">

      {/* =========================
          CONTACT SECTION
      ========================== */}

      <section className="bg-black">

        <div className="max-w-7xl mx-auto px-8 py-16">

          {/* CONTACT HEADING */}

          <div className="relative text-center mb-12 pt-16 md:pt-0">

            {/* LOGO - TOP LEFT */}
            <div className="absolute left-0 top-0">
              <img
                src={logo}
                alt="Proliant Data"
                className="w-40 md:w-44 h-auto object-contain"
              />
            </div>

            <p className="text-blue-500 uppercase tracking-[6px] text-sm mb-3">
              Contact
            </p>

            <h2 className="text-4xl md:text-5xl font-semibold">
              Let's Connect
            </h2>

          </div>


          {/* =========================
              MAIN CONTENT
          ========================== */}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-8 items-center">


            {/* =========================
                LEFT SIDE LINKS
            ========================== */}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">

              {/* COMPANY */}

              <div>

                <h3 className="text-base font-semibold tracking-widest uppercase mb-6">
                  Company
                </h3>

                <div className="flex flex-col gap-4 text-base text-gray-400">

                  <a
                    href="/"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Home
                  </a>

                  <a
                    href="/who-we-are"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Who We Are
                  </a>

                  <a
                    href="/what-we-do"
                    className="hover:text-white transition-colors duration-300"
                  >
                    What We Do
                  </a>

                  <a
                    href="/careers"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Careers
                  </a>

                </div>

              </div>


              {/* LEGAL */}

              <div>

                <h3 className="text-base font-semibold tracking-widest uppercase mb-6">
                  Legal
                </h3>

                <div className="flex flex-col gap-4 text-base text-gray-400">

                  <a
                    href="/terms"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Terms & Conditions
                  </a>

                  <a
                    href="/privacy"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Privacy Policy
                  </a>

                </div>

              </div>


              {/* SOCIAL */}

              <div>

                <h3 className="text-base font-semibold tracking-widest uppercase mb-6">
                  Social
                </h3>

                <a
                  href="#"
                  className="text-base text-gray-400 underline underline-offset-4 hover:text-white transition-colors duration-300"
                >
                  LinkedIn
                </a>

              </div>

            </div>


            {/* =========================
                RIGHT SIDE GLOBE
            ========================== */}

            <div className="flex justify-center lg:justify-start">

              <div
                className="
                  w-108
                  h-108
                  -translate-x-12
                  md:-translate-x-16
                "
              >

                <Globe

                  width={430}
                  height={430}

                  backgroundColor="rgba(0,0,0,0)"

                  globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"


                  pointsData={locations}

                  pointLat="lat"
                  pointLng="lng"

                  pointColor={() => "#3b82f6"}

                  pointAltitude={0.035}

                  pointRadius={0.35}

                  pointsMerge={false}



                  htmlElementsData={locations}

                  htmlLat="lat"
                  htmlLng="lng"

                  htmlAltitude={0.05}

                  htmlElement={(location) => {

                    const pin = document.createElement("div");

                    pin.innerHTML = `
                      <div
                        style="
                          width: 30px;
                          height: 30px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          cursor: pointer;
                          transform: translate(-50%, -50%);
                        "
                      >

                        <div
                          style="
                            font-size: 27px;
                            line-height: 1;
                            filter:
                              drop-shadow(0 0 5px rgba(59,130,246,0.9))
                              drop-shadow(0 0 10px rgba(59,130,246,0.5));
                          "
                        >
                          📍
                        </div>

                      </div>
                    `;

                    return pin;
                  }}



                  pointLabel={(location) => `
                    <div
                      style="
                        background:#ffffff;
                        color:#000000;
                        padding:16px 18px;
                        border-radius:12px;
                        min-width:250px;
                        font-family:Arial,sans-serif;
                        box-shadow:0 12px 35px rgba(0,0,0,0.45);
                      "
                    >

                      <div
                        style="
                          font-size:17px;
                          font-weight:700;
                          margin-bottom:9px;
                        "
                      >
                        ${location.flag} ${location.country}
                      </div>

                      <div
                        style="
                          font-size:13px;
                          font-weight:600;
                          margin-bottom:7px;
                        "
                      >
                        ${location.company}
                      </div>

                      <div
                        style="
                          font-size:12px;
                          line-height:1.55;
                          color:#555;
                        "
                      >
                        ${location.address}
                      </div>

                      <div
                        style="
                          font-size:12px;
                          margin-top:9px;
                        "
                      >
                        ${location.phone}
                      </div>

                      <div
                        style="
                          font-size:12px;
                          margin-top:4px;
                        "
                      >
                        ${location.email}
                      </div>

                    </div>
                  `}

                />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          COPYRIGHT
      ========================== */}

      <div className="border-t border-white/10">

        <div className="max-w-7xl mx-auto px-8 py-5">

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-500">

            <p>
              © {new Date().getFullYear()} Proliant Data LLC. All Rights Reserved.
            </p>

            <div className="flex items-center gap-5">

              <a
                href="/privacy"
                className="hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </a>

              <span className="text-white/20">
                |
              </span>

              <a
                href="/terms"
                className="hover:text-white transition-colors duration-300"
              >
                Terms & Conditions
              </a>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;