export const hiringManagerStats = [
  {
    title: "Active Candidates",
    value: 42,
    description: "Candidates in active hiring stages",
    icon: "users",
  },
  {
    title: "Upcoming Interviews",
    value: 12,
    description: "Scheduled interviews",
    icon: "calendar",
  },
  {
    title: "Pending Evaluations",
    value: 8,
    description: "Waiting for interviewer feedback",
    icon: "clipboard",
  },
  {
    title: "Decisions Required",
    value: 5,
    description: "Awaiting your review",
    icon: "check",
  },
];

export const hiringPipeline = [
  { stage: "L1 Interview", count: 18, color: "bg-blue-500" },
  { stage: "L2 Interview", count: 12, color: "bg-violet-500" },
  { stage: "L3 Interview", count: 7, color: "bg-amber-500" },
  { stage: "Final Review", count: 5, color: "bg-emerald-500" },
];

export const upcomingInterviews = [
  {
    id: "INT-1001",
    candidate: "Rahul Sharma",
    position: "React Developer",
    interviewer: "Anil Kumar",
    stage: "L1 Interview",
    date: "2026-11-05",
    time: "10:00 AM",
    mode: "Online",
  },
  {
    id: "INT-1002",
    candidate: "Priya Reddy",
    position: "Python Developer",
    interviewer: "Sandeep Rao",
    stage: "L2 Interview",
    date: "2026-11-05",
    time: "11:30 AM",
    mode: "Online",
  },
  {
    id: "INT-1003",
    candidate: "Kiran Kumar",
    position: "Full Stack Developer",
    interviewer: "Vamsi Krishna",
    stage: "L1 Interview",
    date: "2026-11-06",
    time: "02:00 PM",
    mode: "On-site",
  },
  {
    id: "INT-1004",
    candidate: "Sneha Patel",
    position: "SAP ABAP Developer",
    interviewer: "Ravi Teja",
    stage: "L3 Interview",
    date: "2026-11-06",
    time: "03:30 PM",
    mode: "Online",
  },
];

export const pendingActions = [
  {
    id: "ACT-1001",
    title: "Review interviewer feedback",
    description: "Rahul Sharma - React Developer",
    type: "Evaluation",
    priority: "High",
    path: "/hiring-manager/evaluations",
  },
  {
    id: "ACT-1002",
    title: "Hiring decision required",
    description: "Priya Reddy - Python Developer",
    type: "Decision",
    priority: "High",
    path: "/hiring-manager/decisions",
  },
  {
    id: "ACT-1003",
    title: "Coordinate interviewer availability",
    description: "Full Stack Developer - L2 Interview",
    type: "Coordination",
    priority: "Medium",
    path: "/hiring-manager/interviewer-coordination",
  },
  {
    id: "ACT-1004",
    title: "Complete final candidate review",
    description: "Sneha Patel - SAP ABAP Developer",
    type: "Final Review",
    priority: "Medium",
    path: "/hiring-manager/final-review",
  },
];

export const recentHiringActivity = [
  {
    id: 1,
    title: "Candidate shortlisted",
    description: "Rahul Sharma moved to L2 Interview",
    user: "Hiring Manager",
    time: "Today, 09:45 AM",
    type: "success",
  },
  {
    id: 2,
    title: "Interview evaluation submitted",
    description: "Priya Reddy - L1 Interview",
    user: "Anil Kumar",
    time: "Today, 09:15 AM",
    type: "info",
  },
  {
    id: 3,
    title: "Interview scheduled",
    description: "Kiran Kumar - Full Stack Developer",
    user: "Hiring Manager",
    time: "Yesterday, 04:30 PM",
    type: "primary",
  },
  {
    id: 4,
    title: "Candidate moved to final review",
    description: "Sneha Patel - SAP ABAP Developer",
    user: "Hiring Manager",
    time: "Yesterday, 02:00 PM",
    type: "success",
  },
];

export const interviewStages = [
  "L1 Interview",
  "L2 Interview",
  "L3 Interview",
  "Final Review",
];

export const hiringManagerNavigation = [
  {
    label: "Dashboard",
    path: "/hiring-manager/dashboard",
  },
  {
    label: "Interview Pipeline",
    path: "/hiring-manager/interview-pipeline",
  },
  {
    label: "Interview Schedule",
    path: "/hiring-manager/interview-schedule",
  },
  {
    label: "Interviewer Coordination",
    path: "/hiring-manager/interviewer-coordination",
  },
  {
    label: "Evaluations",
    path: "/hiring-manager/evaluations",
  },
  {
    label: "Hiring Decisions",
    path: "/hiring-manager/decisions",
  },
  {
    label: "Final Review",
    path: "/hiring-manager/final-review",
  },
  {
    label: "Activity History",
    path: "/hiring-manager/activity-history",
  },
  {
    label: "My Profile",
    path: "/hiring-manager/profile",
  },
];