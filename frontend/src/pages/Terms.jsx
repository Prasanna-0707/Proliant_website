
import Footer from "@/components/common/Footer";

const termsSections = [
  {
    title: "About Proliant Data",
    content:
      "Proliant Data provides data and digital transformation services, including enterprise data management, data migration, data governance, analytics and reporting, cutover management, application management services, database and server administration, AI-powered innovation, and related technology and talent services. The Website provides general information about our company, capabilities, technologies, industries, careers, and contact opportunities.",
  },
  {
    title: "Acceptance and Eligibility",
    content:
      "By using the Website, you confirm that you are legally capable of entering into these Terms under the laws applicable to you. If you do not agree with these Terms, you should not use the Website. Where you use the Website on behalf of an organization, you represent that you have authority to bind that organization to these Terms.",
  },
  {
    title: "Website Use",
    content:
      "You may use the Website only for lawful purposes and in accordance with these Terms. You agree not to misuse the Website, attempt to gain unauthorized access to systems or information, interfere with Website operation, introduce malicious code, scrape or systematically extract content without authorization, impersonate another person or entity, or use the Website to violate applicable law.",
  },
  {
    title: "Intellectual Property",
    content:
      "Unless otherwise stated, the Website and its contents—including text, logos, trademarks, graphics, photographs, videos, designs, software, page layouts, and other materials—are owned by or licensed to Proliant Data and are protected by applicable intellectual property laws. Nothing in these Terms grants you ownership of or a license to Proliant Data’s intellectual property except the limited right to access and use the Website for its intended purpose. You may not reproduce, modify, distribute, publish, transmit, sell, create derivative works from, or commercially exploit Website content without prior written permission, except where permitted by applicable law.",
  },
  {
    title: "Trademarks",
    content:
      "“Proliant Data” and related names, logos, service names, and marks may be trademarks or service marks of Proliant Data or its affiliates. Third-party names, logos, products, and trademarks appearing on the Website belong to their respective owners. No right to use any trademark is granted by these Terms.",
  },
  {
    title: "Website Information and No Professional Advice",
    content:
      "Website content is provided for general informational purposes. It is not intended to constitute legal, financial, tax, investment, cybersecurity, professional, or other specialized advice, and it does not create a consulting, professional services, employment, agency, partnership, or other contractual relationship unless a separate written agreement has been executed by the relevant parties. Specific services are subject to applicable proposals, statements of work, contracts, or other written agreements.",
  },
  {
    title: "Accuracy and Availability",
    content:
      "We seek to keep Website information accurate and current, but we do not warrant that all information is complete, accurate, current, uninterrupted, or error-free. We may change, suspend, withdraw, or update any part of the Website at any time without notice. Website content should not be relied upon as a substitute for information contained in a signed agreement or other authoritative business documentation.",
  },
  {
    title: "Third-Party Websites and Services",
    content:
      "The Website may contain links to third-party websites, platforms, or services. These links are provided for convenience and do not necessarily constitute an endorsement. Proliant Data does not control and is not responsible for the availability, content, security, privacy practices, or accuracy of third-party websites or services. Your use of third-party websites is subject to their own terms and policies.",
  },
  {
    title: "User Submissions and Contact Forms",
    content:
      "If you submit information through a contact form, inquiry form, career application, or other Website feature, you represent that the information is accurate, lawful, and that you have the right to provide it. You should not submit confidential, proprietary, trade-secret, or sensitive information through a general Website form unless Proliant Data has expressly requested it through an appropriate secure process. Submission of information does not by itself create a client, employment, consulting, or other business relationship.",
  },
  {
    title: "Careers and Recruitment",
    content:
      "Career opportunities displayed on the Website are for informational purposes and may change or be withdrawn without notice. Submitting an application does not guarantee an interview, offer, employment, or engagement. Recruitment and employment decisions are subject to applicable law and Proliant Data’s internal processes.",
  },
  {
    title: "Confidentiality",
    content:
      "Unless expressly agreed in a separate written confidentiality agreement, information submitted through publicly accessible Website forms should not be considered confidential. Proliant Data may use submitted information as reasonably necessary to respond to inquiries, evaluate opportunities, operate the Website, comply with legal obligations, and protect its rights.",
  },
  {
    title: "Privacy",
    content:
      "Personal information collected through the Website is handled in accordance with Proliant Data’s Privacy Policy and applicable privacy and data-protection laws. These Terms should be read together with the Website’s Privacy Policy. Where the Privacy Policy provides specific rules concerning personal information, those rules will apply to such processing.",
  },
  {
    title: "Disclaimer of Warranties",
    content:
      "To the fullest extent permitted by applicable law, the Website and its content are provided on an “as is” and “as available” basis. Proliant Data disclaims warranties and representations, express or implied, regarding the Website, including warranties of accuracy, availability, merchantability, fitness for a particular purpose, title, and non-infringement, except to the extent such disclaimers are prohibited by law.",
  },
  {
    title: "Limitation of Liability",
    content:
      "To the fullest extent permitted by applicable law, Proliant Data and its affiliates, officers, directors, employees, agents, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of profits, revenue, business opportunities, data, goodwill, or business interruption arising from or related to your use of or inability to use the Website. Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited.",
  },
  {
    title: "Indemnification",
    content:
      "To the extent permitted by applicable law, you agree to defend, indemnify, and hold harmless Proliant Data and its affiliates, officers, directors, employees, agents, and service providers from claims, losses, liabilities, damages, costs, and expenses arising from your unlawful use of the Website, your violation of these Terms, or your infringement of another party’s rights.",
  },
  {
    title: "Security",
    content:
      "While Proliant Data takes reasonable measures to support Website security, no Internet transmission or electronic storage system can be guaranteed to be completely secure. You acknowledge that use of the Website and transmission of information over the Internet involves inherent risks.",
  },
  {
    title: "Governing Law and Jurisdiction",
    content:
      "These Terms shall be governed by and interpreted in accordance with the laws applicable to the Proliant Data entity responsible for the relevant Website activity, without regard to conflict-of-law principles, unless applicable law requires otherwise. Any dispute concerning these Terms or the Website shall be subject to the jurisdiction of courts having lawful jurisdiction over the matter. Where permitted by applicable law and applicable contractual arrangements, Proliant Data may seek relief in the jurisdiction where the relevant entity is established or where the dispute arose.",
  },
  {
    title: "Changes to These Terms",
    content:
      "Proliant Data may update these Terms from time to time to reflect changes in the Website, services, business practices, or legal requirements. Updated Terms will be posted on the Website with a revised effective date. Your continued use of the Website after an update constitutes acceptance of the revised Terms, to the extent permitted by law.",
  },
  {
    title: "Severability",
    content:
      "If any provision of these Terms is determined to be invalid, unlawful, or unenforceable, that provision will be limited or removed to the minimum extent necessary, and the remaining provisions will continue in effect.",
  },
  {
    title: "No Waiver",
    content:
      "Failure by Proliant Data to enforce any provision of these Terms does not constitute a waiver of its right to enforce that provision later.",
  },
  {
    title: "Entire Agreement",
    content:
      "These Terms, together with any policies expressly incorporated by reference, constitute the agreement governing your use of the Website and supersede prior understandings relating specifically to Website use, except where a separate written agreement applies to a particular service or relationship.",
  },
];

