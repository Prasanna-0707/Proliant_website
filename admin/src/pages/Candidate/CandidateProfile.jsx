
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  BriefcaseBusiness,
  UserRound,
  Settings,
  Search,
  Bell,
  Moon,
  ChevronDown,
  ChevronRight,
  Camera,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  FileText,
  Pencil,
  Upload,
  Download,
  Eye,
  Trash2,
  LockKeyhole,
  BellRing,
  ChartNoAxesColumn,
  CheckCircle2,
  Clock3,
  CircleX,
  X,
  Plus,
  Save,
  Code2,
} from "lucide-react";

const initialProfile = {
  fullName: "Lavanya Paluri",
  headline: "AI Engineer | Fresher",
  email: "lavanya@example.com",
  phone: "+91 98765 43210",
  dateOfBirth: "2004-04-12",
  gender: "Female",
  location: "Visakhapatnam, India",
  linkedin: "https://www.linkedin.com/in/lavanya",
  github: "https://github.com/lavanya",
  degree: "B.Tech in Computer Science (AI & ML)",
  institute: "Vignan's Institute of Engineering for Women",
  graduationYear: "2026",
  cgpa: "8.5 / 10",
  experienceTitle: "AI Engineer Intern",
  company: "Proliant Data",
  experiencePeriod: "Mar 2025 – Aug 2025",
  experienceDescription:
    "Worked on AI applications and data solutions.\nBuilt and evaluated RAG and Knowledge Graph prototypes.\nDeveloped frontend interfaces using React and Tailwind CSS.",
  technicalSkills: [
    "Python",
    "Machine Learning",
    "Deep Learning",
    "SQL",
    "RAG",
    "Knowledge Graphs",
    "React",
    "Tailwind CSS",
    "SAP ABAP (Basic)",
    "SAP P2P",
    "SAP O2C",
    "Git",
    "Azure DevOps",
  ],
  softSkills: [
    "Problem Solving",
    "Team Collaboration",
    "Communication",
    "Time Management",
    "Adaptability",
  ],
};

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/candidate-dashboard" },
  { label: "My Applications", icon: ClipboardList, path: "/candidate-applications" },
  { label: "All Jobs", icon: BriefcaseBusiness, path: "/candidate-all-jobs" },
  { label: "Profile", icon: UserRound, path: "/candidate-profile" },
  { label: "Settings", icon: Settings, path: "/candidate-settings" },
];

