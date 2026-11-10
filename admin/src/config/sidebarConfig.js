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
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
  AlertCircle,
  UserRound,
} from "lucide-react";

/* =========================================================
   COMMON NAVIGATION
========================================================= */

const dashboardItem = (path) => ({
  label: "Dashboard",
  path,
  icon: LayoutDashboard,
});

/* =========================================================
   ADMIN SIDEBAR
========================================================= */

const adminSections = [
  {
    title: "Overview",
    items: [dashboardItem("/admin/dashboard")],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Users",
        path: "/admin/users",
        icon: Users,
      },
      {
        label: "Roles & Permissions",
        path: "/admin/roles-permissions",
        icon: ShieldCheck,
      },
      {
        label: "Settings",
        path: "/admin/settings",
        icon: Settings,
      },
      {
        label: "Audit Logs",
        path: "/admin/audit-logs",
        icon: History,
      },
    ],
  },
];

/* =========================================================
   HR SIDEBAR
========================================================= */

const hrSections = [
  {
    title: "Overview",
    items: [dashboardItem("/hr/dashboard")],
  },
  {
    title: "Recruitment",
    items: [
      {
        label: "Jobs",
        path: "/hr/jobs",
        icon: BriefcaseBusiness,
      },
      {
        label: "Candidates",
        path: "/hr/candidates",
        icon: UserRoundSearch,
      },
      {
        label: "Enquiries",
        path: "/hr/enquiries",
        icon: MessageSquareText,
      },
      {
        label: "Countries",
        path: "/hr/countries",
        icon: Globe2,
      },
    ],
  },
  {
    title: "Hiring Workflow",
    items: [
      {
        label: "L0 Screening Management",
        path: "/hr/l0-screeners",
        icon: ClipboardCheck,
      },
      {
        label: "L1 Interview",
        path: "/hr/l1-interview",
        icon: CalendarDays,
      },
      {
        label: "L2 Interview",
        path: "/hr/l2-interview",
        icon: ClipboardList,
      },
    ],
  },
];

/* =========================================================
   RECRUITER SIDEBAR
========================================================= */

const recruiterSections = [
  {
    title: "Overview",
    items: [dashboardItem("/hr/dashboard")],
  },
  {
    title: "Recruitment",
    items: [
      {
        label: "Jobs",
        path: "/hr/jobs",
        icon: BriefcaseBusiness,
      },
      {
        label: "Candidates",
        path: "/hr/candidates",
        icon: UserRoundSearch,
      },
      {
        label: "Enquiries",
        path: "/hr/enquiries",
        icon: MessageSquareText,
      },
    ],
  },
];

/* =========================================================
   L0 SCREENER SIDEBAR
========================================================= */

const screenerSections = [
  {
    title: "Overview",
    items: [dashboardItem("/screener-dashboard")],
  },
  {
    title: "Applications",
    items: [
      {
        label: "My Applications",
        path: "/assigned-applications",
        icon: ClipboardList,
      },
      {
        label: "Pending Screening",
        path: "/l0-screening",
        icon: Clock,
      },
    ],
  },
  {
    title: "Screening Results",
    items: [
      {
        label: "Shortlisted",
        path: "/screener/shortlisted",
        icon: CheckCircle,
      },
      {
        label: "Rejected",
        path: "/screener/rejected",
        icon: XCircle,
      },
      {
        label: "On Hold",
        path: "/screener/on-hold",
        icon: PauseCircle,
      },
      {
        label: "HR Review Requests",
        path: "/screener/hr-review",
        icon: AlertCircle,
      },
    ],
  },
  {
    title: "My Activity",
    items: [
      {
        label: "Screening History",
        path: "/screener/history",
        icon: History,
      },
      {
        label: "My Profile",
        path: "/screener/profile",
        icon: UserRound,
      },
    ],
  },
];

/* =========================================================
   INTERVIEWER SIDEBAR
========================================================= */

