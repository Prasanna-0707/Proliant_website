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
  Pencil,
  Check,
  X,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function Profile() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    role: "",
    designation: "",
    phone: "",
    createdAt: "",
    mustChangePassword: false,
  });

  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    designation: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     FETCH ADMIN PROFILE
  ========================================================= */

  const fetchAdminProfile = async () => {
    try {
      setIsLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      /* Invalid / expired token */
      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/login");
        return;
      }

      if (!response.ok || !result.success || !result.admin) {
        setError(
          result.message || "Unable to load your profile information."
        );
        return;
      }

      const adminData = result.admin;

      const profileData = {
        name: adminData.name || "",
        email: adminData.email || "",
        role: adminData.role || "Administrator",
        designation: adminData.designation || "Administrator",
        phone: adminData.phone || "",
        createdAt: adminData.createdAt || "",
        mustChangePassword: adminData.mustChangePassword || false,
      };

      setAdmin(profileData);

      setEditData({
        name: profileData.name,
        phone: profileData.phone,
        designation: profileData.designation,
      });

      /* Keep localStorage profile data in sync */
      localStorage.setItem(
        "adminUser",
        JSON.stringify(adminData)
      );
    } catch (fetchError) {
      console.error("Failed to fetch admin profile:", fetchError);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  /* =========================================================
     EDIT INPUT
  ========================================================= */

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =========================================================
     START EDIT
  ========================================================= */

  const handleStartEdit = () => {
    setEditData({
      name: admin.name,
      phone: admin.phone,
      designation: admin.designation,
    });

    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  /* =========================================================
     CANCEL EDIT
  ========================================================= */

  const handleCancelEdit = () => {
    setEditData({
      name: admin.name,
      phone: admin.phone,
      designation: admin.designation,
    });

    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  /* =========================================================
     UPDATE PROFILE
     PATCH /auth/profile
  ========================================================= */

  const handleSaveProfile = async () => {
    const name = editData.name.trim();
    const phone = editData.phone.trim();
    const designation = editData.designation.trim();

    if (!name) {
      setError("Full name is required.");
      return;
    }

    if (!designation) {
      setError("Designation is required.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        localStorage.removeItem("adminUser");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          designation,
        }),
      });

      const result = await response.json();

      /* Invalid / expired token */
      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/login");
        return;
      }

      if (!response.ok || !result.success) {
        setError(
          result.message || "Unable to update your profile."
        );
        return;
      }

      const updatedAdmin = result.admin || {
        ...admin,
        name,
        phone,
        designation,
      };

      const updatedProfile = {
        name: updatedAdmin.name || name,
        email: updatedAdmin.email || admin.email,
        role:
          updatedAdmin.role ||
          admin.role ||
          "Administrator",
        designation:
          updatedAdmin.designation || designation,
        phone: updatedAdmin.phone ?? phone,
        createdAt:
          updatedAdmin.createdAt || admin.createdAt,
        mustChangePassword:
          updatedAdmin.mustChangePassword ??
          admin.mustChangePassword,
      };

      setAdmin(updatedProfile);

      setEditData({
        name: updatedProfile.name,
        phone: updatedProfile.phone,
        designation: updatedProfile.designation,
      });

      localStorage.setItem(
        "adminUser",
        JSON.stringify(updatedAdmin)
      );

      setIsEditing(false);
      setSuccess("Profile updated successfully.");

      /* Refresh from backend */
      await fetchAdminProfile();
    } catch (saveError) {
      console.error("Update profile error:", saveError);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================================================
     BACK TO DASHBOARD
  ========================================================= */

  const handleBack = () => {
    navigate("/dashboard");
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  /* =========================================================
     DISPLAY VALUES
  ========================================================= */

  const displayName = admin.name?.trim() || "Admin";

  const displayDesignation =
    admin.designation?.trim() ||
    admin.role?.trim() ||
    "Administrator";

  /* =========================================================
     DETAIL CARD
  ========================================================= */

  const DetailCard = ({
    icon: Icon,
    label,
    value,
    editable = false,
    name,
    type = "text",
  }) => {
    return (
      <div
        className="
          rounded-xl
          border border-gray-200
          bg-gray-50/70
          p-4
          transition-colors
          dark:border-gray-800
          dark:bg-gray-800/40
        "
      >
        <div className="flex items-center gap-2">
          <Icon
            size={18}
            strokeWidth={1.8}
            className="text-gray-500 dark:text-gray-400"
          />

          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {label}
          </span>
        </div>

        {isEditing && editable ? (
          <input
            type={type}
            name={name}
            value={editData[name]}
            onChange={handleEditChange}
            className="
              mt-3
              w-full
              rounded-lg
              border border-gray-300
              bg-white
              px-3
              py-2.5
              text-sm
              font-medium
              text-gray-900
              outline-none
              transition
              focus:border-[#EF3B3A]
              focus:ring-4
              focus:ring-red-50
              dark:border-gray-700
              dark:bg-gray-900
              dark:text-white
            "
          />
        ) : (
          <p
            className="
              mt-3
              wrap-break-word
              text-sm
              font-medium
              text-gray-900
              dark:text-white
            "
          >
            {value || "Not available"}
          </p>
        )}
      </div>
    );
  };

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Main application area */}
        <div className="min-h-screen md:ml-64">
          <Header />

          <main
            className="
              flex
              min-h-[calc(100vh-5rem)]
              items-center
              justify-center
              px-4
            "
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <LoaderCircle
                size={30}
                className="animate-spin text-[#EF3B3A]"
              />

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading your profile...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* =====================================================
          FIXED SIDEBAR
      ===================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN APPLICATION AREA

          Sidebar width = w-64
          Therefore content starts after md:ml-64
      ===================================================== */}

      <div className="min-h-screen md:ml-64">
        {/* ===================================================
            EXISTING COMMON HEADER
        =================================================== */}

        <Header />

        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <main
          className="
            mx-auto
            w-full
            max-w-6xl
            px-6
            py-8
            max-[767px]:px-4
            max-[767px]:py-6
          "
        >
          {/* =================================================
              PAGE INTRO
          ================================================= */}

          <div className="mb-6">
            <p className="text-sm font-semibold text-[#EF3B3A]">
              Account
            </p>

            <h1
              className="
                mt-1
                text-2xl
                font-semibold
                tracking-tight
                text-gray-900
                dark:text-white
              "
            >
              My Profile
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your administrator profile information.
            </p>
          </div>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div
              className="
                mb-5
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                dark:border-red-900
                dark:bg-red-950/40
              "
            >
              <AlertCircle
                size={19}
                className="shrink-0 text-red-500"
              />

              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {success && (
            <div
              className="
                mb-5
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-green-200
                bg-green-50
                px-4
                py-3
                dark:border-green-900
                dark:bg-green-950/40
              "
            >
              <CheckCircle2
                size={19}
                className="shrink-0 text-green-600"
              />

              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                {success}
              </p>
            </div>
          )}

          {/* =================================================
              PROFILE CARD
          ================================================= */}

          <section
            className="
              relative
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-sm
              dark:border-gray-800
              dark:bg-gray-900
            "
          >
            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={handleBack}
              aria-label="Back to Dashboard"
              title="Back to Dashboard"
              className="
                absolute
                right-5
                top-5
                z-10
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-gray-200
                bg-white
                text-gray-500
                shadow-sm
                transition-all
                hover:border-gray-300
                hover:bg-gray-50
                hover:text-gray-900
                hover:shadow-md
                dark:border-gray-700
                dark:bg-gray-900
                dark:text-gray-300
                dark:hover:bg-gray-800
                dark:hover:text-white
                max-[639px]:right-4
                max-[639px]:top-4
              "
            >
              <ArrowLeft size={20} strokeWidth={1.8} />
            </button>

            {/* =================================================
                PROFILE INTRO
            ================================================= */}

            <div
              className="
                flex
                flex-col
                items-center
                border-b
                border-gray-200
                px-6
                pb-9
                pt-10
                text-center
                dark:border-gray-800
                max-[639px]:px-5
              "
            >
              <div
                className="
                  flex
                  h-24
                  w-24
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-gray-200
                  bg-gray-50
                  shadow-sm
                  dark:border-gray-700
                  dark:bg-gray-800
                "
              >
                <UserCircle
                  size={66}
                  strokeWidth={1.4}
                  className="text-gray-400 dark:text-gray-300"
                />
              </div>

              <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                {displayName}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {displayDesignation}
              </p>

              {admin.email && (
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  {admin.email}
                </p>
              )}
            </div>

            {/* =================================================
                ACCOUNT DETAILS
            ================================================= */}

            <div className="px-8 py-8 max-[767px]:px-5">
              <div className="mb-5 flex items-center justify-between gap-4 max-[639px]:items-start">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Account Details
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Your administrator account information.
                  </p>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="
                      inline-flex
                      shrink-0
                      items-center
                      gap-2
                      rounded-lg
                      border
                      border-gray-200
                      bg-white
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-gray-700
                      shadow-sm
                      transition-all
                      hover:border-gray-300
                      hover:bg-gray-50
                      hover:shadow
                      dark:border-gray-700
                      dark:bg-gray-900
                      dark:text-gray-200
                      dark:hover:bg-gray-800
                      max-[639px]:px-3
                    "
                  >
                    <Pencil
                      size={16}
                      strokeWidth={1.8}
                    />

                    <span className="max-[639px]:hidden">
                      Edit Profile
                    </span>

                    <span className="hidden max-[639px]:inline">
                      Edit
                    </span>
                  </button>
                ) : (
                  <div className="flex shrink-0 items-center gap-2 max-[639px]:flex-col max-[639px]:items-stretch">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-gray-200
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        font-medium
                        text-gray-700
                        transition-colors
                        hover:bg-gray-50
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        dark:border-gray-700
                        dark:bg-gray-900
                        dark:text-gray-300
                        dark:hover:bg-gray-800
                      "
                    >
                      <X size={16} />
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        bg-[#EF3B3A]
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-sm
                        transition-all
                        hover:bg-red-600
                        hover:shadow-md
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {isSaving ? (
                        <>
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />

                          Saving...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* =================================================
                  DETAILS GRID
              ================================================= */}

              <div className="grid grid-cols-2 gap-4 max-[767px]:grid-cols-1">
                {/* Full Name */}
                <DetailCard
                  icon={UserCircle}
                  label="Full Name"
                  value={admin.name}
                  editable
                  name="name"
                />

                {/* Email */}
                <DetailCard
                  icon={Mail}
                  label="Email"
                  value={admin.email}
                />

                {/* Designation */}
                <DetailCard
                  icon={BriefcaseBusiness}
                  label="Designation"
                  value={admin.designation}
                  editable
                  name="designation"
                />

                {/* Role */}
                <DetailCard
                  icon={ShieldCheck}
                  label="Role"
                  value={admin.role}
                />

                {/* Phone */}
                <DetailCard
                  icon={Phone}
                  label="Phone"
                  value={admin.phone}
                  editable
                  name="phone"
                  type="tel"
                />

                {/* Account Created */}
                <DetailCard
                  icon={CalendarDays}
                  label="Account Created"
                  value={formatDate(admin.createdAt)}
                />
              </div>

              {/* =================================================
                  ACCOUNT STATUS
              ================================================= */}

              <div className="mt-4">
                <div
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50/70
                    p-4
                    dark:border-gray-800
                    dark:bg-gray-800/40
                  "
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={18}
                      strokeWidth={1.8}
                      className="text-gray-500 dark:text-gray-400"
                    />

                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Account Status
                    </span>
                  </div>

                  <div className="mt-3">
                    {admin.mustChangePassword ? (
                      <span
                        className="
                          inline-flex
                          rounded-full
                          bg-amber-50
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-amber-700
                          dark:bg-amber-950/40
                          dark:text-amber-400
                        "
                      >
                        Password Update Required
                      </span>
                    ) : (
                      <span
                        className="
                          inline-flex
                          rounded-full
                          bg-green-50
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-green-700
                          dark:bg-green-950/40
                          dark:text-green-400
                        "
                      >
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* =================================================
                  EDIT INFORMATION
              ================================================= */}

              {isEditing && (
                <p className="mt-5 text-xs text-gray-500 dark:text-gray-400">
                  Email and role are managed by the administrator
                  system and cannot be changed from this page.
                </p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Profile;