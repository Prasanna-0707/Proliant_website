
import {
  LayoutDashboard,
  Users,
  UserCog,
  BriefcaseBusiness,
  UserRoundSearch,
  MessageSquareText,
  Globe2,
  ClipboardCheck,
  CalendarDays,
  ClipboardList,
  History,
  Settings,
} from "lucide-react";

/* =========================================================
   COMMON NAVIGATION
========================================================= */

const commonDashboard = {
  label: "Dashboard",
  path: "/dashboard",
  icon: LayoutDashboard,
};

/* =========================================================
   HR MENU
========================================================= */

// HR ki Management section lo Jobs maatrame.
const hrManagementLinks = [
  {
    label: "Jobs",
    path: "/jobs",
    icon: BriefcaseBusiness,
  },
];

// HR Recruitment section lo Candidates maatrame.
const hrRecruitmentLinks = [
  {
    label: "Candidates",
    path: "/candidates",
    icon: UserRoundSearch,
  },
];

// HR hiring workflow: L0, L1, L2.
const hrWorkflowLinks = [
  {
    label: "L0 Screening",
    path: "/l0-screening",
    icon: ClipboardCheck,
  },
  {
    label: "L1 Interview",
    path: "/l1-interview",
    icon: CalendarDays,
  },
  {
    label: "L2 Interview",
    path: "/l2-interview",
    icon: ClipboardList,
  },
];

/* =========================================================
   GENERAL MANAGEMENT MENU
   Used by roles that need employee management.
========================================================= */

const managementLinks = [
  {
    label: "Employees",
    path: "/employees",
    icon: Users,
  },
  {
    label: "Team Members",
    path: "/team-members",
    icon: UserCog,
  },
  {
    label: "Jobs",
    path: "/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Countries",
    path: "/countries",
    icon: Globe2,
  },
];

/* =========================================================
   RECRUITMENT MENU
========================================================= */

const recruitmentLinks = [
  {
    label: "Candidates",
    path: "/candidates",
    icon: UserRoundSearch,
  },
];

const recruiterLinks = [
  {
    label: "Jobs",
    path: "/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Candidates",
    path: "/candidates",
    icon: UserRoundSearch,
  },
  {
    label: "Enquiries",
    path: "/enquiries",
    icon: MessageSquareText,
  },
];

/* =========================================================
   SHARED WORKFLOW MENU
   For recruiter / interviewer roles where appropriate.
========================================================= */

const recruitmentWorkflowLinks = [
  {
    label: "L0 Screening",
    path: "/l0-screening",
    icon: ClipboardCheck,
  },
  {
    label: "L1 Interview",
    path: "/l1-interview",
    icon: CalendarDays,
  },
  {
    label: "L2 Interview",
    path: "/l2-interview",
    icon: ClipboardList,
  },
];

/* =========================================================
   L0 SCREENER MENU
========================================================= */

const screenerLinks = [
  {
    label: "Assigned Applications",
    path: "/assigned-applications",
    icon: ClipboardList,
  },
  {
    label: "L0 Screening",
    path: "/l0-screening",
    icon: ClipboardCheck,
  },
];

/* =========================================================
   INTERVIEWER MENU
========================================================= */

const interviewerLinks = [
  {
    label: "L1 Interview",
    path: "/l1-interview",
    icon: CalendarDays,
  },
  {
    label: "L2 Interview",
    path: "/l2-interview",
    icon: ClipboardList,
  },
  {
    label: "Assigned Candidates",
    path: "/assigned-candidates",
    icon: Users,
  },
  {
    label: "Evaluations",
    path: "/evaluations",
    icon: ClipboardCheck,
  },
];

/* =========================================================
   HIRING LEAD MENU
========================================================= */

const hiringLeadLinks = [
  {
    label: "Candidate Pipeline",
    path: "/candidate-pipeline",
    icon: Users,
  },
  {
    label: "Interview Decisions",
    path: "/interview-decisions",
    icon: ClipboardCheck,
  },
  {
    label: "Feedback History",
    path: "/feedback-history",
    icon: History,
  },
];

/* =========================================================
   ADMIN MENU
========================================================= */

const adminLinks = [
  {
    label: "User & Access Management",
    path: "/user-access",
    icon: UserCog,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

/* =========================================================
   ROLE-BASED SIDEBAR CONFIGURATION
========================================================= */

export const sidebarConfig = {
  HR: [
    {
      title: "Overview",
      items: [commonDashboard],
    },
    {
      title: "Management",
      items: hrManagementLinks,
    },
    {
      title: "Recruitment",
      items: hrRecruitmentLinks,
    },
    {
      title: "Hiring Workflow",
      items: hrWorkflowLinks,
    },
  ],

  RECRUITER: [
    {
      title: "Overview",
      items: [commonDashboard],
    },
    {
      title: "Recruitment",
      items: recruiterLinks,
    },
    {
      title: "Hiring Workflow",
      items: recruitmentWorkflowLinks,
    },
  ],

  L0_SCREENER: [
    {
      title: "Overview",
      items: [commonDashboard],
    },
    {
      title: "Screening",
      items: screenerLinks,
    },
  ],

  INTERVIEWER: [
    {
      title: "Overview",
      items: [commonDashboard],
    },
    {
      title: "Interviews",
      items: interviewerLinks,
    },
  ],

  HIRING_LEAD: [
    {
      title: "Overview",
      items: [commonDashboard],
    },
    {
      title: "Hiring",
      items: hiringLeadLinks,
    },
  ],

  ADMIN: [
    {
      title: "Overview",
      items: [commonDashboard],
    },
    {
      title: "Management",
      items: managementLinks,
    },
    {
      title: "Recruitment",
      items: recruitmentLinks,
    },
    {
      title: "Administration",
      items: adminLinks,
    },
  ],
};

/* =========================================================
   ROLE NORMALIZATION
========================================================= */

export function normalizeUserRole(user) {
  if (!user) return "HR";

  const rawRole =
    user.role ??
    user.userRole ??
    user.designation ??
    user.userType ??
    "";

  const role = String(rawRole)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const roleAliases = {
    ADMIN: "ADMIN",
    SUPER_ADMIN: "ADMIN",

    HR: "HR",
    HR_MANAGER: "HR",
    HR_ADMIN: "HR",

    RECRUITER: "RECRUITER",
    RECRUITMENT: "RECRUITER",

    L0_SCREENER: "L0_SCREENER",
    L0SCREENER: "L0_SCREENER",
    SCREENER: "L0_SCREENER",

    INTERVIEWER: "INTERVIEWER",

    HIRING_LEAD: "HIRING_LEAD",
    HIRING_MANAGER: "HIRING_LEAD",
  };

  if (roleAliases[role]) {
    return roleAliases[role];
  }

  if (user.isAdmin === true || user.isSuperAdmin === true) {
    return "ADMIN";
  }

  return "HR";
}