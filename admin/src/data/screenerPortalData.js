export const SCREENER_STORAGE_KEY = "l0ScreenerApplications";

export const SCREENING_STATUS = {
  ASSIGNED: "ASSIGNED_TO_L0",
  IN_PROGRESS: "L0_IN_PROGRESS",
  SHORTLISTED: "L0_SHORTLISTED",
  REJECTED: "L0_REJECTED",
  ON_HOLD: "L0_ON_HOLD",
  HR_REVIEW: "HR_REVIEW_REQUIRED",
  L1_PENDING: "L1_PENDING",
};

export const initialScreenerApplications = [
  {
    id: "APP-1001",
    candidateName: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "9876543210",
    jobTitle: "React Developer",
    experience: "3 years",
    appliedDate: "2026-10-28",
    assignedTo: "Current Screener",
    status: SCREENING_STATUS.ASSIGNED,
    resumeUrl: "",
    skills: ["React", "JavaScript", "HTML", "CSS"],
    requiredSkills: ["React", "JavaScript", "HTML", "CSS"],
    education: "B.Tech",
    requiredEducation: "B.Tech or equivalent",
    noticePeriod: "30 days",
    remarks: "",
    rejectionReason: "",
    history: [
      {
        action: "Application received",
        by: "System",
        date: "2026-10-28T09:00:00.000Z",
      },
      {
        action: "Automatically assigned to L0 Screener",
        by: "System",
        date: "2026-10-28T09:05:00.000Z",
      },
    ],
  },
  {
    id: "APP-1002",
    candidateName: "Priya Reddy",
    email: "priya.reddy@example.com",
    phone: "9876543211",
    jobTitle: "Node.js Developer",
    experience: "2 years",
    appliedDate: "2026-10-27",
    assignedTo: "Current Screener",
    status: SCREENING_STATUS.IN_PROGRESS,
    resumeUrl: "",
    skills: ["Node.js", "Express", "MongoDB", "JavaScript"],
    requiredSkills: ["Node.js", "Express", "MongoDB"],
    education: "B.Sc Computer Science",
    requiredEducation: "Bachelor's degree",
    noticePeriod: "Immediate",
    remarks: "",
    rejectionReason: "",
    history: [
      {
        action: "Application received",
        by: "System",
        date: "2026-10-27T09:00:00.000Z",
      },
      {
        action: "Automatically assigned to L0 Screener",
        by: "System",
        date: "2026-10-27T09:10:00.000Z",
      },
      {
        action: "Screening started",
        by: "Current Screener",
        date: "2026-10-27T10:00:00.000Z",
      },
    ],
  },
  {
    id: "APP-1003",
    candidateName: "Kiran Kumar",
    email: "kiran.kumar@example.com",
    phone: "9876543212",
    jobTitle: "Full Stack Developer",
    experience: "4 years",
    appliedDate: "2026-10-26",
    assignedTo: "Current Screener",
    status: SCREENING_STATUS.SHORTLISTED,
    resumeUrl: "",
    skills: ["React", "Node.js", "MongoDB", "REST API"],
    requiredSkills: ["React", "Node.js", "MongoDB"],
    education: "B.Tech",
    requiredEducation: "B.Tech or equivalent",
    noticePeriod: "45 days",
    remarks: "Good technical match for the role.",
    rejectionReason: "",
    history: [
      {
        action: "Application received",
        by: "System",
        date: "2026-10-26T09:00:00.000Z",
      },
      {
        action: "Screening completed",
        by: "Current Screener",
        date: "2026-10-28T11:00:00.000Z",
      },
      {
        action: "Shortlisted and moved to L1 queue",
        by: "Current Screener",
        date: "2026-10-28T11:05:00.000Z",
      },
    ],
  },
  {
    id: "APP-1004",
    candidateName: "Sandeep Reddy",
    email: "sandeep.reddy@example.com",
    phone: "9876543213",
    jobTitle: "Java Developer",
    experience: "1 year",
    appliedDate: "2026-10-25",
    assignedTo: "Current Screener",
    status: SCREENING_STATUS.ON_HOLD,
    resumeUrl: "",
    skills: ["Java", "Spring Boot"],
    requiredSkills: ["Java", "Spring Boot", "SQL"],
    education: "B.Tech",
    requiredEducation: "B.Tech or equivalent",
    noticePeriod: "60 days",
    remarks: "SQL experience needs clarification.",
    rejectionReason: "",
    history: [
      {
        action: "Application received",
        by: "System",
        date: "2026-10-25T09:00:00.000Z",
      },
      {
        action: "Moved to HR review - clarification required",
        by: "Current Screener",
        date: "2026-10-28T12:00:00.000Z",
      },
    ],
  },
  {
    id: "APP-1005",
    candidateName: "Meghana Rao",
    email: "meghana.rao@example.com",
    phone: "9876543214",
    jobTitle: "UI Developer",
    experience: "1 year",
    appliedDate: "2026-10-24",
    assignedTo: "Current Screener",
    status: SCREENING_STATUS.REJECTED,
    resumeUrl: "",
    skills: ["HTML", "CSS"],
    requiredSkills: ["React", "JavaScript", "HTML"],
    education: "B.Com",
    requiredEducation: "Bachelor's degree in relevant field",
    noticePeriod: "30 days",
    remarks: "Technical requirements were reviewed.",
    rejectionReason: "Required React and JavaScript skills are missing.",
    history: [
      {
        action: "Application received",
        by: "System",
        date: "2026-10-24T09:00:00.000Z",
      },
      {
        action: "Rejected - Required skills not met",
        by: "Current Screener",
        date: "2026-10-28T13:00:00.000Z",
      },
    ],
  },
  {
    id: "APP-1006",
    candidateName: "Arjun Varma",
    email: "arjun.varma@example.com",
    phone: "9876543215",
    jobTitle: "Python Developer",
    experience: "3 years",
    appliedDate: "2026-10-29",
    assignedTo: "Current Screener",
    status: SCREENING_STATUS.HR_REVIEW,
    resumeUrl: "",
    skills: ["Python", "Django", "SQL"],
    requiredSkills: ["Python", "Django", "SQL"],
    education: "MCA",
    requiredEducation: "Bachelor's or Master's degree",
    noticePeriod: "30 days",
    remarks: "Experience level is borderline for this role.",
    rejectionReason: "",
    history: [
      {
        action: "Application received",
        by: "System",
        date: "2026-10-29T09:00:00.000Z",
      },
      {
        action: "Escalated for HR review",
        by: "Current Screener",
        date: "2026-10-29T10:00:00.000Z",
      },
    ],
  },
];

