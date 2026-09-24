import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserCircle,
  Mail,
  BriefcaseBusiness,
  ShieldCheck,
  Phone,
  CalendarDays,
} from "lucide-react";

function Profile() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState({
    name: "Admin",
    email: "",
    role: "Administrator",
    designation: "Administrator",
    phone: "",
    createdAt: "",
  });

  /* =========================================================
     LOAD ADMIN DATA
  ========================================================= */

  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminUser");

    if (!storedAdmin) {
      return;
    }

    try {
      const parsedAdmin = JSON.parse(storedAdmin);

      setAdmin((previous) => ({
        ...previous,
        ...parsedAdmin,
      }));
    } catch (error) {
      console.error(
        "Failed to read admin profile:",
        error
      );
    }
  }, []);

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Not available";
    }
  };

  /* =========================================================
     BACK TO DASHBOARD
  ========================================================= */

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

        <div className="mx-auto flex max-w-5xl items-center px-6 py-5 max-[767px]:px-4">

          <button
            type="button"
            onClick={handleBack}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              px-3
              py-2
              text-sm
              font-medium
              text-gray-600
              transition-colors
              hover:bg-gray-100
              hover:text-gray-900
              dark:text-gray-300
              dark:hover:bg-gray-800
              dark:hover:text-white
            "
          >
            <ArrowLeft
              size={18}
              strokeWidth={2}
            />

            <span>Back to Dashboard</span>
          </button>

        </div>

      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="flex justify-center px-6 py-10 max-[767px]:px-4 max-[767px]:py-6">

        <div className="w-full max-w-3xl">

          {/* =================================================
              PAGE TITLE
          ================================================= */}

          <div className="mb-7 text-center">

            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Profile
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              View your administrator account details.
            </p>

          </div>

          {/* =================================================
              PROFILE CARD
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

            {/* =================================================
                PROFILE INTRO
            ================================================= */}

            <div className="flex flex-col items-center border-b border-gray-200 px-6 py-8 text-center dark:border-gray-800">

              {/* Profile Icon */}

              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">

                <UserCircle
                  size={68}
                  strokeWidth={1.5}
                  className="text-gray-500 dark:text-gray-300"
                />

              </div>

              {/* Name */}

              <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                {admin.name || "Admin"}
              </h2>

              {/* Designation */}

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {admin.designation ||
                  admin.role ||
                  "Administrator"}
              </p>

              {/* Email */}

              {admin.email && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {admin.email}
                </p>
              )}

            </div>

            {/* =================================================
                ACCOUNT DETAILS
            ================================================= */}

            <div className="px-8 py-8 max-[767px]:px-5">

              <h3 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
                Account Details
              </h3>

              <div className="grid grid-cols-2 gap-4 max-[639px]:grid-cols-1">

                {/* Full Name */}

                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">

                  <div className="flex items-center gap-2">

                    <UserCircle
                      size={18}
                      className="text-gray-500 dark:text-gray-400"
                    />

                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Full Name
                    </span>

                  </div>

                  <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                    {admin.name || "Not available"}
                  </p>

                </div>

                {/* Email */}

                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">

                  <div className="flex items-center gap-2">

                    <Mail
                      size={18}
                      className="text-gray-500 dark:text-gray-400"
                    />

                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Email
                    </span>

                  </div>

                  <p className="mt-3 break-all text-sm font-medium text-gray-900 dark:text-white">
                    {admin.email || "Not available"}
                  </p>

                </div>

                {/* Designation */}

                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">

                  <div className="flex items-center gap-2">

                    <BriefcaseBusiness
                      size={18}
                      className="text-gray-500 dark:text-gray-400"
                    />

                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Designation
                    </span>

                  </div>

                  <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                    {admin.designation ||
                      "Administrator"}
                  </p>

                </div>

                {/* Role */}

                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">

                  <div className="flex items-center gap-2">

                    <ShieldCheck
                      size={18}
                      className="text-gray-500 dark:text-gray-400"
                    />

                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Role
                    </span>

                  </div>

                  <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                    {admin.role ||
                      "Administrator"}
                  </p>

                </div>

                {/* Phone */}

                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">

                  <div className="flex items-center gap-2">

                    <Phone
                      size={18}
                      className="text-gray-500 dark:text-gray-400"
                    />

                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Phone
                    </span>

                  </div>

                  <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                    {admin.phone || "Not available"}
                  </p>

                </div>

                {/* Account Created */}

                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">

                  <div className="flex items-center gap-2">

                    <CalendarDays
                      size={18}
                      className="text-gray-500 dark:text-gray-400"
                    />

                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Account Created
                    </span>

                  </div>

                  <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(admin.createdAt)}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

export default Profile;