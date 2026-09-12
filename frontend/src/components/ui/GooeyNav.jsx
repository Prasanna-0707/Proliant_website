import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 1, 1, 1, 1, 1, 1, 1],
  initialActiveIndex = -1,
}) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const textRef = useRef(null);

  /*
   * Button states
   *
   * 0 = BLACK
   * 1 = WHITE
   * 2 = RED
   */
  const [buttonState, setButtonState] =
    useState(0);

  /*
   * Proliant muted red.
   */
  const RED_COLOR = "#B23A3A";

  const noise = (n = 1) =>
    n / 2 - Math.random() * n;

  const getXY = (
    distance,
    pointIndex,
    totalPoints,
  ) => {
    const angle =
      ((360 + noise(8)) / totalPoints) *
      pointIndex *
      (Math.PI / 180);

    return [
      distance * Math.cos(angle),
      distance * Math.sin(angle),
    ];
  };

  const createParticle = (
    i,
    t,
    d,
    r,
  ) => {
    const rotate = noise(r / 10);

    return {
      start: getXY(
        d[0],
        particleCount - i,
        particleCount,
      ),

      end: getXY(
        d[1] + noise(7),
        particleCount - i,
        particleCount,
      ),

      time: t,

      scale: 1 + noise(0.2),

      color:
        colors[
          Math.floor(
            Math.random() *
              colors.length,
          )
        ],

      rotate:
        rotate > 0
          ? (rotate + r / 20) * 10
          : (rotate - r / 20) * 10,
    };
  };

  /*
   * Create particles for every state transition.
   */
  const makeParticles = (
    element,
    targetState,
  ) => {
    const d = particleDistances;
    const r = particleR;

    const bubbleTime =
      animationTime * 2 +
      timeVariance;

    element.style.setProperty(
      "--time",
      `${bubbleTime}ms`,
    );

    /*
     * Particle colors
     *
     * BLACK → white particles
     * WHITE → white particles
     * RED   → muted red particles
     */
    // let particleColor = "white";

    // if (targetState === 0) {
    //   // RED → BLACK
    //   particleColor = "black";
    // }

    // if (targetState === 1) {
    //   // BLACK → WHITE
    //   particleColor = "white";
    // }

    // if (targetState === 2) {
    //   // WHITE → RED
    //   particleColor = RED_COLOR;
    // }

    let particleColor = "white";

    if (targetState === 0) {
      // RED → BLACK
      particleColor = "white";
    }

    if (targetState === 1) {
      // BLACK → WHITE
      particleColor = "white";
    }

    if (targetState === 2) {
      // WHITE → RED
      particleColor = RED_COLOR;
    }

    for (
      let i = 0;
      i < particleCount;
      i++
    ) {
      const t =
        animationTime * 2 +
        noise(timeVariance * 2);

      const p = createParticle(
        i,
        t,
        d,
        r,
      );

      setTimeout(() => {
        const particle =
          document.createElement(
            "span",
          );

        const point =
          document.createElement(
            "span",
          );

        particle.classList.add(
          "particle",
        );

        particle.style.setProperty(
          "--start-x",
          `${p.start[0]}px`,
        );

        particle.style.setProperty(
          "--start-y",
          `${p.start[1]}px`,
        );

        particle.style.setProperty(
          "--end-x",
          `${p.end[0]}px`,
        );

        particle.style.setProperty(
          "--end-y",
          `${p.end[1]}px`,
        );

        particle.style.setProperty(
          "--time",
          `${p.time}ms`,
        );

        particle.style.setProperty(
          "--scale",
          `${p.scale}`,
        );

        particle.style.setProperty(
          "--color",
          particleColor,
        );

        particle.style.setProperty(
          "--rotate",
          `${p.rotate}deg`,
        );

        point.classList.add(
          "point",
        );

        particle.appendChild(
          point,
        );

        element.appendChild(
          particle,
        );

        requestAnimationFrame(() => {
          element.classList.add(
            "active",
          );
        });

        setTimeout(() => {
          try {
            element.removeChild(
              particle,
            );
          } catch {
            // Particle already removed
          }
        }, t);
      }, 30);
    }
  };

  /*
   * Position the animated pill exactly
   * over the Contact button.
   */
  const updateEffectPosition = (
    element,
  ) => {
    if (
      !containerRef.current ||
      !filterRef.current ||
      !textRef.current
    ) {
      return;
    }

    const containerRect =
      containerRef.current.getBoundingClientRect();

    const pos =
      element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };

    Object.assign(
      filterRef.current.style,
      styles,
    );

    Object.assign(
      textRef.current.style,
      styles,
    );

    textRef.current.innerText =
      element.innerText;
  };
  const handleClick = (
        e,
        index,
      ) => {
          e.preventDefault();
        const liEl =
          e.currentTarget;

        updateEffectPosition(
          liEl,
        );

        /*
        * Calculate next state.
        *
        * 0 → 1
        * 1 → 2
        * 2 → 0
        */
        const nextState =
          (buttonState + 1) % 3;

        /*
        * Remove old particles.
        */
        if (filterRef.current) {
          const particles =
            filterRef.current.querySelectorAll(
              ".particle",
            );

          particles.forEach(
            (particle) =>
              particle.remove(),
          );
        }

        /*
        * Reset the previous pill state.
        */
        if (filterRef.current) {
          filterRef.current.classList.remove(
            "active",
            "black",
            "white",
            "red",
          );

          /*
          * Force browser reflow so
          * animation restarts every click.
          */
          void filterRef.current
            .offsetWidth;

          /*
          * Add the destination state.
          */
          if (nextState === 0) {
            filterRef.current.classList.add(
              "black",
            );
          }

          if (nextState === 1) {
            filterRef.current.classList.add(
              "white",
            );
          }

          if (nextState === 2) {
            filterRef.current.classList.add(
              "red",
            );
          }

          /*
          * IMPORTANT:
          *
          * Animation happens for ALL
          * three transitions.
          */
          filterRef.current.classList.add(
            "active",
          );

          makeParticles(
            filterRef.current,
            nextState,
          );
        }

        /*
        * Text color
        *
        * BLACK → white text
        * WHITE → black text
        * RED   → white text
        */
        if (textRef.current) {
          textRef.current.classList.remove(
            "active",
            "red-text",
          );

          void textRef.current
            .offsetWidth;

          /*
          * WHITE background
          * → BLACK text
          */
          if (nextState === 1) {
            textRef.current.classList.add(
              "active",
            );
          }

          /*
          * RED background
          * → WHITE text
          */
          if (nextState === 2) {
            textRef.current.classList.add(
              "red-text",
            );
          }
        }

        /*
        * Update current state.
        */
        setButtonState(
          nextState,
        );

        /*
        * Navigate after the Gooey animation
        * has had time to play.
        */
      const target = items[index]?.href;

      if (target) {
        setTimeout(() => {
          navigate(target);
        }, animationTime);
      }

      };

  /*
   * Keyboard accessibility.
   */
  const handleKeyDown = (
    e,
    index,
  ) => {
    if (
      e.key === "Enter" ||
      e.key === " "
    ) {
      e.preventDefault();

      const liEl =
        e.currentTarget
          .parentElement;

      if (liEl) {
        handleClick(
          {
            preventDefault: () => {},
            currentTarget: liEl,
          },
          index,
        );
      }
    }
  };

  /*
   * Keep animated pill aligned
   * when window/container resizes.
   */
  useEffect(() => {
    if (
      !navRef.current ||
      !containerRef.current
    ) {
      return;
    }

    const currentLi =
      navRef.current.querySelector(
        "li",
      );

    if (currentLi) {
      updateEffectPosition(
        currentLi,
      );
    }

    const resizeObserver =
      new ResizeObserver(() => {
        const li =
          navRef.current?.querySelector(
            "li",
          );

        if (li) {
          updateEffectPosition(
            li,
          );
        }
      });

    resizeObserver.observe(
      containerRef.current,
    );

    return () =>
      resizeObserver.disconnect();
  }, []);

  return (
    <>
      <style>
        {`
          /*
           * MAIN CONTAINER
           */
          .gooey-contact-container {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          /*
           * NAV
           */
          .gooey-contact-nav {
            position: relative;
            display: flex;
            align-items: center;
            transform:
              translate3d(
                0,
                0,
                0.01px
              );
          }

          /*
           * LIST
           */
          .gooey-contact-list {
            display: flex;
            align-items: center;
            list-style: none;
            margin: 0;
            padding: 0;
            position: relative;
            z-index: 3;
          }

          /*
           * BASE BUTTON
           *
           * BLACK
           */
          .gooey-contact-list li {
            position: relative;
            cursor: pointer;
            border-radius: 9999px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            color: white;
            background: black;

            transition:
              color 0.3s ease,
              background-color 0.3s ease;
          }

          /*
           * BUTTON LINK
           */
          .gooey-contact-list li a {
            display: inline-block;

            padding:
              0.6em
              1.1em;

            outline: none;

            color: inherit;

            text-decoration: none;
          }

          /*
           * EFFECT LAYER
           */
          .gooey-effect {
            position: absolute;

            pointer-events: none;

            display: grid;
            place-items: center;

            z-index: 1;
          }

          /*
           * EFFECT TEXT
           *
           * Default:
           * WHITE
           */
          .gooey-effect.text {
            color: white;

            transition:
              color 0.3s ease;
          }

          /*
           * WHITE BACKGROUND
           *
           * BLACK TEXT
           */
          .gooey-effect.text.active {
            color: black;
          }

          /*
           * RED BACKGROUND
           *
           * WHITE TEXT
           */
          .gooey-effect.text.red-text {
            color: white;
          }

          /*
           * GOOEY FILTER
           */
          .gooey-effect.filter {
            filter:
              blur(7px)
              contrast(100)
              blur(0);
          }

          /*
           * ANIMATED PILL
           */
          .gooey-effect.filter::after {
            content: "";

            position: absolute;

            inset: 0;

            transform:
              scale(0);

            opacity: 0;

            z-index: -1;

            border-radius:
              9999px;
          }

          /*
           * BLACK
           */
          .gooey-effect.filter.black::after {
            background: black;
          }

          /*
           * WHITE
           */
          .gooey-effect.filter.white::after {
            background: white;
          }

          /*
           * MUTED RED
           */
          .gooey-effect.filter.red::after {
            background: #B23A3A;
          }

          /*
           * EVERY STATE ANIMATES
           */
          .gooey-effect.filter.active::after {
            animation:
              gooey-pill
              0.3s
              ease
              both;
          }

          /*
           * PILL REVEAL
           */
          @keyframes gooey-pill {
            to {
              transform:
                scale(1);

              opacity: 1;
            }
          }

          /*
           * PARTICLE BASE
           */
          .gooey-contact-container
            .particle,
          .gooey-contact-container
            .point {
            display: block;

            opacity: 0;

            width: 20px;
            height: 20px;

            border-radius:
              9999px;

            transform-origin:
              center;
          }

          /*
           * PARTICLE
           */
          .gooey-contact-container
            .particle {
            --time: 5s;

            position: absolute;

            top:
              calc(50% - 8px);

            left:
              calc(50% - 8px);

            animation:
              gooey-particle
              var(--time)
              ease
              1
              -350ms;
          }

          /*
           * PARTICLE POINT
           */
          .gooey-contact-container
            .point {
            background:
              var(--color);

            opacity: 1;

            animation:
              gooey-point
              var(--time)
              ease
              1
              -350ms;
          }

          /*
           * PARTICLE MOVEMENT
           */
          @keyframes gooey-particle {
            0% {
              transform:
                rotate(0deg)
                translate(
                  var(--start-x),
                  var(--start-y)
                );

              opacity: 1;

              animation-timing-function:
                cubic-bezier(
                  0.55,
                  0,
                  1,
                  0.45
                );
            }

            70% {
              transform:
                rotate(
                  calc(
                    var(--rotate)
                    * 0.5
                  )
                )
                translate(
                  calc(
                    var(--end-x)
                    * 1.2
                  ),
                  calc(
                    var(--end-y)
                    * 1.2
                  )
                );

              opacity: 1;

              animation-timing-function:
                ease;
            }

            85% {
              transform:
                rotate(
                  calc(
                    var(--rotate)
                    * 0.66
                  )
                )
                translate(
                  var(--end-x),
                  var(--end-y)
                );

              opacity: 1;
            }

            100% {
              transform:
                rotate(
                  calc(
                    var(--rotate)
                    * 1.2
                  )
                )
                translate(
                  calc(
                    var(--end-x)
                    * 0.5
                  ),
                  calc(
                    var(--end-y)
                    * 0.5
                  )
                );

              opacity: 1;
            }
          }

          /*
           * PARTICLE SCALE
           */
          @keyframes gooey-point {
            0% {
              transform:
                scale(0);

              opacity: 0;

              animation-timing-function:
                cubic-bezier(
                  0.55,
                  0,
                  1,
                  0.45
                );
            }

            25% {
              transform:
                scale(
                  calc(
                    var(--scale)
                    * 0.25
                  )
                );
            }

            38% {
              opacity: 1;
            }

            65% {
              transform:
                scale(
                  var(--scale)
                );

              opacity: 1;

              animation-timing-function:
                ease;
            }

            85% {
              transform:
                scale(
                  var(--scale)
                );

              opacity: 1;
            }

            100% {
              transform:
                scale(0);

              opacity: 0;
            }
          }
        `}
      </style>

      <div
        className="gooey-contact-container"
        ref={containerRef}
      >
        <nav
          className="gooey-contact-nav"
          ref={navRef}
        >
          <ul className="gooey-contact-list">
            {items.map(
              (item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    onClick={(e) =>
                      handleClick(
                        e,
                        index,
                      )
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(
                        e,
                        index,
                      )
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>

        <span
          className="gooey-effect filter"
          ref={filterRef}
        />

        <span
          className="gooey-effect text"
          ref={textRef}
        />
      </div>
    </>
  );
};

export default GooeyNav;