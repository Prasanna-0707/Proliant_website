export const INTERVIEW_STATUS = {
  SCHEDULED: "Scheduled",
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const INTERVIEW_DECISIONS = {
  PENDING: "Pending",
  SELECTED: "Selected",
  REJECTED: "Rejected",
  ON_HOLD: "On Hold",
};

export const initialL1Interviews = [
  {
    id: "L1-001",
    candidateName: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "9876543210",
    jobTitle: "React Developer",
    interviewer: "Anil Kumar",
    interviewDate: "2026-11-02",
    interviewTime: "10:00",
    status: INTERVIEW_STATUS.SCHEDULED,
    decision: INTERVIEW_DECISIONS.PENDING,
    feedback: "",
    score: "",
    round: "L1",
    history: ["Candidate passed L0 screening", "Moved to L1 Interview"],
  },
  {
    id: "L1-002",
    candidateName: "Priya Reddy",
    email: "priya.reddy@example.com",
    phone: "9876543211",
    jobTitle: "Node.js Developer",
    interviewer: "",
    interviewDate: "",
    interviewTime: "",
    status: INTERVIEW_STATUS.PENDING,
    decision: INTERVIEW_DECISIONS.PENDING,
    feedback: "",
    score: "",
    round: "L1",
    history: ["Candidate passed L0 screening", "Waiting for interviewer assignment"],
  },
  {
    id: "L1-003",
    candidateName: "Kiran Kumar",
    email: "kiran.kumar@example.com",
    phone: "9876543212",
    jobTitle: "Full Stack Developer",
    interviewer: "Suresh Reddy",
    interviewDate: "2026-10-28",
    interviewTime: "14:00",
    status: INTERVIEW_STATUS.COMPLETED,
    decision: INTERVIEW_DECISIONS.SELECTED,
    feedback: "Good JavaScript and React fundamentals.",
    score: "8",
    round: "L1",
    history: ["Candidate passed L0 screening", "L1 interview completed", "Selected for L2"],
  },
];

export const initialL2Interviews = [
  {
    id: "L2-001",
    candidateName: "Kiran Kumar",
    email: "kiran.kumar@example.com",
    phone: "9876543212",
    jobTitle: "Full Stack Developer",
    interviewer: "Praveen Kumar",
    interviewDate: "2026-11-04",
    interviewTime: "11:00",
    status: INTERVIEW_STATUS.SCHEDULED,
    decision: INTERVIEW_DECISIONS.PENDING,
    feedback: "",
    score: "",
    round: "L2",
    history: ["L0 screening passed", "L1 interview passed", "Moved to L2 Interview"],
  },
];

export const getInterviewStats = (interviews = []) => ({
  total: interviews.length,
  upcoming: interviews.filter(
    (item) => item.status === INTERVIEW_STATUS.SCHEDULED
  ).length,
  pending: interviews.filter(
    (item) => item.decision === INTERVIEW_DECISIONS.PENDING
  ).length,
  completed: interviews.filter(
    (item) => item.status === INTERVIEW_STATUS.COMPLETED
  ).length,
});