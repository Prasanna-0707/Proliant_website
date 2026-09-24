
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  UserCircle,
  LogOut,
  KeyRound,
  User,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

import ThemeTogglerButton from "./ThemeTogglerButton";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function Header() {
  const navigate = useNavigate();

  // Profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);

  // Admin data
  const [admin, setAdmin] = useState({
    name: "Admin",
    email: "",
    role: "Administrator",
    designation: "Administrator",
    phone: "",
  });

  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);

  // Change password modal
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch admin profile
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const storedAdmin = localStorage.getItem("adminUser");

        // Use localStorage as fallback
        if (storedAdmin) {
          try {
            const parsedAdmin = JSON.parse(storedAdmin);

            setAdmin((previous) => ({
              ...previous,
              ...parsedAdmin,
              name: parsedAdmin.name || previous.name,
              email: parsedAdmin.email || previous.email,
              role: parsedAdmin.role || previous.role,
              designation:
                parsedAdmin.designation || previous.designation,
              phone: parsedAdmin.phone || previous.phone,
            }));
          } catch (error) {
            console.error("Failed to parse stored admin:", error);
          }
        }

        if (!token) {
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success || !result.admin) {
          return;
        }

        const adminData = result.admin;

        setAdmin((previous) => ({
          ...previous,
          ...adminData,
          name: adminData.name || previous.name,
          email: adminData.email || previous.email,
          role: adminData.role || previous.role,
          designation:
            adminData.designation || previous.designation,
          phone: adminData.phone || previous.phone,
        }));

        localStorage.setItem(
          "adminUser",
          JSON.stringify(adminData)
        );
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
      } finally {
        setIsLoadingAdmin(false);
      }
    };

    fetchAdminProfile();
  }, []);

  // Password input change
  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  };

  // Open change password
  const openChangePassword = () => {
    setProfileOpen(false);
    setPasswordError("");
    setPasswordSuccess("");
    setChangePasswordOpen(true);
  };

  // Close change password
  const closeChangePassword = () => {
    if (isChangingPassword) return;

    setChangePasswordOpen(false);

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
    setPasswordSuccess("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // Change password API
  const handleChangePassword = async () => {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from the current password."
      );
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordError("");
      setPasswordSuccess("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setPasswordError(
          "Your session has expired. Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/auth/change-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setPasswordError(
          result.message || "Failed to change password."
        );
        return;
      }

      setPasswordSuccess(
        result.message || "Password changed successfully."
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error("Change password error:", error);

      setPasswordError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Navigate to profile
  const handleProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  // Logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");

      window.location.href = "/login";
    }
  };

  // Display values
  const displayName = admin.name?.trim() || "Admin";

  const displayDesignation =
    admin.designation?.trim() ||
    admin.role?.trim() ||
    "Administrator";

  return (
    <>
      {/* ================= HEADER ================= */}

      <header
        className="
          relative
          flex
          h-20
          items-center
          justify-between
          border-b
          border-gray-200
          bg-white
          px-6
          max-[767px]:h-17
          max-[767px]:px-4
          dark:border-gray-700
          dark:bg-gray-900
        "
      >
        {/* Page Title */}

        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Admin Portal
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your Proliant operations
          </p>
        </div>

        {/* Right Side */}

        <div className="flex items-center gap-4 max-[767px]:gap-2">
          {/* Notifications */}

          <button
            type="button"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              text-gray-500
              transition-colors
              hover:bg-gray-100
              hover:text-gray-900
              dark:text-gray-300
              dark:hover:bg-gray-800
              dark:hover:text-white
            "
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={2} />
          </button>

          {/* Theme Toggle */}

          <ThemeTogglerButton />

          {/* Divider */}

          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Admin Profile */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setProfileOpen((previous) => !previous)
              }
              className="
                flex
                items-center
                gap-3
                rounded-lg
                px-2
                py-1.5
                transition-colors
                hover:bg-gray-50
                dark:hover:bg-gray-800
              "
              aria-expanded={profileOpen}
              aria-label="Admin profile menu"
            >
              <UserCircle
                size={40}
                strokeWidth={1.8}
                className="shrink-0 text-gray-500 dark:text-gray-300"
              />

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {isLoadingAdmin ? "Loading..." : displayName}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {displayDesignation}
                </p>
              </div>
            </button>

            {/* Profile Dropdown */}

            {profileOpen && (
              <>
                {/* Click outside to close */}

                <button
                  type="button"
                  aria-label="Close profile menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setProfileOpen(false)}
                />

                <div
                  className="
                    absolute
                    right-0
                    top-full
                    z-20
                    mt-2
                    w-56
                    overflow-hidden
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    shadow-xl
                    dark:border-gray-700
                    dark:bg-gray-900
                  "
                >
                  {/* Profile */}

                  <button
                    type="button"
                    onClick={handleProfile}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      px-4
                      py-4
                      text-sm
                      font-medium
                      text-gray-600
                      transition-colors
                      hover:bg-gray-50
                      hover:text-gray-900
                      dark:text-gray-300
                      dark:hover:bg-gray-800
                      dark:hover:text-white
                    "
                  >
                    <User size={19} strokeWidth={2} />
                    <span>Profile</span>
                  </button>

                  {/* Change Password */}

                  <button
                    type="button"
                    onClick={openChangePassword}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      border-t
                      border-gray-100
                      px-4
                      py-4
                      text-sm
                      font-medium
                      text-gray-600
                      transition-colors
                      hover:bg-gray-50
                      hover:text-gray-900
                      dark:border-gray-700
                      dark:text-gray-300
                      dark:hover:bg-gray-800
                      dark:hover:text-white
                    "
                  >
                    <KeyRound size={19} strokeWidth={2} />
                    <span>Change Password</span>
                  </button>

                  {/* Mobile Logout */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      hidden
                      w-full
                      items-center
                      gap-3
                      border-t
                      border-gray-100
                      px-4
                      py-4
                      text-sm
                      font-medium
                      text-gray-600
                      transition-colors
                      hover:bg-gray-50
                      hover:text-gray-900
                      max-[767px]:flex
                      dark:border-gray-700
                      dark:text-gray-300
                      dark:hover:bg-gray-800
                      dark:hover:text-white
                    "
                  >
                    <LogOut size={19} strokeWidth={2} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ================= CHANGE PASSWORD MODAL ================= */}

      {changePasswordOpen && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            overflow-y-auto
            bg-black/30
            px-4
            py-6
            backdrop-blur-md
          "
          onClick={closeChangePassword}
        >
          <div
            className="
              my-auto
              w-full
              max-w-md
              rounded-2xl
              bg-white
              p-6
              shadow-2xl
              dark:bg-gray-900
            "
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update your administrator password.
                </p>
              </div>

              <button
                type="button"
                onClick={closeChangePassword}
                disabled={isChangingPassword}
                className="
                  rounded-lg
                  p-2
                  text-gray-400
                  hover:bg-gray-100
                  hover:text-gray-700
                  disabled:opacity-50
                  dark:hover:bg-gray-800
                  dark:hover:text-white
                "
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error */}

            {passwordError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {passwordError}
                </p>
              </div>
            )}

            {/* Success */}

            {passwordSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  {passwordSuccess}
                </p>
              </div>
            )}

            {/* Current Password */}

            <div className="mb-4">
              <label
                htmlFor="currentPassword"
                className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                Current Password
              </label>

              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    pr-11
                    text-sm
                    text-gray-900
                    outline-none
                    focus:border-[#EF3B3A]
                    dark:border-gray-700
                    dark:bg-gray-800
                    dark:text-white
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label={
                    showCurrentPassword
                      ? "Hide current password"
                      : "Show current password"
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}

            <div className="mb-4">
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    pr-11
                    text-sm
                    text-gray-900
                    outline-none
                    focus:border-[#EF3B3A]
                    dark:border-gray-700
                    dark:bg-gray-800
                    dark:text-white
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label={
                    showNewPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                >
                  {showNewPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    pr-11
                    text-sm
                    text-gray-900
                    outline-none
                    focus:border-[#EF3B3A]
                    dark:border-gray-700
                    dark:bg-gray-800
                    dark:text-white
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeChangePassword}
                disabled={isChangingPassword}
                className="
                  rounded-lg
                  border
                  border-gray-300
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-gray-700
                  hover:bg-gray-50
                  disabled:opacity-50
                  dark:border-gray-700
                  dark:text-gray-300
                  dark:hover:bg-gray-800
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="
                  rounded-lg
                  bg-[#EF3B3A]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-red-600
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {isChangingPassword
                  ? "Updating..."
                  : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;