function SectionCard({ icon: Icon, title, onEdit, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="flex items-center gap-3 text-base font-bold text-slate-900">
          <Icon size={22} className="text-blue-600" />
          {title}
        </h2>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Pencil size={14} />
            Edit
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
      <p className="break-words text-sm text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function ProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    ...profile,
    technicalSkills: [...profile.technicalSkills],
    softSkills: [...profile.softSkills],
  });

  const [newTechnicalSkill, setNewTechnicalSkill] = useState("");
  const [newSoftSkill, setNewSoftSkill] = useState("");
  const [section, setSection] = useState("Personal Information");

  const sections = [
    "Personal Information",
    "Education",
    "Experience",
    "Skills",
  ];

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const addSkill = (type, value, setter) => {
    const skill = value.trim();
    if (!skill) return;

    const key = type === "technical" ? "technicalSkills" : "softSkills";

    setForm((current) => ({
      ...current,
      [key]: current[key].includes(skill)
        ? current[key]
        : [...current[key], skill],
    }));

    setter("");
  };

  const removeSkill = (key, skill) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].filter((item) => item !== skill),
    }));
  };

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100";

  const fields = {
    "Personal Information": [
      { key: "fullName", label: "Full Name", required: true },
      { key: "email", label: "Email Address", type: "email", required: true },
      { key: "phone", label: "Phone Number" },
      { key: "dateOfBirth", label: "Date of Birth", type: "date" },
      { key: "gender", label: "Gender" },
      { key: "location", label: "Location" },
      { key: "headline", label: "Professional Headline" },
      { key: "linkedin", label: "LinkedIn Profile", type: "url" },
      { key: "github", label: "Portfolio / GitHub", type: "url" },
    ],
    Education: [
      { key: "degree", label: "Degree" },
      { key: "institute", label: "Institute" },
      { key: "graduationYear", label: "Year of Graduation" },
      { key: "cgpa", label: "CGPA" },
    ],
    Experience: [
      { key: "experienceTitle", label: "Job Title" },
      { key: "company", label: "Company" },
      { key: "experiencePeriod", label: "Duration" },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep your professional information up to date.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit profile"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={21} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 p-3 md:w-56 md:shrink-0 md:flex-col md:border-b-0 md:border-r md:p-4">
            {sections.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSection(item)}
                className={`shrink-0 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                  section === item
                    ? "bg-red-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <form
            className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              onSave(form);
            }}
          >
            <h3 className="mb-5 text-lg font-bold text-slate-900">{section}</h3>

            {fields[section] && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fields[section].map((field) => (
                  <label key={field.key} className="text-sm font-medium text-slate-700">
                    {field.label}
                    {field.required && <span className="ml-1 text-red-500">*</span>}
                    <input
                      required={field.required}
                      type={field.type || "text"}
                      value={form[field.key] || ""}
                      onChange={(event) =>
                        updateField(field.key, event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                ))}
                {section === "Experience" && (
                  <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                    Responsibilities
                    <textarea
                      rows={5}
                      value={form.experienceDescription}
                      onChange={(event) =>
                        updateField("experienceDescription", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                )}
              </div>
            )}

            {section === "Skills" && (
              <div className="space-y-6">
                {[
                  {
                    title: "Technical Skills",
                    key: "technicalSkills",
                    value: newTechnicalSkill,
                    setter: setNewTechnicalSkill,
                    type: "technical",
                  },
                  {
                    title: "Soft Skills",
                    key: "softSkills",
                    value: newSoftSkill,
                    setter: setNewSoftSkill,
                    type: "soft",
                  },
                ].map((group) => (
                  <div key={group.key}>
                    <h4 className="mb-3 font-semibold text-slate-800">
                      {group.title}
                    </h4>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {form[group.key].map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(group.key, skill)}
                            aria-label={`Remove ${skill}`}
                            className="text-blue-500 hover:text-red-600"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={group.value}
                        onChange={(event) => group.setter(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addSkill(group.type, group.value, group.setter);
                          }
                        }}
                        placeholder={`Add ${group.title.toLowerCase()}...`}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          addSkill(group.type, group.value, group.setter)
                        }
                        className="mt-1.5 inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm hover:bg-slate-50"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ResumeModal({ currentResume, onClose, onUpload }) {
  const fileRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  const handleFile = (file) => {
    setError("");

    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be 5 MB or less.");
      return;
    }

    setSelectedFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Update Resume</h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload your latest resume to keep your profile current.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close update resume"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleFile(event.dataTransfer.files?.[0]);
            }}
            className="flex min-h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-red-300 hover:bg-red-50/30"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Upload size={24} />
            </div>
            <span className="font-semibold text-slate-800">
              {selectedFile ? selectedFile.name : "Upload your resume"}
            </span>
            <span className="mt-2 text-sm text-slate-500">
              Click to browse or drag and drop your PDF here
            </span>
            <span className="mt-2 text-xs text-slate-400">
              PDF format · Maximum file size 5 MB
            </span>
          </button>

          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {currentResume && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <FileText size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {currentResume.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Current resume
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Current
              </span>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedFile}
              onClick={() => onUpload(selectedFile)}
              className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={16} />
              Upload Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CandidateProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("candidateProfile");
      return saved ? { ...initialProfile, ...JSON.parse(saved) } : initialProfile;
    } catch {
      return initialProfile;
    }
  });

  const [resume, setResume] = useState(() => {
    try {
      const saved = localStorage.getItem("candidateResume");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [editing, setEditing] = useState(false);
  const [updatingResume, setUpdatingResume] = useState(false);
  const [notice, setNotice] = useState("");

  const name = profile.fullName || "Candidate";
  const completionItems = [
    profile.fullName,
    profile.email,
    profile.phone,
    profile.location,
    profile.degree,
    profile.institute,
    profile.technicalSkills?.length,
    resume?.name,
  ];
  const completion = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100
  );

  const saveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem("candidateProfile", JSON.stringify(updatedProfile));
    localStorage.setItem("candidateName", updatedProfile.fullName || "Candidate");
    setEditing(false);
    setNotice("Profile updated successfully.");
    window.setTimeout(() => setNotice(""), 3000);
  };

  const uploadResume = (file) => {
    const reader = new FileReader();

    reader.onload = () => {
      const nextResume = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: reader.result,
        uploadedAt: new Date().toISOString(),
      };

      setResume(nextResume);
      localStorage.setItem("candidateResume", JSON.stringify(nextResume));
      setUpdatingResume(false);
      setNotice("Resume updated successfully.");
      window.setTimeout(() => setNotice(""), 3000);
    };

    reader.onerror = () => {
      setNotice("Could not read the selected file. Please try again.");
    };

    reader.readAsDataURL(file);
  };

  const downloadResume = () => {
    if (!resume?.data) return;

    const link = document.createElement("a");
    link.href = resume.data;
    link.download = resume.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const viewResume = () => {
    if (!resume?.data) return;

    const tab = window.open();
    if (tab) {
      tab.document.write(
        `<iframe src="${resume.data}" title="Resume" style="width:100%;height:100%;border:0"></iframe>`
      );
    }
  };

  const applicationStats = [
    { label: "Total Applications", value: 5, icon: FileText, style: "bg-red-50 text-red-500" },
    { label: "In Progress", value: 2, icon: Clock3, style: "bg-orange-50 text-orange-500" },
    { label: "Shortlisted", value: 1, icon: CheckCircle2, style: "bg-emerald-50 text-emerald-600" },
    { label: "Rejected", value: 1, icon: CircleX, style: "bg-rose-50 text-rose-500" },
  ];

  const quickActions = [
    {
      title: "Edit Profile",
      subtitle: "Update your personal details, skills, and experience",
      icon: Pencil,
      color: "bg-blue-50 text-blue-600",
      action: () => setEditing(true),
    },
    {
      title: "Update Resume",
      subtitle: "Upload a new resume (PDF, max 5 MB)",
      icon: Upload,
      color: "bg-red-50 text-red-500",
      action: () => setUpdatingResume(true),
    },
    {
      title: "Change Password",
      subtitle: "Update your account password",
      icon: LockKeyhole,
      color: "bg-red-50 text-red-500",
      action: () => navigate("/candidate-settings"),
    },
    {
      title: "Notification Settings",
      subtitle: "Manage email and application alerts",
      icon: BellRing,
      color: "bg-emerald-50 text-emerald-600",
      action: () => navigate("/candidate-settings"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="flex h-[64px] items-center border-b border-slate-200 px-6">
            <div>
              <div className="mb-1.5 h-1.5 w-10 bg-red-500" />
              <span className="text-[22px] font-extrabold tracking-tight text-black">
                Proliant Data
              </span>
            </div>
          </div>

          <nav className="flex-1 px-3 py-7">
            <p className="mb-5 px-3 text-xs font-bold tracking-[0.15em] text-slate-400">
              CANDIDATE PORTAL
            </p>
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.label === "Profile";

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      if (!active) navigate(item.path);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                      active
                        ? "bg-red-500 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-7">
            <div className="hidden w-full max-w-[510px] items-center gap-3 rounded-full bg-slate-100 px-4 py-3 sm:flex">
              <Search size={19} className="text-slate-500" />
              <input
                placeholder="Search jobs, skills, or locations..."
                aria-label="Search jobs"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                onKeyDown={(event) => {
                  if (event.key === "Enter") navigate("/candidate-all-jobs");
                }}
              />
            </div>

            <div className="ml-auto flex items-center gap-3 sm:gap-5">
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <Bell size={20} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              </button>
              <button
                type="button"
                aria-label="Appearance"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <Moon size={20} />
              </button>
              <div className="h-8 border-l border-slate-200" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-slate-500">Candidate</p>
                </div>
                <ChevronDown size={16} className="hidden text-slate-500 sm:block" />
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1650px] px-4 py-6 sm:px-6 lg:px-7">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  My Profile
                </h1>
                <p className="mt-1 text-sm text-slate-600 sm:text-base">
                  View and manage your personal information, skills, experience, and preferences.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setUpdatingResume(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Upload size={17} />
                  Update Resume
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  <Pencil size={17} />
                  Edit Profile
                </button>
              </div>
            </div>

            {notice && (
              <div
                role="status"
                className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
              >
                <CheckCircle2 size={18} />
                {notice}
              </div>
            )}

            <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(350px,0.95fr)]">
              <div className="min-w-0 space-y-4">
                <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center self-start rounded-full bg-red-100 text-4xl font-bold text-red-500">
                    {name.charAt(0).toUpperCase()}
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      aria-label="Edit profile photo"
                      className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-slate-700 p-2 text-white hover:bg-slate-800"
                    >
                      <Camera size={15} />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold sm:text-2xl">{name}</h2>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        Active
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {profile.headline}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Mail size={16} />
                        {profile.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone size={16} />
                        {profile.phone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={16} />
                        {profile.location}
                      </span>
                    </div>
                  </div>
                </section>

                <div className="flex gap-6 overflow-x-auto border-b border-slate-200 px-1">
                  {["Overview", "Personal Info", "Education", "Experience", "Skills"].map(
                    (tab, index) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => {
                          if (index > 0) setEditing(true);
                        }}
                        className={`shrink-0 border-b-2 px-2 py-3 text-sm font-medium ${
                          index === 0
                            ? "border-red-500 text-red-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {tab}
                      </button>
                    )
                  )}
                </div>

                <SectionCard
                  icon={UserRound}
                  title="Personal Information"
                  onEdit={() => setEditing(true)}
                >
                  <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Detail label="Full Name" value={profile.fullName} />
                    <Detail label="Email Address" value={profile.email} />
                    <Detail label="Phone Number" value={profile.phone} />
                    <Detail label="Date of Birth" value={profile.dateOfBirth} />
                    <Detail label="Gender" value={profile.gender} />
                    <Detail label="Location" value={profile.location} />
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-5 border-t border-slate-100 pt-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <p className="mb-2 text-xs font-medium text-slate-500">
                        LinkedIn Profile
                      </p>
                      <a
                        href={profile.linkedin || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 break-all text-sm text-blue-600 hover:underline"
                      >
                        <Code2 size={18} className="shrink-0" />
                        {profile.linkedin || "Not provided"}
                      </a>
                    </div>
                    <div className="min-w-0">
                      <p className="mb-2 text-xs font-medium text-slate-500">
                        Portfolio / GitHub
                      </p>
                      <a
                        href={profile.github || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 break-all text-sm text-blue-600 hover:underline"
                      >
                        <Code2 size={18} className="shrink-0" />
                        {profile.github || "Not provided"}
                      </a>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  icon={GraduationCap}
                  title="Education"
                  onEdit={() => {
                    setEditing(true);
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.5fr_0.7fr]">
                    <div className="space-y-4">
                      <Detail label="Degree" value={profile.degree} />
                      <Detail label="Institute" value={profile.institute} />
                    </div>
                    <div className="space-y-4">
                      <Detail label="Year of Graduation" value={profile.graduationYear} />
                      <Detail label="CGPA" value={profile.cgpa} />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  icon={Briefcase}
                  title="Experience"
                  onEdit={() => setEditing(true)}
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {profile.experienceTitle}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {profile.company}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm text-slate-500">
                        {profile.experiencePeriod}
                      </p>
                      <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        Internship
                      </span>
                    </div>
                  </div>
                  <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-5 text-slate-600">
                    {(profile.experienceDescription || "")
                      .split("\n")
                      .filter(Boolean)
                      .map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                  </ul>
                </SectionCard>

                <SectionCard
                  icon={Code2}
                  title="Skills"
                  onEdit={() => setEditing(true)}
                >
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <p className="w-28 shrink-0 pt-1 text-xs font-semibold text-slate-700">
                        Technical Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.technicalSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <p className="w-28 shrink-0 pt-1 text-xs font-semibold text-slate-700">
                        Soft Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.softSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>

              <div className="min-w-0 space-y-4">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="rounded-xl bg-red-50/70 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                        <GraduationCap size={30} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-600">Profile Completion</p>
                        <p className="mt-1 text-2xl font-extrabold">{completion}%</p>
                        <div
                          className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
                          role="progressbar"
                          aria-valuenow={completion}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="h-full rounded-full bg-red-500 transition-all"
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Complete your profile for better job recommendations.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <SectionCard icon={FileText} title="Resume">
                  {resume ? (
                    <div className="rounded-xl border border-slate-100 bg-red-50/40 p-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
                          <FileText size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="break-all text-sm font-semibold text-slate-900">
                            {resume.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Uploaded{" "}
                            {new Date(resume.uploadedAt).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {(resume.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={viewResume}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                        >
                          <Eye size={16} />
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={downloadResume}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                        >
                          <Download size={16} />
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpdatingResume(true)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Upload size={16} />
                          Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <FileText size={32} className="mx-auto text-slate-400" />
                      <p className="mt-3 font-semibold text-slate-800">
                        No resume uploaded
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Upload your resume to help recruiters review your profile.
                      </p>
                      <button
                        type="button"
                        onClick={() => setUpdatingResume(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
                      >
                        <Upload size={16} />
                        Upload Resume
                      </button>
                    </div>
                  )}
                  <p className="mt-3 text-xs text-slate-500">
                    Accepted format: PDF · Maximum size: 5 MB
                  </p>
                </SectionCard>

                <SectionCard icon={Code2} title="Quick Actions">
                  <div className="space-y-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.title}
                          type="button"
                          onClick={action.action}
                          className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.color}`}
                          >
                            <Icon size={21} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                              {action.title}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {action.subtitle}
                            </p>
                          </div>
                          <ChevronRight size={18} className="shrink-0 text-slate-500" />
                        </button>
                      );
                    })}
                  </div>
                </SectionCard>

                <SectionCard icon={ChartNoAxesColumn} title="Application Summary">
                  <div className="grid grid-cols-2 gap-3">
                    {applicationStats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={stat.label}
                          className={`flex items-center gap-3 rounded-xl p-3 ${stat.style}`}
                        >
                          <Icon size={22} className="shrink-0" />
                          <div>
                            <p className="text-xl font-extrabold">{stat.value}</p>
                            <p className="text-xs">{stat.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/candidate-applications")}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    View All Applications
                    <ChevronRight size={17} />
                  </button>
                </SectionCard>
              </div>
            </div>
          </main>
        </div>
      </div>

      {editing && (
        <ProfileModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSave={saveProfile}
        />
      )}

      {updatingResume && (
        <ResumeModal
          currentResume={resume}
          onClose={() => setUpdatingResume(false)}
          onUpload={uploadResume}
        />
      )}
    </div>
  );
}
