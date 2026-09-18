import { useState } from "react";
import {
  Bell,
  UserCircle,
  LogOut,
  KeyRound,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

import ThemeTogglerButton from "./ThemeTogglerButton";
import proliantLogo from "../assets/logo/proliant black/proliant_black.png";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function Header() {
  const [profileOpen, setProfileOpen] = useState(false);
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

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordError("");
      setPasswordSuccess("");

      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

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
    } catch (error) {
      console.error("Change password error:", error);

      setPasswordError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

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

  const closeChangePassword = () => {
    setChangePasswordOpen(false);

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
    setPasswordSuccess("");
  };

  return (
    <>
      <header className="relative flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6 max-[767px]:h-17 max-[767px]:px-4 dark:border-gray-700 dark:bg-gray-900">
        
        <div className="flex h-11 items-center rounded-lg bg-white px-3">
          <img
            src={proliantLogo}
            alt="Proliant"
            className="h-auto w-28 object-contain"
          />
        </div>
         
         <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />
       
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
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
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
              onClick={() => setProfileOpen((previous) => !previous)}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <UserCircle
                size={40}
                strokeWidth={1.8}
                className="text-gray-500 dark:text-gray-300"
              />

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Admin
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Administrator
                </p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                {/* Profile Information */}
                <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Admin
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Administrator
                  </p>
                </div>

                {/* Change Password */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    setChangePasswordOpen(true);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <KeyRound size={18} strokeWidth={2} />
                  <span>Change Password</span>
                </button>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <LogOut size={18} strokeWidth={2} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {changePasswordOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-md"
          onClick={closeChangePassword}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
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
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error */}
            {passwordError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-600">
                  {passwordError}
                </p>
              </div>
            )}

            {/* Success */}
            {passwordSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm font-medium text-green-600">
                  {passwordSuccess}
                </p>
              </div>
            )}

            {/* Current Password */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                Current Password
              </label>

              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-11 text-sm text-gray-900 outline-none focus:border-[#EF3B3A] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
              <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-11 text-sm text-gray-900 outline-none focus:border-[#EF3B3A] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
              <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-11 text-sm text-gray-900 outline-none focus:border-[#EF3B3A] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeChangePassword}
                disabled={isChangingPassword}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
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