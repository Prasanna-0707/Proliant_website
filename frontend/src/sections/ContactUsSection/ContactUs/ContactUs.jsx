import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const CareersContact = () => {
  const sectionRef = useRef(null);
  const [submitStatus, setSubmitStatus] = useState("idle");

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".career-contact-title", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".career-contact-intro", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
        opacity: 0,
        x: -30,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".career-contact-form", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
        opacity: 0,
        x: 30,
        duration: 0.8,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const form = e.currentTarget;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  setSubmitStatus("loading");

  try {
    const formData = new FormData(form);

    const firstName = formData.get("firstName")?.trim() || "";
    const lastName = formData.get("lastName")?.trim() || "";
    const email = formData.get("email")?.trim() || "";
    const organisation = formData.get("organisation")?.trim() || "";
    const inquiry = formData.get("inquiry") || "";
    const message = formData.get("message")?.trim() || "";

    const payload = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      company: organisation,
      subject: inquiry,
      message,
    };

    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message ||
        result?.error ||
        "Failed to submit your enquiry."
      );
    }

    setSubmitStatus("success");

    form.reset();

    setTimeout(() => {
      setSubmitStatus("idle");
    }, 2500);
  } catch (error) {
    console.error("Contact enquiry submission error:", error);

    setSubmitStatus("idle");

    alert(
      error.message ||
      "Something went wrong while submitting your enquiry."
    );
  }
};

  const inputClass = `
    w-full
    border-0
    border-b
    border-black/20
    bg-transparent
    px-0
    py-0
    pb-1
    text-sm
    leading-5
    text-black
    outline-none
    transition-all
    duration-300
    placeholder:text-black/25
    focus:border-[#EF3B3A]
  `;

  const labelClass = `
    mb-1
    block
    text-xs
    font-medium
    uppercase
    tracking-[0.15em]
    text-black
  `;

  return (
    <section
      ref={sectionRef}
      id="get-in-touch"
      className="career-contact bg-black px-6 py-12 text-white md:px-12 md:py-14 lg:px-20"
    >
      <div className="mx-auto max-w-7xl">
        {/* SECTION HEADING */}

        <div className="border-b border-white/10 pb-5">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#EF3B3A]">
           
          </p>

          <h2
            className="
              career-contact-title
              text-4xl
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-14">
          {/* LEFT CONTENT */}

          <div className="career-contact-intro lg:pt-3">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#EF3B3A]" />

              <span className="text-xs uppercase tracking-[0.18em] text-white/40">
                Let&apos;s Connect
              </span>
            </div>

            <p className="mt-5 text-2xl font-medium leading-tight tracking-tight md:text-3xl">
              <span className="block whitespace-nowrap">
                Ready to build
              </span>

              <span className="block whitespace-nowrap">
                what&apos;s next{" "}
                <span className="text-[#EF3B3A]">with us?</span>
              </span>
            </p>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/40 md:text-base">
              Tell us a little about yourself, your interests and what you&apos;d
              like to discuss. Our team will get back to you shortly.
            </p>
          </div>

          {/* CONTACT FORM */}

          <form
            onSubmit={handleSubmit}
            className="
              career-contact-form
              rounded-2xl
              border
              border-white/10
              bg-white
              p-5
              text-black
              md:p-6
            "
          >
            {/* FORM HEADER */}

            <div className="mb-5 flex items-start justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-black">
                  Contact
                </p>

                <h3 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
                  Start a conversation.
                </h3>
              </div>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-sm text-white">
                →
              </span>
            </div>

            {/* TYPE OF INQUIRY */}

            <div>
              <label htmlFor="contact-inquiry" className={labelClass}>
                Type of Inquiry *
              </label>

              <select
                id="contact-inquiry"
                name="inquiry"
                required
                defaultValue=""
                className="
                  w-full
                  border-0
                  border-b
                  border-black/20
                  bg-white
                  px-0
                  py-0
                  pb-1
                  text-sm
                  leading-5
                  text-black
                  outline-none
                  transition-all
                  duration-300
                  focus:border-[#EF3B3A]
                "
              >
                <option value="" disabled>
                  Select an enquiry type
                </option>

                <option value="business-enquiries">
                  Business Enquiries / Request For Service
                </option>

                <option value="rfp">Submit an RFP</option>

                <option value="careers">Employment and Careers</option>

                <option value="media">Media Queries</option>

                <option value="marketing">Marketing</option>

                <option value="sales">Sales</option>

                <option value="investor">Investor Information</option>

                <option value="offices">Offices</option>

                <option value="website-feedback">Website Feedback</option>

                <option value="partnerships">Partnerships</option>

                <option value="data-subject-request">
                  Data Privacy: Data Subject Request
                </option>

                <option value="data-grievance">
                  Data Privacy: Data Grievance Request
                </option>

                <option value="others">Others</option>
              </select>
            </div>

            {/* FIRST + LAST NAME */}

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="contact-first-name" className={labelClass}>
                  First Name *
                </label>

                <input
                  id="contact-first-name"
                  name="firstName"
                  type="text"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="contact-last-name" className={labelClass}>
                  Last Name *
                </label>

                <input
                  id="contact-last-name"
                  name="lastName"
                  type="text"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* EMAIL + ORGANISATION */}

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="contact-email" className={labelClass}>
                  Email Address *
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="contact-organisation" className={labelClass}>
                  Organisation
                </label>

                <input
                  id="contact-organisation"
                  name="organisation"
                  type="text"
                  className={inputClass}
                />
              </div>
            </div>

            {/* PHONE */}

            <div className="mt-5">
              <label htmlFor="contact-phone" className={labelClass}>
                Phone Number *
              </label>

              <input
                id="contact-phone"
                name="phone"
                type="tel"
                required
                className={inputClass}
              />
            </div>

            {/* COUNTRY */}

            <div className="mt-5">
              <label htmlFor="contact-country" className={labelClass}>
                Country
              </label>

              <select
                id="contact-country"
                name="country"
                defaultValue=""
                className="
                  w-full
                  border-0
                  border-b
                  border-black/20
                  bg-white
                  px-0
                  py-0
                  pb-1
                  text-sm
                  leading-5
                  text-black
                  outline-none
                  transition-all
                  duration-300
                  focus:border-[#EF3B3A]
                "
              >
                <option value="" disabled>
                  -Select-
                </option>

                <option value="india">India</option>
                <option value="united-states">United States</option>
                <option value="united-kingdom">United Kingdom</option>
                <option value="uae">UAE</option>
                <option value="germany">Germany</option>
                <option value="canada">Canada</option>
                <option value="australia">Australia</option>
                <option value="singapore">Singapore</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* MESSAGE */}

            <div className="mt-5">
              <label htmlFor="contact-message" className={labelClass}>
                Message
              </label>

              <textarea
                id="contact-message"
                name="message"
                rows="2"
                placeholder="Tell us how we can help..."
                className="
                  w-full
                  resize-none
                  border
                  border-black/15
                  bg-transparent
                  px-3
                  py-2
                  text-sm
                  leading-5
                  text-black
                  outline-none
                  placeholder:text-black/25
                  transition-all
                  duration-300
                  focus:border-[#EF3B3A]
                "
              />
            </div>

            {/* SUBMIT */}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xs text-[11px] leading-relaxed text-black/45">
                Share your details and our team will get in touch with you.
              </p>

              <button
                type="submit"
                disabled={
                  submitStatus === "loading" || submitStatus === "success"
                }
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
                "
              >
                {/* NORMAL */}

                {submitStatus === "idle" && (
                  <>
                    <span>Submit</span>

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}

                {/* LOADING */}

                {submitStatus === "loading" && (
                  <>
                    <span>Sending</span>

                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                      "
                    />
                  </>
                )}

                {/* SUCCESS */}

                {submitStatus === "success" && (
                  <>
                    <span>Submitted</span>

                    <span
                      className="
                        flex
                        h-5
                        w-5
                        items-center
                        justify-center
                        rounded-full
                        bg-[#EF3B3A]
                        text-sm
                        font-bold
                        leading-none
                        text-white
                      "
                    >
                      ✓
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CareersContact;