export const getScreenerApplications = () => {
  try {
    const saved = localStorage.getItem(SCREENER_STORAGE_KEY);

    if (saved) {
      return JSON.parse(saved);
    }

    localStorage.setItem(
      SCREENER_STORAGE_KEY,
      JSON.stringify(initialScreenerApplications)
    );

    return initialScreenerApplications;
  } catch {
    return initialScreenerApplications;
  }
};

export const saveScreenerApplications = (applications) => {
  localStorage.setItem(
    SCREENER_STORAGE_KEY,
    JSON.stringify(applications)
  );
};

export const addScreeningHistory = (application, action, by = "Current Screener") => [
  ...(application.history || []),
  {
    action,
    by,
    date: new Date().toISOString(),
  },
];

export const getScreeningCounts = (applications = []) => ({
  assigned: applications.length,
  pending: applications.filter((item) =>
    [SCREENING_STATUS.ASSIGNED, SCREENING_STATUS.IN_PROGRESS].includes(item.status)
  ).length,
  shortlisted: applications.filter(
    (item) => item.status === SCREENING_STATUS.SHORTLISTED
  ).length,
  rejected: applications.filter(
    (item) => item.status === SCREENING_STATUS.REJECTED
  ).length,
  onHold: applications.filter(
    (item) => item.status === SCREENING_STATUS.ON_HOLD
  ).length,
  hrReview: applications.filter(
    (item) => item.status === SCREENING_STATUS.HR_REVIEW
  ).length,
});