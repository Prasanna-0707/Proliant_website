import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import RamSir from "@/assets/images/WhoweAre/Ram sir.jpeg";
import VamshiSir from "@/assets/images/WhoweAre/Vamshi sir.jpg";
import KiranSir from "@/assets/images/WhoweAre/Kiran sir.png";

gsap.registerPlugin(ScrollTrigger);

const leaders = [
  {
    id: 1,
    name: "Vamshi Polam",
    role: "CEO",
    image: VamshiSir,
  },
  {
    id: 2,
    name: "Ram Bolla",
    role: "Managing Director",
    image: RamSir,
  },
  {
    id: 3,
    name: "Kiran Reddy",
    role: "Director",
    image: KiranSir,
  },
];

const Leadership = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* =====================================================
         HEADING ANIMATION
      ===================================================== */

      gsap.from(".leaders-label", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".leaders-heading-line", {
        opacity: 0,
        y: 55,
        filter: "blur(8px)",
        duration: 0.9,
        stagger: 0.12,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".leaders-description", {
        opacity: 0,
        y: 25,
        duration: 0.8,
        delay: 0.25,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      /* =====================================================
         LEADER CARDS
      ===================================================== */

      gsap.utils.toArray(".leader-card").forEach((card, index) => {
        const image = card.querySelector(".leader-image");
        const glow = card.querySelector(".leader-glow");
        const content = card.querySelector(".leader-content");
        const name = card.querySelector(".leader-name");
        const line = card.querySelector(".leader-line");
        const highlight = card.querySelector(".leader-highlight");

        /* ===================================================
           CARD ENTRANCE
        =================================================== */

        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: index * 0.12,
            ease: "power4.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );

        /* ===================================================
           IMAGE ENTRANCE
        =================================================== */

        gsap.fromTo(
          image,
          {
            scale: 1.08,
          },
          {
            scale: 1,
            duration: 1.2,
            delay: index * 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );

        /* ===================================================
           CONTENT ENTRANCE
        =================================================== */

        gsap.fromTo(
          content,
          {
            opacity: 0,
            y: 25,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.25 + index * 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );

        /* ===================================================
           HOVER
        =================================================== */

        const handleEnter = () => {
          /* Dim other cards */

          gsap.to(".leader-card", {
            opacity: 0.55,
            scale: 0.985,
            duration: 0.4,
            ease: "power2.out",
          });

          /* Highlight current card */

          gsap.to(card, {
            opacity: 1,
            scale: 1.02,
            y: -8,
            duration: 0.45,
            ease: "power3.out",
          });

          /* Image zoom */

          gsap.to(image, {
            scale: 1.07,
            duration: 0.8,
            ease: "power3.out",
          });

          /* Red glow */

          gsap.to(glow, {
            opacity: 1,
            scale: 1.1,
            duration: 0.5,
            ease: "power2.out",
          });

          /* Highlight border */

          gsap.to(highlight, {
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
          });

          /* Content */

          gsap.to(content, {
            y: -5,
            duration: 0.45,
            ease: "power3.out",
          });

          /* Name */

          gsap.to(name, {
            x: 8,
            duration: 0.45,
            ease: "power3.out",
          });

          /* Bottom line */

          gsap.to(line, {
            width: "100%",
            duration: 0.55,
            ease: "power3.out",
          });
        };

        /* ===================================================
           LEAVE
        =================================================== */

        const handleLeave = () => {
          gsap.to(".leader-card", {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
          });

          gsap.to(card, {
            y: 0,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(image, {
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
          });

          gsap.to(glow, {
            opacity: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          });

          gsap.to(highlight, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.out",
          });

          gsap.to(content, {
            y: 0,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(name, {
            x: 0,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(line, {
            width: "0%",
            duration: 0.45,
            ease: "power3.out",
          });
        };

        card.addEventListener("mouseenter", handleEnter);
        card.addEventListener("mouseleave", handleLeave);

        card._handleEnter = handleEnter;
        card._handleLeave = handleLeave;
      });
    }, sectionRef);

    return () => {
      gsap.utils.toArray(".leader-card").forEach((card) => {
        if (card._handleEnter) {
          card.removeEventListener(
            "mouseenter",
            card._handleEnter
          );
        }

        if (card._handleLeave) {
          card.removeEventListener(
            "mouseleave",
            card._handleLeave
          );
        }
      });

      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="leaders"
      className="
        leaders-section
        bg-white
        px-8
        py-12
        text-black
        md:px-16
        md:py-16
        lg:px-24
        lg:py-20
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADING
        ================================================== */}

        <div className="leaders-intro pb-7">

          <p
            className="
              leaders-label
              text-base
              font-bold
              uppercase
              tracking-widest
              text-[#EF3B3A]
            "
          >
            Leadership
          </p>

          <h2
            className="
              mt-3
              text-[clamp(1.875rem,7vw,3.75rem)]
              font-semibold
              leading-none
              tracking-tight
              md:text-5xl
              lg:text-7xl
            "
          >
            <span className="leaders-heading-line inline-block">
              The people behind{" "}
            </span>

            <span className="leaders-heading-line inline-block text-black/25">
              Proliant.
            </span>
          </h2>

          <div className="leaders-description mt-3 max-w-3xl">
            <p
              className="
                text-sm
                leading-relaxed
                text-black/50
                md:text-base
              "
            >
              Leadership that combines enterprise experience,
              technology expertise, and a vision for intelligent
              transformation.
            </p>
          </div>

        </div>


        {/* =================================================
            LEADER CARDS
        ================================================== */}

        <div
          className="
            leaders-grid
            mt-3
            grid
            gap-4
            md:grid-cols-3
          "
        >

          {leaders.map((leader) => (
            <article
              key={leader.id}
              className="
                leader-card
                group
                relative
                aspect-square
                overflow-hidden
                bg-black
                transition-transform
                duration-500
                ease-out
              "
            >

              {/* ==========================================
                  IMAGE
              =========================================== */}

              <div
                className="
                  leader-image
                  absolute
                  inset-0
                  overflow-hidden
                  bg-neutral-950
                "
              >

                <img
                  src={leader.image}
                  alt={leader.name}
                  className="
                    h-full
                    w-full
                    object-cover
                    object-center
                  "
                />

              </div>


              {/* ==========================================
                  DARK GRADIENT
              =========================================== */}

              <div
                className="
                  absolute
                  inset-0
                  bg-linear-to-t
                  from-black
                  via-black/30
                  to-transparent
                  opacity-80
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                "
              />


              {/* ==========================================
                  RED AMBIENT GLOW
              =========================================== */}

              <div
                className="
                  leader-glow
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-48
                  w-48
                  rounded-full
                  bg-[#EF3B3A]/20
                  opacity-0
                  blur-3xl
                "
              />


              {/* ==========================================
                  CARD HIGHLIGHT
              =========================================== */}

              <div
                className="
                  leader-highlight
                  pointer-events-none
                  absolute
                  inset-0
                  border
                  border-[#EF3B3A]/60
                  opacity-0
                "
              />


              {/* ==========================================
                  RED ACCENT
              =========================================== */}

              <div
                className="
                  leader-line
                  absolute
                  bottom-0
                  left-0
                  h-1
                  w-0
                  bg-[#EF3B3A]
                "
              />


              {/* ==========================================
                  CONTENT
              =========================================== */}

              <div
                className="
                  leader-content
                  absolute
                  bottom-0
                  left-0
                  right-0
                  p-5
                  text-white
                  md:p-6
                "
              >

                <p
                  className="
                    text-base
                    font-bold
                    uppercase
                    tracking-widest
                    text-[#EF3B3A]
                  "
                >
                  {leader.role}
                </p>

                <h3
                  className="
                    leader-name
                    mt-2
                    text-xl
                    font-semibold
                    tracking-tight
                    md:text-2xl
                  "
                >
                  {leader.name}
                </h3>

                <div
                  className="
                    mt-3
                    h-px
                    w-7
                    bg-[#EF3B3A]
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

export default Leadership;



// import { useLayoutEffect, useRef } from "react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// import RamSir from "@/assets/images/WhoweAre/Ram sir.jpeg"
// import VamshiSir from "@/assets/images/WhoweAre/Vamshi sir.jpeg"
// import KiramSir from "@/assets/images/WhoweAre/Kiran sir.jpeg"

// gsap.registerPlugin(ScrollTrigger);

// const Leadership = () => {
//   const sectionRef = useRef(null);

//   useLayoutEffect(() => {
//     const ctx = gsap.context(() => {
//       /* =====================================================
//          HEADING ANIMATION
//       ===================================================== */

//       gsap.from(".leaders-label", {
//         opacity: 0,
//         y: 20,
//         duration: 0.6,
//         ease: "power3.out",
//         scrollTrigger: {
//           trigger: sectionRef.current,
//           start: "top 78%",
//           toggleActions: "play none none reverse",
//         },
//       });

//       gsap.from(".leaders-heading-line", {
//         opacity: 0,
//         y: 55,
//         filter: "blur(8px)",
//         duration: 0.9,
//         stagger: 0.12,
//         ease: "power4.out",
//         scrollTrigger: {
//           trigger: sectionRef.current,
//           start: "top 75%",
//           toggleActions: "play none none reverse",
//         },
//       });

//       gsap.from(".leaders-description", {
//         opacity: 0,
//         y: 25,
//         duration: 0.8,
//         delay: 0.25,
//         ease: "power3.out",
//         scrollTrigger: {
//           trigger: sectionRef.current,
//           start: "top 70%",
//           toggleActions: "play none none reverse",
//         },
//       });

//       /* =====================================================
//          LEADER CARDS
//       ===================================================== */

//       gsap.utils.toArray(".leader-card").forEach((card, index) => {
//         const image = card.querySelector(".leader-image");
//         const glow = card.querySelector(".leader-glow");
//         const content = card.querySelector(".leader-content");
//         const name = card.querySelector(".leader-name");
//         const line = card.querySelector(".leader-line");
//         const highlight = card.querySelector(".leader-highlight");

//         /* ===================================================
//            CARD ENTRANCE
//         =================================================== */

//         gsap.fromTo(
//           card,
//           {
//             opacity: 0,
//             y: 50,
//           },
//           {
//             opacity: 1,
//             y: 0,
//             duration: 0.9,
//             delay: index * 0.12,
//             ease: "power4.out",
//             scrollTrigger: {
//               trigger: card,
//               start: "top 88%",
//               toggleActions: "play none none reverse",
//             },
//           }
//         );

//         /* ===================================================
//            IMAGE ENTRANCE
//         =================================================== */

//         gsap.fromTo(
//           image,
//           {
//             scale: 1.08,
//           },
//           {
//             scale: 1,
//             duration: 1.2,
//             delay: index * 0.12,
//             ease: "power3.out",
//             scrollTrigger: {
//               trigger: card,
//               start: "top 88%",
//               toggleActions: "play none none reverse",
//             },
//           }
//         );

//         /* ===================================================
//            CONTENT ENTRANCE
//         =================================================== */

//         gsap.fromTo(
//           content,
//           {
//             opacity: 0,
//             y: 25,
//           },
//           {
//             opacity: 1,
//             y: 0,
//             duration: 0.8,
//             delay: 0.25 + index * 0.12,
//             ease: "power3.out",
//             scrollTrigger: {
//               trigger: card,
//               start: "top 88%",
//               toggleActions: "play none none reverse",
//             },
//           }
//         );

//         /* ===================================================
//            HOVER
//         =================================================== */

//         const handleEnter = () => {
//           /* Dim other cards */

//           gsap.to(".leader-card", {
//             opacity: 0.55,
//             scale: 0.985,
//             duration: 0.4,
//             ease: "power2.out",
//           });

//           /* Highlight current card */

//           gsap.to(card, {
//             opacity: 1,
//             scale: 1.02,
//             y: -8,
//             duration: 0.45,
//             ease: "power3.out",
//           });

//           /* Image zoom */

//           gsap.to(image, {
//             scale: 1.07,
//             duration: 0.8,
//             ease: "power3.out",
//           });

//           /* Red glow */

//           gsap.to(glow, {
//             opacity: 1,
//             scale: 1.1,
//             duration: 0.5,
//             ease: "power2.out",
//           });

//           /* Highlight border */

//           gsap.to(highlight, {
//             opacity: 1,
//             duration: 0.35,
//             ease: "power2.out",
//           });

//           /* Content */

//           gsap.to(content, {
//             y: -5,
//             duration: 0.45,
//             ease: "power3.out",
//           });

//           /* Name */

//           gsap.to(name, {
//             x: 8,
//             duration: 0.45,
//             ease: "power3.out",
//           });

//           /* Bottom line */

//           gsap.to(line, {
//             width: "100%",
//             duration: 0.55,
//             ease: "power3.out",
//           });
//         };

//         /* ===================================================
//            LEAVE
//         =================================================== */

//         const handleLeave = () => {
//           gsap.to(".leader-card", {
//             opacity: 1,
//             scale: 1,
//             duration: 0.4,
//             ease: "power2.out",
//           });

//           gsap.to(card, {
//             y: 0,
//             duration: 0.45,
//             ease: "power3.out",
//           });

//           gsap.to(image, {
//             scale: 1,
//             duration: 0.7,
//             ease: "power3.out",
//           });

//           gsap.to(glow, {
//             opacity: 0,
//             scale: 1,
//             duration: 0.5,
//             ease: "power2.out",
//           });

//           gsap.to(highlight, {
//             opacity: 0,
//             duration: 0.35,
//             ease: "power2.out",
//           });

//           gsap.to(content, {
//             y: 0,
//             duration: 0.45,
//             ease: "power3.out",
//           });

//           gsap.to(name, {
//             x: 0,
//             duration: 0.45,
//             ease: "power3.out",
//           });

//           gsap.to(line, {
//             width: "0%",
//             duration: 0.45,
//             ease: "power3.out",
//           });
//         };

//         card.addEventListener("mouseenter", handleEnter);
//         card.addEventListener("mouseleave", handleLeave);

//         card._handleEnter = handleEnter;
//         card._handleLeave = handleLeave;
//       });
//     }, sectionRef);

//     return () => {
//       gsap.utils.toArray(".leader-card").forEach((card) => {
//         if (card._handleEnter) {
//           card.removeEventListener(
//             "mouseenter",
//             card._handleEnter
//           );
//         }

//         if (card._handleLeave) {
//           card.removeEventListener(
//             "mouseleave",
//             card._handleLeave
//           );
//         }
//       });

//       ctx.revert();
//     };
//   }, []);

//   return (
//     <section
//       ref={sectionRef}
//       id="leaders"
//       className="
//         leaders-section
//         bg-white
//         px-8
//         py-12
//         text-black
//         md:px-16
//         md:py-16
//         lg:px-24
//         lg:py-20
//       "
//     >
//       <div className="mx-auto max-w-7xl">

//         {/* =================================================
//             HEADING
//         ================================================== */}

//         <div className="leaders-intro pb-7">

//           <p
//             className="
//               leaders-label
//               text-xs
//               font-medium
//               uppercase
//               tracking-widest
//               text-[#EF3B3A]
//             "
//           >
//             Leadership
//           </p>

//           <h2
//             className="
//               mt-3
//               text-4xl
//               font-semibold
//               leading-none
//               tracking-tight
//               md:text-5xl
//               lg:text-7xl
//             "
//           >
//             <span className="leaders-heading-line inline-block">
//               The people behind{" "}
//             </span>

//             <span className="leaders-heading-line inline-block text-black/25">
//               Proliant.
//             </span>
//           </h2>

//           <div className="leaders-description mt-3 max-w-3xl">
//             <p
//               className="
//                 text-sm
//                 leading-relaxed
//                 text-black/50
//                 md:text-base
//               "
//             >
//               Leadership that combines enterprise experience,
//               technology expertise, and a vision for intelligent
//               transformation.
//             </p>
//           </div>

//         </div>


//         {/* =================================================
//             LEADER CARDS
//         ================================================== */}

//         <div
//           className="
//             leaders-grid
//             mt-3
//             grid
//             gap-4
//             md:grid-cols-3
//           "
//         >

//           {[1, 2, 3].map((item) => (
//             <article
//               key={item}
//               className="
//                 leader-card
//                 group
//                 relative
//                 aspect-square
//                 overflow-hidden
//                 bg-black
//                 transition-transform
//                 duration-500
//                 ease-out
//               "
//             >

//               {/* ==========================================
//                   IMAGE / PLACEHOLDER
//               =========================================== */}

//               <div
//                 className="
//                   leader-image
//                   absolute
//                   inset-0
//                   flex
//                   items-center
//                   justify-center
//                   bg-neutral-950
//                 "
//               >
//                 <span
//                   className="
//                     text-xs
//                     uppercase
//                     tracking-widest
//                     text-white/15
//                   "
//                 >
//                   Leadership
//                 </span>
//               </div>


//               {/* ==========================================
//                   DARK GRADIENT
//               =========================================== */}

//               <div
//                 className="
//                   absolute
//                   inset-0
//                   bg-linear-to-t
//                   from-black
//                   via-black/30
//                   to-transparent
//                   opacity-80
//                   transition-opacity
//                   duration-500
//                   group-hover:opacity-100
//                 "
//               />


//               {/* ==========================================
//                   RED AMBIENT GLOW
//               =========================================== */}

//               <div
//                 className="
//                   leader-glow
//                   pointer-events-none
//                   absolute
//                   -right-16
//                   -top-16
//                   h-48
//                   w-48
//                   rounded-full
//                   bg-[#EF3B3A]/20
//                   opacity-0
//                   blur-3xl
//                 "
//               />


//               {/* ==========================================
//                   CARD HIGHLIGHT
//               =========================================== */}

//               <div
//                 className="
//                   leader-highlight
//                   pointer-events-none
//                   absolute
//                   inset-0
//                   border
//                   border-[#EF3B3A]/60
//                   opacity-0
//                 "
//               />


//               {/* ==========================================
//                   RED ACCENT
//               =========================================== */}

//               <div
//                 className="
//                   absolute
//                   bottom-0
//                   left-0
//                   h-1
//                   w-0
//                   bg-[#EF3B3A]
//                 "
//               />

//               {/* ==========================================
//                   CONTENT
//               =========================================== */}

//               <div
//                 className="
//                   leader-content
//                   absolute
//                   bottom-0
//                   left-0
//                   right-0
//                   p-5
//                   text-white
//                   md:p-6
//                 "
//               >

//                 <p
//                   className="
//                     text-xs
//                     font-medium
//                     uppercase
//                     tracking-widest
//                     text-[#EF3B3A]
//                   "
//                 >
//                   Leadership {item}
//                 </p>

//                 <h3
//                   className="
//                     leader-name
//                     mt-2
//                     text-xl
//                     font-semibold
//                     tracking-tight
//                     md:text-2xl
//                   "
//                 >
//                   Name to be added
//                 </h3>

//                 <div
//                   className="
//                     mt-3
//                     h-px
//                     w-7
//                     bg-[#EF3B3A]
//                   "
//                 />

//               </div>

//             </article>
//           ))}

//         </div>

//       </div>
//     </section>
//   );
// };

// export default Leadership;