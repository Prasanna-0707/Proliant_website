import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ContactUs = () => {
  const sectionRef = useRef(null);

  // SEND MESSAGE BUTTON STATE
  const [submitStatus, setSubmitStatus] = useState("idle");

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Keep animations lighter on smaller screens
      const isMobile = window.matchMedia(
        "(max-width: 767px)"
      ).matches;

      gsap.from(".career-contact-title", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: isMobile ? 25 : 40,
        duration: isMobile ? 0.6 : 0.8,
        ease: "power3.out",
      });

      gsap.from(".career-contact-intro", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
        opacity: 0,
        x: isMobile ? -15 : -30,
        duration: isMobile ? 0.6 : 0.8,
        ease: "power3.out",
      });

      gsap.from(".career-contact-form", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
        opacity: 0,
        x: isMobile ? 15 : 30,
        duration: isMobile ? 0.6 : 0.8,
        ease: "power3.out",
      });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // SEND MESSAGE CLICK HANDLER
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    setSubmitStatus("loading");

    setTimeout(() => {
      setSubmitStatus("success");

      setTimeout(() => {
        setSubmitStatus("idle");
      }, 2000);
    }, 2000);
  };

  return (
    <section
      ref={sectionRef}
      id="get-in-touch"
      className="
        career-contact
        bg-black
        px-5
        pt-16
        pb-12
        text-white
        sm:px-6
        sm:pt-18
        sm:pb-14
        md:px-12
        md:py-20
        lg:px-20
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* SECTION HEADING */}

        <div
          className="
            border-b
            border-white/10
            pb-5
            sm:pb-6
          "
        >
          <p
            className="
              mb-2
              text-xs
              uppercase
              tracking-[0.2em]
              text-[#EF3B3A]
            "
          >
            Contact
          </p>

          <h2
            className="
              career-contact-title
              text-[clamp(1.875rem,7vw,3.75rem)]
              font-medium
              leading-none
              tracking-tight
              md:text-5xl
              lg:text-6xl
            "
          >
            Get in Touch
          </h2>
        </div>

        {/* MAIN CONTENT */}

        <div
          className="
            mt-4
            grid
            gap-8
            sm:mt-5
            sm:gap-10
            lg:mt-8
            lg:grid-cols-[0.65fr_1.35fr]
            lg:gap-16
          "
        >

          {/* LEFT CONTENT */}

          <div className="career-contact-intro lg:pt-4">

            <p
              className="
                mt-0
                text-[1.5rem]
                font-medium
                leading-tight
                tracking-tight
                sm:text-2xl
                md:text-3xl
              "
            >
              <span className="block sm:whitespace-nowrap">
                Ready to build
              </span>

              <span className="block sm:whitespace-nowrap">
                what&apos;s next{" "}
                <span className="text-[#EF3B3A]">
                  with us?
                </span>
              </span>
            </p>

            <p
              className="
                mt-5
                max-w-sm
                text-sm
                leading-relaxed
                text-white/40
                sm:mt-6
                md:text-base
              "
            >
              Tell us a little about yourself, your interests and the kind of
              opportunities you&apos;re looking for.
            </p>

          </div>

          {/* APPLICATION FORM */}

          <form
            onSubmit={handleSubmit}
            className="
              career-contact-form
              rounded-2xl
              border
              border-white/10
              bg-[#F7F7F5]
              p-5
              text-black
              sm:p-6
              md:p-8
            "
          >

            {/* FORM HEADER */}

            <div
              className="
                mb-6
                flex
                items-start
                justify-between
                gap-4
                sm:mb-8
                sm:gap-5
              "
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-black">
                  Careers
                </p>

                <h3 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">
                  Start your journey.
                </h3>
              </div>

              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-black
                  text-sm
                  text-white
                  sm:h-9
                  sm:w-9
                "
              >
                →
              </span>
            </div>

            {/* FIRST + LAST NAME */}

            <div className="grid gap-5 md:grid-cols-2 md:gap-6">

              <div>
                <label
                  htmlFor="career-first-name"
                  className="
                    mb-2
                    block
                    text-xs
                    uppercase
                    tracking-[0.15em]
                    text-black
                  "
                >
                  First Name *
                </label>

                <input
                  id="career-first-name"
                  name="firstName"
                  type="text"
                  required
                  className="
                    w-full
                    border-0
                    border-b
                    border-black/15
                    bg-transparent
                    px-0
                    pb-0
                    pt-1
                    text-sm
                    leading-none
                    outline-none
                    transition-all
                    duration-300
                    focus:border-[#EF3B3A]
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="career-last-name"
                  className="
                    mb-2
                    block
                    text-xs
                    uppercase
                    tracking-[0.15em]
                    text-black
                  "
                >
                  Last Name *
                </label>

                <input
                  id="career-last-name"
                  name="lastName"
                  type="text"
                  required
                  className="
                    w-full
                    border-0
                    border-b
                    border-black/15
                    bg-transparent
                    px-0
                    pb-0
                    pt-1
                    text-sm
                    leading-none
                    outline-none
                    transition-all
                    duration-300
                    focus:border-[#EF3B3A]
                  "
                />
              </div>

            </div>

            {/* EMAIL */}

            <div className="mt-5 sm:mt-6">

              <label
                htmlFor="career-email"
                className="
                  mb-2
                  block
                  text-xs
                  uppercase
                  tracking-[0.15em]
                  text-black
                "
              >
                Email *
              </label>

              <input
                id="career-email"
                name="email"
                type="email"
                required
                className="
                  w-full
                  border-0
                  border-b
                  border-black/15
                  bg-transparent
                  px-0
                  pb-0
                  pt-1
                  text-sm
                  leading-none
                  outline-none
                  transition-all
                  duration-300
                  focus:border-[#EF3B3A]
                "
              />

            </div>

            {/* ORGANIZATION */}

            <div className="mt-5 sm:mt-6">

              <label
                htmlFor="career-organization"
                className="
                  mb-2
                  block
                  text-xs
                  uppercase
                  tracking-[0.15em]
                  text-black
                "
              >
                Organization
              </label>

              <input
                id="career-organization"
                name="organization"
                type="text"
                className="
                  w-full
                  border-0
                  border-b
                  border-black/15
                  bg-transparent
                  px-0
                  pb-0
                  pt-1
                  text-sm
                  leading-none
                  outline-none
                  transition-all
                  duration-300
                  focus:border-[#EF3B3A]
                "
              />

            </div>

            {/* TYPE OF INQUIRY */}

            <div className="mt-5 sm:mt-6">

              <label
                htmlFor="career-inquiry"
                className="
                  mb-2
                  block
                  text-xs
                  uppercase
                  tracking-[0.15em]
                  text-black
                "
              >
                Type of Inquiry *
              </label>

              <input
                id="career-inquiry"
                name="inquiryType"
                type="text"
                required
                className="
                  w-full
                  border-0
                  border-b
                  border-black/15
                  bg-transparent
                  px-0
                  pb-0
                  pt-1
                  text-sm
                  leading-none
                  outline-none
                  transition-all
                  duration-300
                  focus:border-[#EF3B3A]
                "
              />

            </div>

            {/* MESSAGE */}

            <div className="mt-5 sm:mt-6">

              <label
                htmlFor="career-message"
                className="
                  mb-2
                  block
                  text-xs
                  uppercase
                  tracking-[0.15em]
                  text-black
                "
              >
                Message
              </label>

              <textarea
                id="career-message"
                name="message"
                rows="4"
                placeholder="Write your message here"
                className="
                  w-full
                  resize-none
                  border-0
                  border-b
                  border-black/15
                  bg-transparent
                  px-0
                  pb-0
                  pt-1
                  text-sm
                  leading-none
                  outline-none
                  placeholder:text-black/25
                  transition-all
                  duration-300
                  focus:border-[#EF3B3A]
                "
              />

            </div>

            {/* SUBMIT */}

            <div
              className="
                mt-6
                flex
                flex-col
                gap-4
                sm:mt-8
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <p
                className="
                  max-w-xs
                  text-[11px]
                  leading-relaxed
                  text-black
                "
              >
                Share your details and our team will get in touch with you.
              </p>

              <button
                type="submit"
                disabled={submitStatus === "loading"}
                className="
                  group
                  inline-flex
                  min-w-48
                  shrink-0
                  items-center
                  justify-center
                  gap-3
                  rounded-full
                  bg-black
                  px-6
                  py-3
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-white
                  transition-all
                  duration-300
                  hover:bg-[#EF3B3A]
                  disabled:cursor-not-allowed
                  sm:py-3.5
                "
              >

                {submitStatus === "idle" && (
                  <>
                    <span>Send Message</span>

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}

                {submitStatus === "loading" && (
                  <span
                    className="
                      h-5
                      w-5
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />
                )}

                {submitStatus === "success" && (
                  <span className="text-xl leading-none">
                    ✓
                  </span>
                )}

              </button>

            </div>

          </form>

        </div>

      </div>
    </section>
  );
};

export default ContactUs;