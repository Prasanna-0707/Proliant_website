import { useState } from "react";
import { UserRound, Mail, ShieldCheck, Briefcase } from "lucide-react";

const ScreenerProfile = () => {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser") || "{}");
    } catch {
      return {};
    }
  });

  const name =
    user.name || user.fullName || user.employeeName || "L0 Screener";

  const email = user.email || user.emailAddress || "—";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          View your screener account information.
        </p>
      </div>

      <div className="max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 border-b pb-6 sm:flex-row">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
            <UserRound size={36} />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
            <p className="mt-1 text-sm text-gray-500">L0 Screener</p>
          </div>
        </div>

        <div className="grid gap-6 pt-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-gray-500">
              Full Name
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-800">
              <UserRound size={17} className="text-gray-400" />
              {name}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase text-gray-500">
              Email Address
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-800">
              <Mail size={17} className="text-gray-400" />
              {email}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase text-gray-500">
              Portal Role
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-800">
              <ShieldCheck size={17} className="text-gray-400" />
              L0_SCREENER
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase text-gray-500">
              Department
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-800">
              <Briefcase size={17} className="text-gray-400" />
              {user.department || "Recruitment"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenerProfile;