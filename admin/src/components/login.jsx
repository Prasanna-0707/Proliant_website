import proliantLogo from "../assets/logo/Proliant Black/proliant_black.png";
import ForgotPassword from "../pages/ForgotPassword";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

function Login({
  step,
  formData,
  showPassword,
  setShowPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  errors,
  setErrors,
  isLoading,
  showForgotPassword,
  setShowForgotPassword,
  handleChange,
  handleLogin,
  handleVerifyLoginOtp,
  handleChangePassword,
  handleBack,
  navigate,
}) {
  const renderError = () => {
    if (!errors.submit) return null;

    return (
      <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm font-medium text-red-600">
          {errors.submit}
        </p>
      </div>
    );
  };

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-white px-6 py-10 sm:px-10 lg:w-7/12 lg:px-16 xl:px-24">
      <div className="w-full max-w-lg">
        {/* Mobile Branding */}
        <div className="mb-12 flex flex-col items-center lg:hidden">
          <img
            src={proliantLogo}
            alt="Proliant"
            className="h-auto w-44 object-contain"
          />
          <p className="mt-2 text-sm font-medium text-gray-500">
            Admin Portal
          </p>
        </div>

        {/* Forgot Password */}
        {showForgotPassword ? (
          <ForgotPassword
            onBackToLogin={() => {
              setShowForgotPassword(false);
              setErrors({});
            }}
          />
        ) : (
          <>
            {/* Login */}
            {step === "login" && (
              <>
                <div className="mb-9">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EF3B3A]">
                    Welcome back
                  </p>

                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Sign in to your account
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                    Enter your credentials to access the Proliant admin portal.
                  </p>
                </div>

                {renderError()}

                <form onSubmit={handleLogin} noValidate>
                  <div className="mb-6">
                    <label
                      htmlFor="email"
                      className="mb-2.5 block text-sm font-semibold text-gray-800"
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail
                        size={19}
                        strokeWidth={1.8}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@proliant.com"
                        autoComplete="email"
                        className={`w-full rounded-lg border bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                          errors.email
                            ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                            : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                        }`}
                      />
                    </div>

                    {errors.email && (
                      <p className="mt-2 text-xs font-medium text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="mb-2.5 block text-sm font-semibold text-gray-800"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={19}
                        strokeWidth={1.8}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className={`w-full rounded-lg border bg-white py-3.5 pl-12 pr-12 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                          errors.password
                            ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                            : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((previous) => !previous)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff size={19} strokeWidth={1.8} />
                        ) : (
                          <Eye size={19} strokeWidth={1.8} />
                        )}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="mt-2 text-xs font-medium text-red-500">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="mb-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setErrors({});
                      }}
                      className="text-sm font-medium text-gray-500 transition-colors hover:text-[#EF3B3A]"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-[#EF3B3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? "Signing In..." : "Continue"}
                  </button>
                </form>
              </>
            )}

            {/* Login OTP */}
            {step === "login-otp" && (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#EF3B3A]"
                >
                  <ArrowLeft size={17} />
                  Back to Login
                </button>

                <div className="mb-9">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A]">
                    <ShieldCheck size={23} />
                  </div>

                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EF3B3A]">
                    Verification
                  </p>

                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Verify your login
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                    We've sent a 6-digit OTP to{" "}
                    <span className="font-semibold text-gray-700">
                      {formData.email}
                    </span>
                    .
                  </p>
                </div>

                {renderError()}

                <form onSubmit={handleVerifyLoginOtp} noValidate>
                  <div className="mb-6">
                    <label
                      htmlFor="login-otp"
                      className="mb-2.5 block text-sm font-semibold text-gray-800"
                    >
                      Verification Code
                    </label>

                    <input
                      id="login-otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter 6-digit OTP"
                      autoComplete="one-time-code"
                      className={`w-full rounded-lg border bg-white px-4 py-3.5 text-center text-lg font-semibold tracking-[0.35em] text-gray-900 outline-none transition focus:ring-4 ${
                        errors.otp
                          ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                          : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                      }`}
                    />

                    {errors.otp && (
                      <p className="mt-2 text-xs font-medium text-red-500">
                        {errors.otp}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-[#EF3B3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </button>
                </form>
              </>
            )}

            {/* Change Password */}
            {step === "change-password" && (
              <>
                <div className="mb-9">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A]">
                    <LockKeyhole size={23} />
                  </div>

                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EF3B3A]">
                    Security Update
                  </p>

                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Create your password
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                    Your account is using a temporary password. Please create a new password to continue.
                  </p>
                </div>

                {renderError()}

                <form onSubmit={handleChangePassword} noValidate>
                  <div className="mb-6">
                    <label
                      htmlFor="newPassword"
                      className="mb-2.5 block text-sm font-semibold text-gray-800"
                    >
                      New Password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={19}
                        strokeWidth={1.8}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        className={`w-full rounded-lg border bg-white py-3.5 pl-12 pr-12 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                          errors.newPassword
                            ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                            : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword((previous) => !previous)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <EyeOff size={19} strokeWidth={1.8} />
                        ) : (
                          <Eye size={19} strokeWidth={1.8} />
                        )}
                      </button>
                    </div>

                    {errors.newPassword && (
                      <p className="mt-2 text-xs font-medium text-red-500">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="mb-8">
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2.5 block text-sm font-semibold text-gray-800"
                    >
                      Confirm Password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={19}
                        strokeWidth={1.8}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        className={`w-full rounded-lg border bg-white py-3.5 pl-12 pr-12 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                          errors.confirmPassword
                            ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                            : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((previous) => !previous)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                        aria-label={
                          showConfirmPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={19} strokeWidth={1.8} />
                        ) : (
                          <Eye size={19} strokeWidth={1.8} />
                        )}
                      </button>
                    </div>

                    {errors.confirmPassword && (
                      <p className="mt-2 text-xs font-medium text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-[#EF3B3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? "Updating Password..." : "Change Password"}
                  </button>
                </form>
              </>
            )}

            {/* Password Success */}
            {step === "password-success" && (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <CheckCircle2 size={34} />
                </div>

                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EF3B3A]">
                  Password Updated
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Password changed successfully
                </h2>

                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                  Your password has been updated. You can now continue to your dashboard.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="mt-8 w-full rounded-lg bg-[#EF3B3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-100"
                >
                  Continue to Dashboard
                </button>
              </div>
            )}
          </>
        )}

        {!showForgotPassword &&
          (step === "login" ||
            step === "login-otp" ||
            step === "change-password") && (
            <div className="mt-10 border-t border-gray-100 pt-6 text-center">
              <p className="text-xs text-gray-400">
                Secure access for authorized Proliant administrators
              </p>
            </div>
          )}
      </div>
    </section>
  );
}

export default Login;