const interviewerSections = [
  {
    title: "Overview",
    items: [dashboardItem("/hr/dashboard")],
  },
  {
    title: "Interviews",
    items: [
      {
        label: "L1 Interview",
        path: "/hr/l1-interview",
        icon: CalendarDays,
      },
      {
        label: "L2 Interview",
        path: "/hr/l2-interview",
        icon: ClipboardList,
      },
      {
        label: "Assigned Candidates",
        path: "/hr/assigned-candidates",
        icon: Users,
      },
      {
        label: "Evaluations",
        path: "/hr/evaluations",
        icon: ClipboardCheck,
      },
    ],
  },
];

/* =========================================================
   HIRING MANAGER SIDEBAR
========================================================= */

const hiringManagerSections = [
  {
    title: "Overview",
    items: [
      dashboardItem("/hiring-manager/dashboard"),
    ],
  },
  {
    title: "Interview Management",
    items: [
      {
        label: "Interview Pipeline",
        path: "/hiring-manager/interview-pipeline",
        icon: Users,
      },
      {
        label: "Interview Schedule",
        path: "/hiring-manager/interview-schedule",
        icon: CalendarDays,
      },
      {
        label: "Interviewer Coordination",
        path: "/hiring-manager/interviewer-coordination",
        icon: UserCog,
      },
    ],
  },
  {
    title: "Hiring Decisions",
    items: [
      {
        label: "Evaluations",
        path: "/hiring-manager/evaluations",
        icon: ClipboardCheck,
      },
      {
        label: "Hiring Decisions",
        path: "/hiring-manager/decisions",
        icon: CheckCircle,
      },
      {
        label: "Final Review",
        path: "/hiring-manager/final-review",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "My Account",
    items: [
      {
        label: "Activity History",
        path: "/hiring-manager/activity-history",
        icon: History,
      },
      {
        label: "My Profile",
        path: "/hiring-manager/profile",
        icon: UserCog,
      },
    ],
  },
];

/* =========================================================
   ROLE-BASED SIDEBAR CONFIGURATION
========================================================= */

export const sidebarConfig = {
  ADMIN: adminSections,
  HR: hrSections,
  RECRUITER: recruiterSections,
  L0_SCREENER: screenerSections,
  INTERVIEWER: interviewerSections,
  HIRING_MANAGER: hiringManagerSections,
};

/* =========================================================
   ROLE NORMALIZATION
========================================================= */

export function normalizeUserRole(user, explicitRole) {
  const rawRole =
    explicitRole ??
    user?.role ??
    user?.userRole ??
    user?.user_type ??
    user?.userType ??
    user?.designation ??
    user?.user?.role ??
    user?.data?.role ??
    user?.data?.user?.role ??
    "";

  const role = String(rawRole)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const aliases = {
    ADMIN: "ADMIN",
    ADMINISTRATOR: "ADMIN",
    SUPER_ADMIN: "ADMIN",
    SUPERADMIN: "ADMIN",

    HR: "HR",
    HR_MANAGER: "HR",
    HR_ADMIN: "HR",
    HUMAN_RESOURCES: "HR",

    RECRUITER: "RECRUITER",
    RECRUITMENT: "RECRUITER",

    SCREENER: "L0_SCREENER",
    L0_SCREENER: "L0_SCREENER",
    L0SCREENER: "L0_SCREENER",

    INTERVIEWER: "INTERVIEWER",

    HIRING_MANAGER: "HIRING_MANAGER",
  };

  if (aliases[role]) {
    return aliases[role];
  }

  if (
    user?.isAdmin === true ||
    user?.isSuperAdmin === true
  ) {
    return "ADMIN";
  }

  return null;
}




// import {
//   LayoutDashboard,
//   Users,
//   UserCog,
//   BriefcaseBusiness,
//   UserRoundSearch,
//   MessageSquareText,
//   Globe2,
//   ClipboardCheck,
//   CalendarDays,
//   ClipboardList,
//   History,
//   Settings,
//   ShieldCheck,
// } from "lucide-react";

// /* =========================================================
//    COMMON NAVIGATION
// ========================================================= */

// const commonDashboard = {
//   label: "Dashboard",
//   path: "/dashboard",
//   icon: LayoutDashboard,
// };

// /* =========================================================
//    HR MENU
// ========================================================= */

// // HR ki Management section lo Jobs maatrame.
// const hrManagementLinks = [
//   {
//     label: "Jobs",
//     path: "/jobs",
//     icon: BriefcaseBusiness,
//   },
// ];

// // HR Recruitment section lo Candidates maatrame.
// const hrRecruitmentLinks = [
//   {
//     label: "Candidates",
//     path: "/candidates",
//     icon: UserRoundSearch,
//   },
// ];

// // HR hiring workflow: L0, L1, L2.
// const hrWorkflowLinks = [
//   {
//     label: "L0 Screening",
//     path: "/l0-screening",
//     icon: ClipboardCheck,
//   },
//   {
//     label: "L1 Interview",
//     path: "/l1-interview",
//     icon: CalendarDays,
//   },
//   {
//     label: "L2 Interview",
//     path: "/l2-interview",
//     icon: ClipboardList,
//   },
// ];

// /* =========================================================
//    GENERAL MANAGEMENT MENU
//    Used by roles that need employee management.
// ========================================================= */

// const managementLinks = [
//   {
//     label: "Employees",
//     path: "/employees",
//     icon: Users,
//   },
//   {
//     label: "Team Members",
//     path: "/team-members",
//     icon: UserCog,
//   },
//   {
//     label: "Jobs",
//     path: "/jobs",
//     icon: BriefcaseBusiness,
//   },
//   {
//     label: "Countries",
//     path: "/countries",
//     icon: Globe2,
//   },
// ];

// /* =========================================================
//    RECRUITMENT MENU
// ========================================================= */

// const recruitmentLinks = [
//   {
//     label: "Candidates",
//     path: "/candidates",
//     icon: UserRoundSearch,
//   },
// ];

// const recruiterLinks = [
//   {
//     label: "Jobs",
//     path: "/jobs",
//     icon: BriefcaseBusiness,
//   },
//   {
//     label: "Candidates",
//     path: "/candidates",
//     icon: UserRoundSearch,
//   },
//   {
//     label: "Enquiries",
//     path: "/enquiries",
//     icon: MessageSquareText,
//   },
// ];

// /* =========================================================
//    SHARED WORKFLOW MENU
//    For recruiter / interviewer roles where appropriate.
// ========================================================= */

// const recruitmentWorkflowLinks = [
//   {
//     label: "L0 Screening",
//     path: "/l0-screening",
//     icon: ClipboardCheck,
//   },
//   {
//     label: "L1 Interview",
//     path: "/l1-interview",
//     icon: CalendarDays,
//   },
//   {
//     label: "L2 Interview",
//     path: "/l2-interview",
//     icon: ClipboardList,
//   },
// ];

// /* =========================================================
//    L0 SCREENER MENU
// ========================================================= */

// const screenerLinks = [
//   {
//     label: "Assigned Applications",
//     path: "/assigned-applications",
//     icon: ClipboardList,
//   },
//   {
//     label: "L0 Screening",
//     path: "/l0-screening",
//     icon: ClipboardCheck,
//   },
// ];

// /* =========================================================
//    INTERVIEWER MENU
// ========================================================= */

// const interviewerLinks = [
//   {
//     label: "L1 Interview",
//     path: "/l1-interview",
//     icon: CalendarDays,
//   },
//   {
//     label: "L2 Interview",
//     path: "/l2-interview",
//     icon: ClipboardList,
//   },
//   {
//     label: "Assigned Candidates",
//     path: "/assigned-candidates",
//     icon: Users,
//   },
//   {
//     label: "Evaluations",
//     path: "/evaluations",
//     icon: ClipboardCheck,
//   },
// ];

// /* =========================================================
//    HIRING LEAD MENU
// ========================================================= */

// const hiringLeadLinks = [
//   {
//     label: "Candidate Pipeline",
//     path: "/candidate-pipeline",
//     icon: Users,
//   },
//   {
//     label: "Interview Decisions",
//     path: "/interview-decisions",
//     icon: ClipboardCheck,
//   },
//   {
//     label: "Feedback History",
//     path: "/feedback-history",
//     icon: History,
//   },
// ];

// /* =========================================================
//    ADMIN MENU
// ========================================================= */

// // Administrator ki user management, access permissions,
// // system settings and audit logs maatrame display avuthayi.

// const adminLinks = [
//   {
//     label: "Users",
//     path: "/users",
//     icon: Users,
//   },
//   {
//     label: "Roles & Permissions",
//     path: "/roles-permissions",
//     icon: ShieldCheck,
//   },
//   {
//     label: "Settings",
//     path: "/settings",
//     icon: Settings,
//   },
//   {
//     label: "Audit Logs",
//     path: "/audit-logs",
//     icon: History,
//   },
// ];

// /* =========================================================
//    ROLE-BASED SIDEBAR CONFIGURATION
// ========================================================= */

// export const sidebarConfig = {
//   /* ---------------- HR ---------------- */

//   HR: [
//     {
//       title: "Overview",
//       items: [commonDashboard],
//     },
//     {
//       title: "Management",
//       items: hrManagementLinks,
//     },
//     {
//       title: "Recruitment",
//       items: hrRecruitmentLinks,
//     },
//     {
//       title: "Hiring Workflow",
//       items: hrWorkflowLinks,
//     },
//   ],

//   /* ---------------- RECRUITER ---------------- */

//   RECRUITER: [
//     {
//       title: "Overview",
//       items: [commonDashboard],
//     },
//     {
//       title: "Recruitment",
//       items: recruiterLinks,
//     },
//     {
//       title: "Hiring Workflow",
//       items: recruitmentWorkflowLinks,
//     },
//   ],

//   /* ---------------- L0 SCREENER ---------------- */

//   L0_SCREENER: [
//     {
//       title: "Overview",
//       items: [commonDashboard],
//     },
//     {
//       title: "Screening",
//       items: screenerLinks,
//     },
//   ],

//   /* ---------------- INTERVIEWER ---------------- */

//   INTERVIEWER: [
//     {
//       title: "Overview",
//       items: [commonDashboard],
//     },
//     {
//       title: "Interviews",
//       items: interviewerLinks,
//     },
//   ],

//   /* ---------------- HIRING LEAD ---------------- */

//   HIRING_LEAD: [
//     {
//       title: "Overview",
//       items: [commonDashboard],
//     },
//     {
//       title: "Hiring",
//       items: hiringLeadLinks,
//     },
//   ],

//   /* ---------------- ADMIN ---------------- */

//   ADMIN: [
//     {
//       title: "Overview",
//       items: [commonDashboard],
//     },
//     {
//       title: "Administration",
//       items: adminLinks,
//     },
//   ],
// };

// /* =========================================================
//    ROLE NORMALIZATION
// ========================================================= */

// export function normalizeUserRole(user) {
//   if (!user) return "HR";

//   const rawRole =
//     user.role ??
//     user.userRole ??
//     user.designation ??
//     user.userType ??
//     "";

//   const role = String(rawRole)
//     .trim()
//     .toUpperCase()
//     .replace(/[\s-]+/g, "_");

//   const roleAliases = {
//     ADMIN: "ADMIN",
//     SUPER_ADMIN: "ADMIN",

//     HR: "HR",
//     HR_MANAGER: "HR",
//     HR_ADMIN: "HR",

//     RECRUITER: "RECRUITER",
//     RECRUITMENT: "RECRUITER",

//     L0_SCREENER: "L0_SCREENER",
//     L0SCREENER: "L0_SCREENER",
//     SCREENER: "L0_SCREENER",

//     INTERVIEWER: "INTERVIEWER",

//     HIRING_LEAD: "HIRING_LEAD",
//     HIRING_MANAGER: "HIRING_LEAD",
//   };

//   if (roleAliases[role]) {
//     return roleAliases[role];
//   }

//   if (
//     user.isAdmin === true ||
//     user.isSuperAdmin === true
//   ) {
//     return "ADMIN";
//   }

//   return "HR";
// }


// import {
//   LayoutDashboard,
//   Users,
//   UserCog,
//   BriefcaseBusiness,
//   UserRoundSearch,
//   MessageSquareText,
//   Globe2,
//   ClipboardCheck,
//   CalendarDays,
//   ClipboardList,
//   History,
//   Settings,
// } from "lucide-react";

// /* =========================================================
//    COMMON NAVIGATION
// ========================================================= */

// const commonDashboard = {
//   label: "Dashboard",
//   path: "/dashboard",
//   icon: LayoutDashboard,
// };

// /* =========================================================
//    HR MENU
// ========================================================= */

// // HR ki Management section lo Jobs maatrame.
// const hrManagementLinks = [
//   {
//     label: "Jobs",
//     path: "/jobs",
//     icon: BriefcaseBusiness,
//   },
// ];

// // HR Recruitment section lo Candidates maatrame.
// const hrRecruitmentLinks = [
//   {
//     label: "Candidates",
//     path: "/candidates",
//     icon: UserRoundSearch,
//   },
// ];

// // HR hiring workflow: L0, L1, L2.
// const hrWorkflowLinks = [
//   {
//     label: "L0 Screening",
//     path: "/l0-screening",
//     icon: ClipboardCheck,
//   },
//   {
//     label: "L1 Interview",
//     path: "/l1-interview",
//     icon: CalendarDays,
//   },
//   {
//     label: "L2 Interview",
//     path: "/l2-interview",
//     icon: ClipboardList,
//   },
// ];

// /* =========================================================
//    GENERAL MANAGEMENT MENU
//    Used by roles that need employee management.
// ========================================================= */

// const managementLinks = [
//   {
//     label: "Employees",
//     path: "/employees",
//     icon: Users,
//   },
//   {
//     label: "Team Members",
//     path: "/team-members",
//     icon: UserCog,
//   },
//   {
//     label: "Jobs",
//     path: "/jobs",
//     icon: BriefcaseBusiness,
//   },
//   {
//     label: "Countries",
//     path: "/countries",
//     icon: Globe2,
//   },
// ];

// /* =========================================================
//    RECRUITMENT MENU
// ========================================================= */

// const recruitmentLinks = [
//   {
//     label: "Candidates",
//     path: "/candidates",
//     icon: UserRoundSearch,
//   },
// ];

// const recruiterLinks = [
//   {
//     label: "Jobs",
//     path: "/jobs",
//     icon: BriefcaseBusiness,
//   },
//   {
//     label: "Candidates",
//     path: "/candidates",
//     icon: UserRoundSearch,
//   },
//   {
//     label: "Enquiries",
//     path: "/enquiries",
//     icon: MessageSquareText,
//   },
// ];

// /* =========================================================
//    SHARED WORKFLOW MENU
//    For recruiter / interviewer roles where appropriate.
// ========================================================= */

// const recruitmentWorkflowLinks = [
//   {
//     label: "L0 Screening",
//     path: "/l0-screening",
//     icon: ClipboardCheck,
//   },
//   {
//     label: "L1 Interview",
//     path: "/l1-interview",
//     icon: CalendarDays,
//   },
//   {
//     label: "L2 Interview",
//     path: "/l2-interview",
//     icon: ClipboardList,
//   },
// ];

// /* =========================================================
//    L0 SCREENER MENU
// ========================================================= */

// const screenerLinks = [
//   {
//     label: "Assigned Applications",
//     path: "/assigned-applications",
//     icon: ClipboardList,
//   },
//   {
//     label: "L0 Screening",
//     path: "/l0-screening",
//     icon: ClipboardCheck,
//   },
// ];

// /* =========================================================
//    INTERVIEWER MENU
// ========================================================= */

// const interviewerLinks = [
//   {
//     label: "L1 Interview",
//     path: "/l1-interview",
//     icon: CalendarDays,
//   },
//   {
//     label: "L2 Interview",
//     path: "/l2-interview",
//     icon: ClipboardList,
//   },
//   {
//     label: "Assigned Candidates",
//     path: "/assigned-candidates",
//     icon: Users,
//   },
//   {
//     label: "Evaluations",
//     path: "/evaluations",
//     icon: ClipboardCheck,
//   },
// ];

// /* =========================================================
//    HIRING LEAD MENU
// ========================================================= */

// const hiringLeadLinks = [
//   {
//     label: "Candidate Pipeline",
//     path: "/candidate-pipeline",
//     icon: Users,
//   },
//   {
//     label: "Interview Decisions",
//     path: "/interview-decisions",
//     icon: ClipboardCheck,
//   },
//   {
//     label: "Feedback History",
//     path: "/feedback-history",
//     icon: History,
//   },
// ];

// /* =========================================================
//    ADMIN MENU
// ========================================================= */

// const adminLinks = [
//   {
//     label: "User & Access Management",
//     path: "/user-access",
//     icon: UserCog,
//   },
//   {
//     label: "Settings",
//     path: "/settings",
//     icon: Settings,
//   },
// ];

// /* =========================================================
//    ROLE-BASED SIDEBAR CONFIGURATION
// ========================================================= */

// export const sidebarConfig = {
//   HR: [
//     {
//       title: "Overview",
//       items: [commonDashboard],
//     },
//     {
//       title: "Management",
//       items: hrManagementLinks,
//     },
//     {
//       title: "Recruitment",
//       items: hrRecruitmentLinks,
//     },
//     {
//       title: "Hiring Workflow",
//       items: hrWorkflowLinks,
//     },
//   ],

//   RECRUITER: [
//     {
//       title: "Overview",
//       items: [commonDashboard],
//     },
//     {
//       title: "Recruitment",
//       items: recruiterLinks,
//     },
//     {
//       title: "Hiring Workflow",
//       items: recruitmentWorkflowLinks,
//     },
//   ],

//   L0_SCREENER: [
//     {
//       title: "Overview",
//       items: [commonDashboard],
//     },
//     {
//       title: "Screening",
//       items: screenerLinks,
//     },
//   ],

//   INTERVIEWER: [
//     {
//       title: "Overview",
//       items: [commonDashboard],
//     },
//     {
//       title: "Interviews",
//       items: interviewerLinks,
//     },
//   ],

//   HIRING_LEAD: [
//     {
//       title: "Overview",
//       items: [commonDashboard],
//     },
//     {
//       title: "Hiring",
//       items: hiringLeadLinks,
//     },
//   ],

//   ADMIN: [
//     {
//       title: "Overview",
//       items: [commonDashboard],
//     },
//     {
//       title: "Management",
//       items: managementLinks,
//     },
//     {
//       title: "Recruitment",
//       items: recruitmentLinks,
//     },
//     {
//       title: "Administration",
//       items: adminLinks,
//     },
//   ],
// };

// /* =========================================================
//    ROLE NORMALIZATION
// ========================================================= */

// export function normalizeUserRole(user) {
//   if (!user) return "HR";

//   const rawRole =
//     user.role ??
//     user.userRole ??
//     user.designation ??
//     user.userType ??
//     "";

//   const role = String(rawRole)
//     .trim()
//     .toUpperCase()
//     .replace(/[\s-]+/g, "_");

//   const roleAliases = {
//     ADMIN: "ADMIN",
//     SUPER_ADMIN: "ADMIN",

//     HR: "HR",
//     HR_MANAGER: "HR",
//     HR_ADMIN: "HR",

//     RECRUITER: "RECRUITER",
//     RECRUITMENT: "RECRUITER",

//     L0_SCREENER: "L0_SCREENER",
//     L0SCREENER: "L0_SCREENER",
//     SCREENER: "L0_SCREENER",

//     INTERVIEWER: "INTERVIEWER",

//     HIRING_LEAD: "HIRING_LEAD",
//     HIRING_MANAGER: "HIRING_LEAD",
//   };

//   if (roleAliases[role]) {
//     return roleAliases[role];
//   }

//   if (user.isAdmin === true || user.isSuperAdmin === true) {
//     return "ADMIN";
//   }

//   return "HR";
// }