const contactEntities = [
  {
    name: "Proliant Data LLC, USA",
    address: "75 State Street, Boston, MA 01803, USA",
    phone: "+1-617-955-2070",
  },
  {
    name: "Proliant Data GmbH, Germany",
    address: "Würzburger Ring 39, Erlangen, 91056, Germany",
    phone: "+49-15158005363",
  },
  {
    name: "Proliant Data Pvt. Ltd., India",
    address: "Pranava Vaishnoi Business Park, Kothaguda, Telangana, India",
    phone: "+91 80008199903",
  },
  {
    name: "Proliant Data FZCO, UAE",
    address: "IFZA Business Park, Dubai, United Arab Emirates",
    phone: "+971 505 185363",
  },
];

const Terms = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#101010] px-6 pb-12 pt-28 text-white sm:px-10 sm:pb-14 sm:pt-32 lg:px-16 lg:pb-16 lg:pt-36">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#EF3B3A]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#EF3B3A]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#EF3B3A] sm:text-sm">
            Proliant Data LLC
          </p>

          <h1 className="max-w-5xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Terms
            <br />
            <span className="text-white/35">& Conditions</span>
          </h1>

          <div className="mt-6 flex flex-col gap-2 border-l-2 border-[#EF3B3A] pl-5 sm:flex-row sm:items-center sm:gap-8">
            <p className="text-sm text-white/65 sm:text-base">
              Website Terms and Conditions
            </p>

            <span className="hidden h-1 w-1 rounded-full bg-[#EF3B3A] sm:block" />

            <p className="text-sm text-white/65 sm:text-base">
              Effective Date: September 10, 2026
            </p>
          </div>
        </div>
      </section>

      {/* TERMS CONTENT */}
      <main className="bg-white px-6 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 border-b border-black/10 pb-4">
            <p className="text-base leading-[1.6] text-black/65 sm:text-lg">
              These Terms and Conditions (“Terms”) govern your access to and use
              of the Proliant Data website (“Website”) operated by Proliant Data
              LLC and its applicable affiliates (“Proliant Data,” “we,” “us,” or
              “our”). By accessing, browsing, or using the Website, you
              acknowledge that you have read, understood, and agree to be bound
              by these Terms.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {termsSections.map((section) => (
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

            {/* CONTACT INFORMATION */}
            <section>
              <h2 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
                Contact Information
              </h2>

              <p className="mt-1.5 text-base leading-[1.6] text-black/60 sm:text-lg">
                For questions regarding these Terms, please contact Proliant
                Data at info@proliantdatallc.com.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {contactEntities.map((entity) => (
                  <div
                    key={entity.name}
                    className="rounded-xl border border-black/10 bg-black/[0.02] p-4"
                  >
                    <h3 className="font-semibold text-black">
                      {entity.name}
                    </h3>

                    <p className="mt-1.5 text-sm leading-6 text-black/60">
                      {entity.address}
                      <br />
                      Phone: {entity.phone}
                      <br />
                      Email: info@proliantdatallc.com
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
