import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function ForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState("email");

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      submit: "",
    }));
  };

  /* -----------------------------------------
     SEND RESET OTP

     POST /api/auth/forgot-password
  ----------------------------------------- */

  const handleSendOtp = async (event) => {
    event.preventDefault();

    const email = formData.email.trim();

    if (!email) {
      setErrors({
        email: "Email address is required.",
      });

      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({
        email: "Enter a valid email address.",
      });

      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrors({
          submit:
            result.message ||
            "Unable to send OTP. Please try again.",
        });

        return;
      }

      setStep("otp");
    } catch (error) {
      console.error("Forgot password error:", error);

      setErrors({
        submit:
          "Unable to connect to the server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* -----------------------------------------
     VERIFY RESET OTP

     POST /api/auth/verify-reset-otp
  ----------------------------------------- */

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    const otp = formData.otp.trim();

    if (!otp) {
      setErrors({
        otp: "OTP is required.",
      });

      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setErrors({
        otp: "Enter the 6-digit OTP.",
      });

      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/verify-reset-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            otp,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrors({
          submit:
            result.message ||
            "Invalid or expired OTP. Please try again.",
        });

        return;
      }

      setStep("password");
    } catch (error) {
      console.error("Reset OTP verification error:", error);

      setErrors({
        submit:
          "Unable to verify OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* -----------------------------------------
     RESET PASSWORD

     POST /api/auth/reset-password
  ----------------------------------------- */

  const handleResetPassword = async (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formData.password) {
      newErrors.password =
        "New password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your new password.";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            otp: formData.otp.trim(),
            password: formData.password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrors({
          submit:
            result.message ||
            "Unable to reset password. Please try again.",
        });

        return;
      }

      setStep("success");
    } catch (error) {
      console.error("Reset password error:", error);

      setErrors({
        submit:
          "Unable to connect to the server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setErrors({});

    if (step === "email") {
      onBackToLogin();
      return;
    }

    if (step === "otp") {
      setStep("email");
      return;
    }

    if (step === "password") {
      setStep("otp");
    }
  };

  const renderError = () => {
    if (!errors.submit) {
      return null;
    }

    return (
      <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm font-medium text-red-600">
          {errors.submit}
        </p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-lg">
      {/* Back */}

      <button
        type="button"
        onClick={handleBack}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#EF3B3A]"
      >
        <ArrowLeft size={17} />
        Back to Login
      </button>

      {/* =====================================
          EMAIL
      ===================================== */}

      {step === "email" && (
        <>
          <div className="mb-9">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A]">
              <Mail size={23} />
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EF3B3A]">
              Forgot Password
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Reset your password
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
              Enter your registered email address and we'll send
              you a verification OTP.
            </p>
          </div>

          {renderError()}

          <form onSubmit={handleSendOtp} noValidate>
            <div className="mb-6">
              <label
                htmlFor="reset-email"
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
                  id="reset-email"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#EF3B3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading
                ? "Sending OTP..."
                : "Send OTP"}
            </button>
          </form>
        </>
      )}

      {/* =====================================
          OTP
      ===================================== */}

      {step === "otp" && (
        <>
          <div className="mb-9">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A]">
              <ShieldCheck size={23} />
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EF3B3A]">
              Verification
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Enter OTP
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

          <form onSubmit={handleVerifyOtp} noValidate>
            <div className="mb-6">
              <label
                htmlFor="reset-otp"
                className="mb-2.5 block text-sm font-semibold text-gray-800"
              >
                Verification Code
              </label>

              <input
                id="reset-otp"
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
              {isLoading
                ? "Verifying..."
                : "Verify OTP"}
            </button>
          </form>
        </>
      )}

      {/* =====================================
          NEW PASSWORD
      ===================================== */}

      {step === "password" && (
        <>
          <div className="mb-9">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#EF3B3A]">
              <LockKeyhole size={23} />
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EF3B3A]">
              New Password
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Create a new password
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
              Your OTP has been verified. Enter your new password
              below.
            </p>
          </div>

          {renderError()}

          <form
            onSubmit={handleResetPassword}
            noValidate
          >
            {/* New Password */}

            <div className="mb-6">
              <label
                htmlFor="reset-password"
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
                  id="reset-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className={`w-full rounded-lg border bg-white py-3.5 pl-12 pr-12 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                    errors.password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                      : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={19}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Eye
                      size={19}
                      strokeWidth={1.8}
                    />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}

            <div className="mb-8">
              <label
                htmlFor="reset-confirm-password"
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
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
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
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      size={19}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Eye
                      size={19}
                      strokeWidth={1.8}
                    />
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
              {isLoading
                ? "Resetting Password..."
                : "Reset Password"}
            </button>
          </form>
        </>
      )}

      {/* =====================================
          SUCCESS
      ===================================== */}

      {step === "success" && (
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
            Your password has been updated successfully. You can
            now sign in using your new password.
          </p>

          <button
            type="button"
            onClick={onBackToLogin}
            className="mt-8 w-full rounded-lg bg-[#EF3B3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-100"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;