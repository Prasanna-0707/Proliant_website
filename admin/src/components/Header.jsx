import { useState } from "react";
import {
  Bell,
  UserCircle,
  KeyRound,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

import ThemeTogglerButton from "./ThemeTogglerButton";

function Header() {
  const [profileOpen, setProfileOpen] = useState(false);

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    // Password API can be connected here later.
    alert("Password changed successfully.");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setChangePasswordOpen(false);
  };

  return (
    <>
      {/* =========================================================
          HEADER
      ========================================================== */}
      <header className="fixed right-0 top-0 z-30 ml-64 flex h-20 w-[calc(100%-16rem)] items-center justify-end border-b border-gray-200 bg-white px-6 transition-colors dark:border-gray-800 dark:bg-gray-900 max-[767px]:ml-0 max-[767px]:w-full max-[767px]:px-4">
        <div className="flex items-center gap-4">

          {/* =====================================================
              THEME TOGGLER
          ====================================================== */}
          <div className="flex items-center justify-center">
            <ThemeTogglerButton
              className="
                h-10 w-10 rounded-lg
                border border-gray-200
                bg-white
                text-gray-600
                shadow-sm
                transition-all
                hover:bg-gray-100
                hover:text-gray-900

                dark:border-gray-600
                dark:bg-gray-800
                dark:text-gray-100
                dark:shadow-md
                dark:hover:border-gray-500
                dark:hover:bg-gray-700
                dark:hover:text-white
              "
            />
          </div>

          {/* =====================================================
              NOTIFICATION
          ====================================================== */}
          <button
            type="button"
            className="
              flex h-10 w-10 items-center justify-center
              rounded-lg
              text-gray-500
              transition-colors
              hover:bg-gray-100
              hover:text-gray-900

              dark:text-gray-300
              dark:hover:bg-gray-800
              dark:hover:text-white
            "
          >
            <Bell size={20} strokeWidth={2} />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

          {/* =====================================================
              PROFILE
          ====================================================== */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="
                flex items-center gap-3
                rounded-lg
                px-2 py-1.5
                transition-colors
                hover:bg-gray-50

                dark:hover:bg-gray-800
              "
            >
              <UserCircle
                size={40}
                strokeWidth={1.8}
                className="
                  text-gray-500
                  dark:text-gray-300
                "
              />

              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Admin
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Administrator
                </p>
              </div>
            </button>

            {/* ===================================================
                PROFILE DROPDOWN
            ==================================================== */}
            {profileOpen && (
              <div
                className="
                  absolute right-0 top-full mt-2
                  w-56
                  overflow-hidden
                  rounded-xl
                  border border-gray-200
                  bg-white
                  shadow-xl

                  dark:border-gray-700
                  dark:bg-gray-900
                "
              >
                {/* Profile information */}
                <div
                  className="
                    border-b border-gray-100
                    px-4 py-3

                    dark:border-gray-700
                  "
                >
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
                  className="
                    flex w-full items-center gap-3
                    px-4 py-3
                    text-sm font-medium
                    text-gray-600
                    transition-colors
                    hover:bg-gray-50
                    hover:text-gray-900

                    dark:text-gray-300
                    dark:hover:bg-gray-800
                    dark:hover:text-white
                  "
                >
                  <KeyRound size={18} strokeWidth={2} />
                  <span>Change Password</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================
          CHANGE PASSWORD MODAL
      ========================================================== */}
      {changePasswordOpen && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            bg-black/30
            px-4
            backdrop-blur-md
          "
          onClick={() => setChangePasswordOpen(false)}
        >
          <div
            className="
              w-full max-w-md
              rounded-2xl
              bg-white
              shadow-2xl

              dark:border
              dark:border-gray-700
              dark:bg-gray-900
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* ===================================================
                MODAL HEADER
            ==================================================== */}
            <div
              className="
                flex items-center justify-between
                border-b border-gray-100
                px-6 py-5

                dark:border-gray-700
              "
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update your administrator password.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setChangePasswordOpen(false)}
                className="
                  flex h-8 w-8
                  items-center justify-center
                  rounded-lg
                  text-gray-400
                  transition-colors
                  hover:bg-gray-100
                  hover:text-gray-700

                  dark:hover:bg-gray-800
                  dark:hover:text-white
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* ===================================================
                FORM
            ==================================================== */}
            <form
              onSubmit={handleChangePassword}
              className="space-y-5 px-6 py-6"
            >
              {/* Current Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Current Password
                </label>

                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="
                      w-full
                      rounded-lg
                      border border-gray-300
                      bg-white
                      px-4 py-3 pr-11
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-[#EF3B3A]
                      focus:ring-2
                      focus:ring-red-100

                      dark:border-gray-700
                      dark:bg-gray-800
                      dark:text-white
                      dark:placeholder:text-gray-500
                      dark:focus:ring-red-950
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword((prev) => !prev)
                    }
                    className="
                      absolute right-3 top-1/2
                      -translate-y-1/2
                      text-gray-400
                      hover:text-gray-700

                      dark:hover:text-white
                    "
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
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  New Password
                </label>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="
                      w-full
                      rounded-lg
                      border border-gray-300
                      bg-white
                      px-4 py-3 pr-11
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-[#EF3B3A]
                      focus:ring-2
                      focus:ring-red-100

                      dark:border-gray-700
                      dark:bg-gray-800
                      dark:text-white
                      dark:placeholder:text-gray-500
                      dark:focus:ring-red-950
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword((prev) => !prev)
                    }
                    className="
                      absolute right-3 top-1/2
                      -translate-y-1/2
                      text-gray-400
                      hover:text-gray-700

                      dark:hover:text-white
                    "
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
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Confirm New Password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                    className="
                      w-full
                      rounded-lg
                      border border-gray-300
                      bg-white
                      px-4 py-3 pr-11
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-[#EF3B3A]
                      focus:ring-2
                      focus:ring-red-100

                      dark:border-gray-700
                      dark:bg-gray-800
                      dark:text-white
                      dark:placeholder:text-gray-500
                      dark:focus:ring-red-950
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="
                      absolute right-3 top-1/2
                      -translate-y-1/2
                      text-gray-400
                      hover:text-gray-700

                      dark:hover:text-white
                    "
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* =================================================
                  BUTTONS
              ================================================== */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setChangePasswordOpen(false)}
                  className="
                    rounded-lg
                    border border-gray-300
                    px-4 py-2.5
                    text-sm font-medium
                    text-gray-600
                    transition-colors
                    hover:bg-gray-50

                    dark:border-gray-700
                    dark:text-gray-300
                    dark:hover:bg-gray-800
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="
                    rounded-lg
                    bg-[#EF3B3A]
                    px-4 py-2.5
                    text-sm font-medium
                    text-white
                    transition-colors
                    hover:bg-[#d92f2e]
                  "
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;