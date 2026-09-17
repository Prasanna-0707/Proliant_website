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

      await Admin.create({
        email: "bogachandrapu@gmail.com",
        password: hashedPassword,
      });

      console.log("✓ Admin seeded");
    } else {
      console.log("→ Admin data already exists. Skipping.");
    }

    // =========================================================
    // EMPLOYEES
    // =========================================================

    const employeeCount = await Employee.countDocuments();

    if (employeeCount === 0) {
      const departments = [
        "Engineering",
        "Human Resources",
        "Finance",
        "Sales",
        "Marketing",
        "Operations",
        "Quality Assurance",
        "IT",
        "Business Development",
        "Administration",
      ];

      const roles = [
        "Software Engineer",
        "Senior Software Engineer",
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "HR Executive",
        "HR Manager",
        "Finance Executive",
        "Business Analyst",
        "Project Coordinator",
        "QA Engineer",
        "DevOps Engineer",
        "UI/UX Designer",
        "Sales Executive",
        "Marketing Executive",
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
        const name = `${firstName} ${i}`;

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
          title: "Frontend Developer",
          department: "Engineering",
          employmentType: "Full Time",
          location: "Hyderabad, India",
          status: "Published",
          jobDescription:
            "We are looking for a frontend developer to build responsive and modern web applications.",
          requirements:
            "Strong knowledge of HTML, CSS, JavaScript and React.js.",
        },
        {
          title: "Backend Developer",
          department: "Engineering",
          employmentType: "Full Time",
          location: "Hyderabad, India",
          status: "Published",
          jobDescription:
            "Develop scalable backend services and REST APIs for enterprise applications.",
          requirements:
            "Experience with Node.js, Express.js, MongoDB and REST APIs.",
        },
        {
          title: "Full Stack Developer",
          department: "Engineering",
          employmentType: "Full Time",
          location: "Bengaluru, India",
          status: "Published",
          jobDescription:
            "Work across frontend and backend technologies to deliver complete web solutions.",
          requirements:
            "Experience with React, Node.js, Express and MongoDB.",
        },
        {
          title: "QA Engineer",
          department: "Quality Assurance",
          employmentType: "Full Time",
          location: "Hyderabad, India",
          status: "Published",
          jobDescription:
            "Design and execute test cases to ensure software quality and reliability.",
          requirements:
            "Knowledge of manual testing, API testing and automation concepts.",
        },
        {
          title: "UI/UX Designer",
          department: "Design",
          employmentType: "Full Time",
          location: "Chennai, India",
          status: "Published",
          jobDescription:
            "Create intuitive and engaging user experiences for digital products.",
          requirements:
            "Strong knowledge of Figma, UI design principles and user research.",
        },
        {
          title: "HR Executive",
          department: "Human Resources",
          employmentType: "Full Time",
          location: "Hyderabad, India",
          status: "Published",
          jobDescription:
            "Support recruitment, employee engagement and HR operations.",
          requirements:
            "Good communication skills and knowledge of HR processes.",
        },
        {
          title: "Business Analyst",
          department: "Business Development",
          employmentType: "Full Time",
          location: "Bengaluru, India",
          status: "Published",
          jobDescription:
            "Analyze business requirements and translate them into actionable solutions.",
          requirements:
            "Analytical thinking, documentation and stakeholder communication skills.",
        },
        {
          title: "DevOps Engineer",
          department: "IT",
          employmentType: "Contract",
          location: "Pune, India",
          status: "Published",
          jobDescription:
            "Manage deployment pipelines, infrastructure and application reliability.",
          requirements:
            "Knowledge of CI/CD, Docker, Linux and cloud platforms.",
        },
        {
          title: "Marketing Executive",
          department: "Marketing",
          employmentType: "Full Time",
          location: "Chennai, India",
          status: "Draft",
          jobDescription:
            "Support digital marketing campaigns and brand communication activities.",
          requirements:
            "Knowledge of digital marketing, social media and content creation.",
        },
        {
          title: "Software Engineer Intern",
          department: "Engineering",
          employmentType: "Internship",
          location: "Hyderabad, India",
          status: "Published",
          jobDescription:
            "Join our engineering team and gain practical experience working on software projects.",
          requirements:
            "Basic programming knowledge and willingness to learn modern web technologies.",
        },
      ];

      await Job.insertMany(jobs);

      console.log("✓ 10 jobs seeded");
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
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "QA Engineer",
        "UI/UX Designer",
        "HR Executive",
        "Business Analyst",
      ];

      const interests = [
        "Web Development",
        "Software Engineering",
        "UI/UX Design",
        "Quality Assurance",
        "Human Resources",
        "Business Analysis",
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
          candidateFirstNames[(i - 1) % candidateFirstNames.length];

        const isFresher = i % 3 === 0;

        candidates.push({
          position: positions[(i - 1) % positions.length],

          areaOfInterest:
            interests[(i - 1) % interests.length],

          name: `${firstName} Candidate ${i}`,

          email: `candidate${i}@example.com`,

          phone: `987650${String(i).padStart(4, "0")}`,

          isFresher,

          location: locations[(i - 1) % locations.length],

          yearsOfExperience: isFresher
            ? 0
            : ((i - 1) % 6) + 1,

          highestQualification:
            qualifications[(i - 1) % qualifications.length],

          currentCompany: isFresher
            ? ""
            : `Previous Company ${i}`,

          noticePeriod:
            noticePeriods[(i - 1) % noticePeriods.length],

          coverMessage:
            `I am interested in the ${
              positions[(i - 1) % positions.length]
            } position at Proliant and would like to be considered for this opportunity.`,

          resume: `resume-placeholder-${i}.pdf`,

          status:
            candidateStatuses[(i - 1) % candidateStatuses.length],
        });
      }

      await Candidate.insertMany(candidates);

      console.log("✓ 55 candidates seeded");
    } else {
      console.log("→ Candidate data already exists. Skipping.");
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
          subject: "Business Partnership",
          message:
            "We would like to discuss a potential business partnership with Proliant.",
          status: "Unread",
        },
        {
          name: "Priya Sharma",
          email: "priya.sharma@example.com",
          company: "Global Systems",
          subject: "Technology Services",
          message:
            "We are interested in learning more about your technology services.",
          status: "Read",
        },
        {
          name: "Michael Johnson",
          email: "michael.johnson@example.com",
          company: "Innovate Corp",
          subject: "Enterprise Solutions",
          message:
            "Please share more information about your enterprise technology solutions.",
          status: "Unread",
        },
        {
          name: "Sneha Reddy",
          email: "sneha.reddy@example.com",
          company: "Digital Works",
          subject: "Project Discussion",
          message:
            "We would like to schedule a discussion regarding an upcoming project.",
          status: "Read",
        },
        {
          name: "Arjun Rao",
          email: "arjun.rao@example.com",
          company: "NextGen Technologies",
          subject: "Service Enquiry",
          message:
            "Please contact us regarding your software development services.",
          status: "Unread",
        },
        {
          name: "David Wilson",
          email: "david.wilson@example.com",
          company: "FutureTech Inc",
          subject: "General Enquiry",
          message:
            "We would like to know more about Proliant and the services you provide.",
          status: "Read",
        },
      ];

      await Contact.insertMany(contacts);

      console.log("✓ 6 contact enquiries seeded");
    } else {
      console.log("→ Contact data already exists. Skipping.");
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
      console.log("→ Location data already exists. Skipping.");
    }

    console.log("========================================");
    console.log("Database seed check completed");
    console.log("========================================");
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    throw error;
  }
};

export default seedDatabase;