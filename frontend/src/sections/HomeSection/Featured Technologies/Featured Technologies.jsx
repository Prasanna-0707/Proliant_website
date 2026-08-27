import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import enterpriseDataImage from "@/assets/images/Home/EDI.png";
import cutoverImage from "@/assets/images/Home/CA.jpg";
import aiInnovationImage from "@/assets/images/Home/API.jpg";
import applicationManagementImage from "@/assets/images/Home/AMS.jpg";

gsap.registerPlugin(ScrollTrigger);

const FeaturedTechnologies = () => {
  const sectionRef = useRef(null);

  const technologies = [
    {
      id: 1,
      name: "Enterprise Data Management",
      image: enterpriseDataImage,
    },
    {
      id: 2,
      name: "Cutover Management",
      image: cutoverImage,
    },
    {
      id: 3,
      name: "AI-Powered Innovation",
      image: aiInnovationImage,
    },
    {
      id: 4,
      name: "Application Management Services (AMS)",
      image: applicationManagementImage,
    },
  ];

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
          const cards = gsap.utils.toArray(".featured-tech-card");
          const images = gsap.utils.toArray(".featured-tech-card img");

          gsap.set(".featured-tech-label", {
            opacity: 0,
            y: 20,
          });

          gsap.set(".featured-tech-heading", {
            opacity: 0,
            y: 45,
            filter: "blur(8px)",
          });

          gsap.set(cards, {
            opacity: 0,
            y: 50,
          });

          const createAnimations = () => {
            ScrollTrigger.refresh();

            gsap.to(".featured-tech-label", {
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 82%",
                toggleActions: "play none none reverse",
              },
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
            });

            gsap.to(".featured-tech-heading", {
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.9,
              ease: "power4.out",
            });

            gsap.to(cards, {
              scrollTrigger: {
                trigger: ".featured-tech-grid",
                start: "top 82%",
                toggleActions: "play none none reverse",
              },
              opacity: 1,
              y: 0,
              duration: 0.85,
              stagger: 0.14,
              ease: "power3.out",
            });

            ScrollTrigger.refresh();
          };

          const waitForImages = () => {
            const pendingImages = images.filter((image) => !image.complete);

            if (pendingImages.length === 0) {
              createAnimations();
              return;
            }

            let loaded = 0;

            const handleImageLoad = () => {
              loaded += 1;

              if (loaded === pendingImages.length) {
                createAnimations();
              }
            };

            pendingImages.forEach((image) => {
              image.addEventListener("load", handleImageLoad, {
                once: true,
              });

              image.addEventListener("error", handleImageLoad, {
                once: true,
              });
            });
          };

          if (document.fonts?.ready) {
            document.fonts.ready.then(() => {
              waitForImages();
            });
          } else {
            waitForImages();
          }

          const refreshTimer = setTimeout(() => {
            ScrollTrigger.refresh();
          }, 500);

          window.addEventListener("load", ScrollTrigger.refresh);

          return () => {
            clearTimeout(refreshTimer);
            window.removeEventListener("load", ScrollTrigger.refresh);
          };
        }, sectionRef);

        return () => ctx.revert();
      }, []);

  return (
    <section
      ref={sectionRef}
      className="
        overflow-hidden
        bg-black
        px-8
        py-20
        text-white
        md:px-16
        md:py-24
        lg:px-24
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* ==========================================
            HEADING
        ========================================== */}

        <div className="mb-12 md:mb-14">

          <p
            className="
              featured-tech-label
              mb-3
              text-xs
              font-medium
              uppercase
              tracking-widest
              text-[#EF3B3A]
            "
          >
            Technologies
          </p>

          <h2
            className="
              featured-tech-heading
              text-[clamp(1.875rem,7vw,2.5rem)]
              font-semibold
              leading-tight
              tracking-tight
              md:text-5xl
              lg:text-6xl
            "
          >
            Featured Technologies
          </h2>

        </div>


        {/* ==========================================
            CARDS
        ========================================== */}

        <div
          className="
            featured-tech-grid
            grid
            grid-cols-1
            gap-5
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          {technologies.map((tech) => (
            <article
              key={tech.id}
              className="
                featured-tech-card
                group
                relative
                h-96
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-zinc-900
                transition-all
                duration-500
                ease-out
                hover:-translate-y-2
                hover:border-[#EF3B3A]/60
              "
            >

              {/* ======================================
                  IMAGE
              ======================================= */}

              <div className="absolute inset-0 overflow-hidden">
                <img
                    src={tech.image}
                    alt={tech.name}
                    className="h-full w-full object-cover"
                    onLoad={() => {
                      console.log("IMAGE LOADED:", tech.name, tech.image);
                    }}
                    onError={(e) => {
                      console.error("IMAGE FAILED:", tech.name, tech.image);
                      console.error("SRC:", e.currentTarget.src);
                    }}
                />

              </div>


              {/* ======================================
                  IMAGE DARK GRADIENT
              ======================================= */}

              <div
                className="
                  absolute
                  inset-0
                  bg-linear-to-t
                  from-black
                  via-black/55
                  to-black/10
                  opacity-95
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                "
              />


              {/* ======================================
                  RED ATMOSPHERIC GLOW
              ======================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-20
                  h-48
                  w-48
                  rounded-full
                  bg-[#EF3B3A]/20
                  opacity-0
                  blur-3xl
                  transition-opacity
                  duration-700
                  group-hover:opacity-100
                "
              />


              {/* ======================================
                  CARD NUMBER
              ======================================= */}

              {/* <div
                className="
                  absolute
                  left-5
                  top-5
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/30
                  bg-black/30
                  text-xs
                  text-white/80
                  backdrop-blur-sm
                  transition-all
                  duration-500
                  group-hover:border-[#EF3B3A]
                  group-hover:bg-[#EF3B3A]
                  group-hover:text-white
                "
              >
                0{tech.id}
              </div> */}


              {/* ======================================
                  CONTENT
              ======================================= */}

              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  right-0
                  p-5
                  md:p-6
                "
              >

                <div className="flex items-end justify-between gap-4">

                  <h3
                    className="
                      max-w-[80%]
                      text-lg
                      font-semibold
                      leading-tight
                      tracking-tight
                      text-white
                      transition-transform
                      duration-500
                      group-hover:translate-x-1
                      md:text-xl
                    "
                  >
                    {tech.name}
                  </h3>


                  {/* ==================================
                      PLUS BUTTON
                  =================================== */}

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/70
                      bg-black/30
                      text-xl
                      font-light
                      text-white
                      backdrop-blur-sm
                      transition-all
                      duration-500
                      group-hover:border-[#EF3B3A]
                      group-hover:bg-[#EF3B3A]
                    "
                  >
                    <span
                      className="
                        transition-transform
                        duration-500
                        group-hover:rotate-90
                      "
                    >
                      +
                    </span>
                  </div>

                </div>


                {/* ==================================
                    RED ACCENT LINE
                =================================== */}

                <div
                  className="
                    mt-4
                    h-px
                    w-8
                    bg-[#EF3B3A]
                    transition-all
                    duration-500
                    group-hover:w-16
                  "
                />

              </div>

            </article>
          ))}

        </div>

      </div>
    </section>
  );
};

export default FeaturedTechnologies;












// const FeaturedTechnologies = () => {
//   return (
//     <section className="bg-black text-white py-24 md:py-28 overflow-hidden">
//       <div className="max-w-7xl mx-auto px-8">

//         {/* Heading */}
//         <div className="mb-14">

//           <p className="text-blue-500 uppercase tracking-[5px] text-sm font-medium mb-5">
//             Technologies
//           </p>

//           <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
//             Featured Technologies
//           </h2>

//         </div>

//         {/* Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

//           {technologies.map((tech) => (
//             <div
//               key={tech.id}
//               className="
//                 group
//                 relative
//                 h-85
//                 rounded-[24px]
//                 overflow-hidden
//                 bg-zinc-900
//                 border border-white/10
//                 transition-all
//                 duration-500
//                 hover:-translate-y-2
//                 hover:border-white/30
//               "
//             >

//               {/* Image Area */}
//               <div className="absolute inset-0 bg-zinc-800">

//                 {tech.image ? (
//                   <img
//                     src={tech.image}
//                     alt={tech.name}
//                     className="
//                       w-full
//                       h-full
//                       object-cover
//                       transition-transform
//                       duration-700
//                       group-hover:scale-105
//                     "
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center">
//                     <span className="text-zinc-600 text-sm">
//                       Image Placeholder
//                     </span>
//                   </div>
//                 )}

//               </div>

//               {/* Gradient */}
//               <div
//                 className="
//                   absolute
//                   inset-0
//                   bg-linear-to-t
//                   from-black
//                   via-black/50
//                   to-transparent
//                 "
//               />

//               {/* Content */}
//               <div className="absolute bottom-0 left-0 right-0 p-6">

//                 <div className="flex items-end justify-between gap-4">

//                   <h3 className="max-w-[80%] text-xl md:text-2xl font-bold leading-tight">
//                     {tech.name}
//                   </h3>

//                   {/* Plus */}
//                   <div
//                     className="
//                       shrink-0
//                       w-10
//                       h-10
//                       rounded-full
//                       border
//                       border-white/70
//                       flex
//                       items-center
//                       justify-center
//                       text-2xl
//                       font-light
//                       transition-all
//                       duration-300
//                       group-hover:bg-white
//                       group-hover:text-black
//                     "
//                   >
//                     +
//                   </div>

//                 </div>

//               </div>

//             </div>
//           ))}

//         </div>

//       </div>
//     </section>
//   );
// };

// export default FeaturedTechnologies;