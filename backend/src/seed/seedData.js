import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js";
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import Contact from "../models/Contact.js";
import Location from "../models/Location.js";

const seedDatabase = async () => {
  try {
    console.log("Checking database seed status...");

    // =========================================================
    // ADMIN
    // =========================================================

    const adminCount = await Admin.countDocuments();

    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash(
        process.env.SEED_ADMIN_PASSWORD || "Admin@123",
        10
      );

      const admins = [
        {
          email: "admin@proliant.com",
          password: hashedPassword,
        },
        {
          email: "bogachandrapu@gmail.com",
          password: hashedPassword,
        },
      ];

      await Admin.insertMany(admins);

      console.log("✓ 2 Admins seeded");
    } else {
      console.log("→ Admin data already exists. Skipping.");
    }

    // =========================================================
    // EMPLOYEES
    // =========================================================

    const employeeCount = await Employee.countDocuments();

    if (employeeCount === 0) {
      const departments = [
        "SAP",
        "SAP Functional",
        "SAP Technical",
        "Human Resources",
        "Finance",
        "Sales",
        "Operations",
        "Quality Assurance",
        "IT",
        "Business Development",
      ];

      const roles = [
        "SAP MM Consultant",
        "SAP SD Consultant",
        "SAP FICO Consultant",
        "SAP ABAP Developer",
        "SAP Basis Administrator",
        "SAP HCM Consultant",
        "SAP PP Consultant",
        "SAP QM Consultant",
        "SAP SuccessFactors Consultant",
        "SAP Functional Consultant",
        "SAP Technical Consultant",
        "SAP Integration Consultant",
        "SAP Security Consultant",
        "SAP Business Analyst",
        "SAP Project Coordinator",
        "Administration",
      ];

      const firstNames = [
        "Aarav",
        "Aadhya",
        "Aditya",
        "Akash",
        "Ananya",
        "Arjun",
        "Bhavya",
        "Charan",
        "Deepak",
        "Divya",
        "Harsha",
        "Karthik",
        "Keerthi",
        "Manoj",
        "Meghana",
        "Naveen",
        "Nikhil",
        "Pooja",
        "Pranav",
        "Priya",
        "Rahul",
        "Ravi",
        "Rohit",
        "Sanjay",
        "Sneha",
        "Sowmya",
        "Srinivas",
        "Swathi",
        "Varun",
        "Vishal",
      ];

      const employees = [];

      // 101 employees
      for (let i = 1; i <= 101; i++) {
        const firstName = firstNames[(i - 1) % firstNames.length];

        const name = firstName;

        employees.push({
          name,
          email: `employee${i}@proliant.com`,
          role: roles[(i - 1) % roles.length],
          department: departments[(i - 1) % departments.length],
          status: i % 12 === 0 ? "Inactive" : "Active",
        });
      }

      await Employee.insertMany(employees);

      console.log("✓ 101 employees seeded");
    } else {
      console.log("→ Employee data already exists. Skipping.");
    }

    // =========================================================
    // JOBS
    // =========================================================

    const jobCount = await Job.countDocuments();

    if (jobCount === 0) {
      const jobs = [
        {
          title: "SAP MM Consultant",
          department: "SAP Functional",
          employmentType: "Full Time",
          location: "Hyderabad, India",
          experience: "3+ Years",
          status: "Published",
          jobDescription:
            "We are looking for an SAP MM Consultant to support procurement and inventory management processes across SAP S/4HANA implementations.",
          requirements:
            "Strong knowledge of SAP MM, Procure-to-Pay processes, purchasing, inventory management, source determination and SAP S/4HANA.",
        },
        {
          title: "SAP SD Consultant",
          department: "SAP Functional",
          employmentType: "Full Time",
          location: "Hyderabad, India",
          experience: "3+ Years",
          status: "Published",
          jobDescription:
            "Join our SAP team as an SAP SD Consultant and work on Order-to-Cash processes, sales orders, deliveries, billing and pricing.",
          requirements:
            "Experience with SAP SD, Order-to-Cash, sales order processing, outbound delivery, billing, pricing procedures and SAP S/4HANA.",
        },
        {
          title: "SAP FICO Consultant",
          department: "SAP Functional",
          employmentType: "Full Time",
          location: "Bengaluru, India",
          experience: "4+ Years",
          status: "Published",
          jobDescription:
            "We are seeking an SAP FICO Consultant to support financial accounting and controlling processes in SAP S/4HANA environments.",
          requirements:
            "Strong knowledge of SAP FI and CO, general ledger, accounts payable, accounts receivable, asset accounting, cost centers and controlling.",
        },
        {
          title: "SAP ABAP Developer",
          department: "SAP Technical",
          employmentType: "Full Time",
          location: "Hyderabad, India",
          experience: "2+ Years",
          status: "Published",
          jobDescription:
            "Develop and maintain custom SAP solutions using ABAP while working closely with functional consultants and business teams.",
          requirements:
            "Strong knowledge of ABAP, reports, internal tables, Open SQL, BAPIs, user exits, enhancements, debugging and SAP S/4HANA development.",
        },
        {
          title: "SAP Basis Administrator",
          department: "SAP Technical",
          employmentType: "Full Time",
          location: "Pune, India",
          experience: "3+ Years",
          status: "Published",
          jobDescription:
            "Manage SAP technical environments, system monitoring, transports, user administration and SAP system operations.",
          requirements:
            "Experience with SAP Basis administration, system monitoring, transport management, user administration, performance monitoring and database concepts.",
        },
        {
          title: "SAP SuccessFactors Consultant",
          department: "SAP HCM",
          employmentType: "Full Time",
          location: "Bengaluru, India",
          experience: "3+ Years",
          status: "Published",
          jobDescription:
            "Support SAP SuccessFactors implementations and help organizations optimize their human capital management processes.",
          requirements:
            "Knowledge of SAP SuccessFactors modules, employee central, HR processes, configuration and integration concepts.",
        },
        {
          title: "SAP PP Consultant",
          department: "SAP Functional",
          employmentType: "Full Time",
          location: "Hyderabad, India",
          experience: "3+ Years",
          status: "Published",
          jobDescription:
            "Work with manufacturing teams to implement and support SAP Production Planning processes in SAP S/4HANA.",
          requirements:
            "Experience with SAP PP, material requirements planning, production orders, BOMs, work centers and production processes.",
        },
        {
          title: "SAP QM Consultant",
          department: "SAP Functional",
          employmentType: "Full Time",
          location: "Chennai, India",
          experience: "2+ Years",
          status: "Published",
          jobDescription:
            "Support quality management processes and SAP QM implementations for enterprise customers.",
          requirements:
            "Knowledge of SAP QM, inspection planning, inspection lots, quality notifications, results recording and usage decisions.",
        },
        {
          title: "SAP Integration Consultant",
          department: "SAP Technical",
          employmentType: "Contract",
          location: "Pune, India",
          experience: "4+ Years",
          status: "Published",
          jobDescription:
            "Design and support integrations between SAP systems and external enterprise applications.",
          requirements:
            "Experience with SAP integration technologies, APIs, web services, middleware, SAP Integration Suite and integration architecture.",
        },
        {
          title: "SAP Business Analyst",
          department: "Business Development",
          employmentType: "Full Time",
          location: "Hyderabad, India",
          experience: "2+ Years",
          status: "Published",
          jobDescription:
            "Work with business stakeholders to understand requirements and translate them into SAP-based business solutions.",
          requirements:
            "Strong business analysis, requirement gathering, process documentation, stakeholder communication and knowledge of SAP business processes.",
        },
      ];

      await Job.insertMany(jobs);

      console.log("✓ 10 SAP jobs seeded");
    } else {
      console.log("→ Job data already exists. Skipping.");
    }

    // =========================================================
    // CANDIDATES
    // =========================================================

    const candidateCount = await Candidate.countDocuments();

    if (candidateCount === 0) {
      const candidateFirstNames = [
        "Abhishek",
        "Anil",
        "Anusha",
        "Bhargav",
        "Chaitanya",
        "Dinesh",
        "Harini",
        "Kiran",
        "Lakshmi",
        "Lokesh",
        "Madhavi",
        "Mahesh",
        "Nandini",
        "Naveen",
        "Pallavi",
        "Pradeep",
        "Prakash",
        "Rakesh",
        "Sahithi",
        "Sai",
        "Sandeep",
        "Shiva",
        "Shravya",
        "Tejas",
        "Vamsi",
        "Varsha",
        "Venkat",
        "Vijay",
        "Yashwanth",
        "Zoya",
      ];

      const positions = [
        "SAP MM Consultant",
        "SAP SD Consultant",
        "SAP FICO Consultant",
        "SAP ABAP Developer",
        "SAP Basis Administrator",
        "SAP SuccessFactors Consultant",
        "SAP PP Consultant",
        "SAP QM Consultant",
        "SAP Integration Consultant",
        "SAP Business Analyst",
      ];

      const interests = [
        "SAP MM",
        "SAP SD",
        "SAP FICO",
        "SAP ABAP",
        "SAP Basis",
        "SAP SuccessFactors",
        "SAP PP",
        "SAP QM",
        "SAP Integration",
        "SAP Business Analysis",
      ];

      const qualifications = [
        "B.Tech",
        "B.E",
        "M.Tech",
        "MCA",
        "MBA",
        "B.Sc",
      ];

      const locations = [
        "Hyderabad",
        "Bengaluru",
        "Chennai",
        "Pune",
        "Vijayawada",
        "Visakhapatnam",
        "Ongole",
      ];

      const noticePeriods = [
        "Immediately",
        "30 Days",
        "60 Days",
        "90 Days",
      ];

      const candidateStatuses = [
        "New",
        "Shortlisted",
        "Interview",
        "Selected",
        "Rejected",
      ];

      const candidates = [];

      // 55 candidates
      for (let i = 1; i <= 55; i++) {
        const firstName =
          candidateFirstNames[
            (i - 1) % candidateFirstNames.length
          ];

        const isFresher = i % 3 === 0;

        const position =
          positions[(i - 1) % positions.length];

        candidates.push({
          position,

          areaOfInterest:
            interests[(i - 1) % interests.length],

          name: firstName,

          email: `candidate${i}@example.com`,

          phone: `987650${String(i).padStart(4, "0")}`,

          isFresher,

          location:
            locations[(i - 1) % locations.length],

          yearsOfExperience: isFresher
            ? 0
            : ((i - 1) % 6) + 1,

          highestQualification:
            qualifications[
              (i - 1) % qualifications.length
            ],

          currentCompany: isFresher
            ? ""
            : "Previous Employer",

          noticePeriod:
            noticePeriods[
              (i - 1) % noticePeriods.length
            ],

          coverMessage:
            `I am interested in the ${position} position at Proliant and would like to be considered for this opportunity.`,

          resume: `resume-placeholder-${i}.pdf`,

          status:
            candidateStatuses[
              (i - 1) % candidateStatuses.length
            ],
        });
      }

      await Candidate.insertMany(candidates);

      console.log("✓ 55 candidates seeded");
    } else {
      console.log(
        "→ Candidate data already exists. Skipping."
      );
    }

    // =========================================================
    // CONTACT ENQUIRIES
    // =========================================================

    const contactCount = await Contact.countDocuments();

    if (contactCount === 0) {
      const contacts = [
        {
          name: "Rajesh Kumar",
          email: "rajesh.kumar@example.com",
          company: "Tech Solutions Pvt Ltd",
          subject: "SAP Implementation Services",
          message:
            "We would like to discuss SAP implementation and consulting services with Proliant.",
          status: "Unread",
        },
        {
          name: "Priya Sharma",
          email: "priya.sharma@example.com",
          company: "Global Systems",
          subject: "SAP S/4HANA Services",
          message:
            "We are interested in learning more about your SAP S/4HANA services.",
          status: "Read",
        },
        {
          name: "Michael Johnson",
          email: "michael.johnson@example.com",
          company: "Innovate Corp",
          subject: "SAP Consulting",
          message:
            "Please share more information about your SAP consulting capabilities.",
          status: "Unread",
        },
        {
          name: "Sneha Reddy",
          email: "sneha.reddy@example.com",
          company: "Digital Works",
          subject: "SAP Project Discussion",
          message:
            "We would like to schedule a discussion regarding an upcoming SAP project.",
          status: "Read",
        },
        {
          name: "Arjun Rao",
          email: "arjun.rao@example.com",
          company: "NextGen Technologies",
          subject: "SAP Support Services",
          message:
            "Please contact us regarding SAP application support and maintenance services.",
          status: "Unread",
        },
        {
          name: "David Wilson",
          email: "david.wilson@example.com",
          company: "FutureTech Inc",
          subject: "SAP Solutions Enquiry",
          message:
            "We would like to know more about Proliant and the SAP solutions you provide.",
          status: "Read",
        },
      ];

      await Contact.insertMany(contacts);

      console.log("✓ 6 contact enquiries seeded");
    } else {
      console.log(
        "→ Contact data already exists. Skipping."
      );
    }

    // =========================================================
    // LOCATIONS
    // =========================================================

    const locationCount = await Location.countDocuments();

    if (locationCount === 0) {
      const locations = [
        {
          country: "USA",
          state: "Massachusetts",
          city: "Boston",
          companyName: "Proliant Data LLC",
          address: "75 State Street, Boston, MA 01803",
          latitude: 42.35902288181857,
          longitude: -71.0553326746298,
          phone: "+1-617-955-2070",
          email: "hr@proliantdatallc.com",
        },
        {
          country: "Germany",
          state: "Bavaria",
          city: "Erlangen",
          companyName: "Proliant Data GmbH",
          address: "Würzburger Ring 39, Erlangen, 91056",
          latitude: 49.59963951233804,
          longitude: 10.967766810446841,
          phone: "+49-15158005363",
          email: "hr@proliantdatallc.com",
        },
        {
          country: "India",
          state: "Telangana",
          city: "Hyderabad",
          companyName: "Roliant Data Pvt. Ltd.",
          address:
            "Pranava Vaishnoi Business Park, Kothaguda, Telangana, India",
          latitude: 17.46148007233937,
          longitude: 78.36740788019645,
          phone: "+91 8008199903",
          email: "hr@proliantdatallc.com",
        },
        {
          country: "UAE",
          state: "Dubai",
          city: "Dubai",
          companyName: "Proliant Data FZCO",
          address:
            "IFZA Business Park, Dubai, United Arab Emirates",
          latitude: 25.118804862011046,
          longitude: 55.37773192460008,
          phone: "+971 505 185363",
          email: "hr@proliantdatallc.com",
        },
      ];

      await Location.insertMany(locations);

      console.log("✓ 4 locations seeded");
    } else {
      console.log(
        "→ Location data already exists. Skipping."
      );
    }

    console.log("========================================");
    console.log("Database seed check completed");
    console.log("========================================");
  } catch (error) {
    console.error(
      "Database seeding failed:",
      error.message
    );

    throw error;
  }
};

export default seedDatabase;