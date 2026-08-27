const WhatWeDo = () => {
  return (
<section className="bg-white py-16 text-black md:py-20">
      {/* MASK2 BUTTON ANIMATION */}
<style>{`
        .whatwedo-mask2-button {
          position: relative;
          width: 190px;
          height: 46px;
          border: 1px solid rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          cursor: pointer;
        }
 
        .whatwedo-mask2-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background: black;
 
          -webkit-mask-image: url("https://raw.githubusercontent.com/robin-dela/css-mask-animation/master/img/nature-sprite.png");
          mask-image: url("https://raw.githubusercontent.com/robin-dela/css-mask-animation/master/img/nature-sprite.png");
 
          -webkit-mask-size: 2300% 100%;
          mask-size: 2300% 100%;
 
          -webkit-mask-position: 100% 0;
          mask-position: 100% 0;
 
          animation: whatWeDoMaskOut 0.7s steps(22) forwards;
        }
 
        .whatwedo-mask2-button:hover::before {
          animation: whatWeDoMaskIn 0.7s steps(22) forwards;
        }
 
        @keyframes whatWeDoMaskIn {
          from {
            -webkit-mask-position: 100% 0;
            mask-position: 100% 0;
          }
 
          to {
            -webkit-mask-position: 0 0;
            mask-position: 0 0;
          }
        }
 
        @keyframes whatWeDoMaskOut {
          from {
            -webkit-mask-position: 0 0;
            mask-position: 0 0;
          }
 
          to {
            -webkit-mask-position: 100% 0;
            mask-position: 100% 0;
          }
        }
 
        .whatwedo-mask2-text {
          position: relative;
          z-index: 2;
          color: black;
          transition: color 0.3s ease;
        }
 
        .whatwedo-mask2-button:hover .whatwedo-mask2-text {
          color: white;
        }
 
        .whatwedo-mask2-arrow {
          position: relative;
          z-index: 2;
          margin-left: 14px;
          color: black;
          transition: color 0.3s ease, transform 0.3s ease;
        }
 
        .whatwedo-mask2-button:hover .whatwedo-mask2-arrow {
          color: white;
          transform: translateX(5px);
        }
      `}</style>
 
      <div className="mx-auto max-w-7xl px-8">
        {/* Section Label */}
<div className="mb-4">
<p className="text-blue-600 text-xs font-medium uppercase tracking-[4px] md:text-sm">
            What We Do
</p>
</div>
 
        {/* Divider */}
<div className="mb-8 border-t border-black/10" />
 
        {/* Description */}
<div className="max-w-4xl">
<p className="text-base leading-7 text-neutral-600 md:text-lg">
            Proliant Data accelerates data and digital transformation by
            delivering innovative, tailored solutions in enterprise data
            management, migration, governance, and analytics to unlock the
            full potential of your data.
</p>
</div>
 
        {/* READ MORE - MASK2 ANIMATION */}
<div className="mt-8">
<a
            href="/what-we-do"
            className="whatwedo-mask2-button"
>
<span className="whatwedo-mask2-text">
              READ MORE
</span>
 
            <span className="whatwedo-mask2-arrow">
              →
</span>
</a>
</div>
</div>
</section>
  );
};
 
export default WhatWeDo;