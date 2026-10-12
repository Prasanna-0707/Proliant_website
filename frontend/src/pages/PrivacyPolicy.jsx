
import Footer from "@/components/common/Footer";

const privacySections = [
  {
    title: "Introduction",
    content:
      "Proliant Data LLC and its applicable affiliates (Proliant Data, we, us, or our) respect your privacy and are committed to protecting personal information. This Privacy Policy explains how we may collect, use, disclose, and protect information when you visit our website, contact us, or apply for career opportunities.",
  },
  {
    title: "Information We Collect",
    content:
      "Depending on how you interact with our website, we may collect contact information such as your name, email address, phone number, and company name; career information such as your resume, employment history, and qualifications; messages you send us; and technical information such as your IP address, browser type, device information, and pages visited, where collected.",
  },
  {
    title: "How We Use Information",
    content:
      "We may use personal information to respond to inquiries, evaluate job applications, provide information about our services, operate and improve our website, analyze website performance where applicable, address security concerns, prevent fraud, and comply with applicable legal obligations.",
  },
  {
    title: "Cookies and Similar Technologies",
    content:
      "Our website may use cookies and similar technologies to support website functionality, understand usage patterns, and improve user experience. Where required, consent will be requested before using non-essential cookies. You may manage cookies through your browser settings or available website preferences.",
  },
  {
    title: "How We Share Information",
    content:
      "We may share information where appropriate and lawful with service providers supporting website hosting, maintenance, analytics, communications, or recruitment; relevant Proliant Data affiliates; professional advisers; regulators or public authorities where required by law; and other parties where necessary to protect rights, safety, or security.",
  },
  {
    title: "Data Retention",
    content:
      "We retain personal information only for as long as reasonably necessary for the purposes described in this Policy, including responding to inquiries, managing recruitment, fulfilling legal obligations, resolving disputes, and enforcing agreements. Retention periods may vary depending on the information and applicable legal requirements.",
  },
  {
    title: "Data Security",
    content:
      "We use reasonable technical and organizational measures designed to protect personal information against unauthorized access, loss, misuse, alteration, or disclosure. However, no method of electronic transmission or storage can be guaranteed to be completely secure. Please avoid submitting highly sensitive information through general website contact forms.",
  },
  {
    title: "International Data Transfers",
    content:
      "Proliant Data operates through entities in different jurisdictions. Depending on your interaction with us, personal information may be transferred to or accessed from other countries. Where applicable, we will take appropriate steps to ensure that international transfers comply with relevant data-protection requirements.",
  },
  {
    title: "Your Privacy Rights",
    content:
      "Depending on your location and applicable law, you may have rights to request access to, correction of, or deletion of certain personal information; object to or restrict certain processing; withdraw consent where processing relies on consent; request a portable copy of information where applicable; and lodge a complaint with a relevant data-protection authority. We may need to verify your identity before responding.",
  },
  {
    title: "Third-Party Websites",
    content:
      "Our website may contain links to third-party websites or services. We do not control their privacy practices or content. When visiting those websites, please review their respective privacy policies.",
  },
  {
    title: "Children's Privacy",
    content:
      "Our website is intended for a general business audience and is not directed toward children. We do not knowingly collect personal information from children in violation of applicable law. If you believe a child has provided personal information to us unlawfully, please contact us.",
  },
  {
    title: "Changes to This Privacy Policy",
    content:
      "We may update this Privacy Policy to reflect changes in our practices, services, technology, or legal obligations. Updates will be published on this page with a revised effective date. Please review this page periodically.",
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <section className="relative overflow-hidden bg-[#101010] px-6 pb-12 pt-28 text-white sm:px-10 sm:pb-14 sm:pt-32 lg:px-16 lg:pb-16 lg:pt-36">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#EF3B3A]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#EF3B3A]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#EF3B3A] sm:text-sm">
            Proliant Data LLC
          </p>

          <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Privacy
            <br />
            <span className="text-white/35">Policy</span>
          </h1>

          <div className="mt-6 border-l-2 border-[#EF3B3A] pl-5">
            <p className="text-sm text-white/65 sm:text-base">
              Effective Date: October 12, 2026
            </p>
          </div>
        </div>
      </section>

      <main className="bg-white px-6 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 border-b border-black/10 pb-4">
            <p className="text-base leading-[1.6] text-black/65 sm:text-lg">
              This Privacy Policy explains how Proliant Data may collect, use,
              disclose, and protect personal information when you use our
              website and related online services.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {privacySections.map((section) => (
              <section
                key={section.title}
                className="border-b border-black/10 pb-3 last:border-b-0 sm:pb-4"
              >
                <h2 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
                  {section.title}
                </h2>

                <p className="mt-1.5 text-base leading-[1.6] text-black/60 sm:text-lg">
                  {section.content}
                </p>
              </section>
            ))}

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
                Contact Us
              </h2>

              <p className="mt-1.5 text-base leading-[1.6] text-black/60 sm:text-lg">
                For privacy-related questions or requests, contact us at
                info@proliantdatallc.com or use the contact details below.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                  <h3 className="font-semibold">Proliant Data LLC, USA</h3>
                  <p className="mt-1.5 text-sm leading-6 text-black/60">
                    75 State Street, Boston, MA 01803, USA
                    <br />
                    Phone: +1-617-955-2070
                  </p>
                </div>

                <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                  <h3 className="font-semibold">Proliant Data GmbH, Germany</h3>
                  <p className="mt-1.5 text-sm leading-6 text-black/60">
                    Würzburger Ring 39, Erlangen, 91056, Germany
                    <br />
                    Phone: +49-15158005363
                  </p>
                </div>

                <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                  <h3 className="font-semibold">
                    Proliant Data Pvt. Ltd., India
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-black/60">
                    Pranava Vaishnoi Business Park, Kothaguda, Telangana, India
                    <br />
                    Phone: +91 80008199903
                  </p>
                </div>

                <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                  <h3 className="font-semibold">Proliant Data FZCO, UAE</h3>
                  <p className="mt-1.5 text-sm leading-6 text-black/60">
                    IFZA Business Park, Dubai, United Arab Emirates
                    <br />
                    Phone: +971 505 185363
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm text-black/60">
                Email: info@proliantdatallc.com
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
