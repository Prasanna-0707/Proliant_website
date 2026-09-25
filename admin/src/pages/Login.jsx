import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import proliantLogo from "../assets/logo/proliant black/proliant_black.png";

import ForgotPassword from "./ForgotPassword";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();

  const [step, setStep] = useState("login");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
     LOGIN VALIDATION
  ----------------------------------------- */

  const validateLogin = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* -----------------------------------------
     LOGIN
     POST /api/auth/login
     Backend verifies password and sends OTP.
  ----------------------------------------- */

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!validateLogin()) {
      return;
    }

    setIsLoading(true);

    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrors({
          submit:
            result.message || "Invalid email or password.",
        });

        return;
      }

      /*
       * Backend /auth/login verifies the password
       * and sends the OTP.
       *
       * The JWT is returned only after the OTP is
       * verified through /auth/verify-login-otp.
       */

      setStep("login-otp");
    } catch (error) {
      console.error("Login error:", error);

      setErrors({
        submit:
          "Unable to connect to the server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* -----------------------------------------
     VERIFY LOGIN OTP
     POST /api/auth/verify-login-otp
  ----------------------------------------- */

  const handleVerifyLoginOtp = async (event) => {
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

    if (import.meta.env.DEV && otp === "123456") {
      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          name: "Proliant Admin",
          email: formData.email.trim(),
          role: "Admin",
          mustChangePassword: false,
        })
      );

      navigate("/dashboard");

      return;
    }

    setIsLoading(true);

    setErrors({});

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/verify-login-otp`,
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

      /*
       * The real verify-login-otp API returns
       * the JWT after successful OTP verification.
       */

      if (result.token) {
        localStorage.setItem("adminToken", result.token);
      }

      if (result.admin) {
        localStorage.setItem(
          "adminUser",
          JSON.stringify(result.admin)
        );
      }

      /*
       * mustChangePassword flow
       */

      if (result.admin?.mustChangePassword) {
        setStep("change-password");

        return;
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Login OTP verification error:",
        error
      );

      setErrors({
        submit:
          "Unable to verify OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* -----------------------------------------
     CHANGE PASSWORD
     PATCH /api/auth/change-password
     JWT received after login OTP is used here.
  ----------------------------------------- */

  const handleChangePassword = async (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword =
        "New password is required.";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword =
        "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your new password.";
    } else if (
      formData.newPassword !==
      formData.confirmPassword
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
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_BASE_URL}/auth/change-password`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            newPassword: formData.newPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrors({
          submit:
            result.message ||
            "Unable to change password. Please try again.",
        });

        return;
      }

      /*
       * Update stored admin information if backend
       * returns the updated admin.
       */

      if (result.admin) {
        localStorage.setItem(
          "adminUser",
          JSON.stringify(result.admin)
        );
      } else {
        const storedAdmin =
          localStorage.getItem("adminUser");

        if (storedAdmin) {
          try {
            const admin = JSON.parse(storedAdmin);

            admin.mustChangePassword = false;

            localStorage.setItem(
              "adminUser",
              JSON.stringify(admin)
            );
          } catch (error) {
            console.error(
              "Unable to update stored admin:",
              error
            );
          }
        }
      }

      setStep("password-success");
    } catch (error) {
      console.error("Change password error:", error);

      setErrors({
        submit:
          "Unable to connect to the server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* -----------------------------------------
     BACK HANDLING
  ----------------------------------------- */

  const handleBack = () => {
    setErrors({});

    if (step === "login-otp") {
      setStep("login");

      setFormData((previous) => ({
        ...previous,
        otp: "",
      }));

      return;
    }

    if (step === "login") {
      return;
    }
  };

  /* -----------------------------------------
     ERROR MESSAGE
  ----------------------------------------- */

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
    <div className="flex min-h-screen bg-gray-50">
      {/* -----------------------------------------
          LEFT BRANDING
      ----------------------------------------- */}

      <section className="relative hidden min-h-screen w-5/12 overflow-hidden bg-[#EF3B3A] lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border-80 border-white/10" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-128 w-lg rounded-full border-90 border-white/10" />

        <div className="pointer-events-none absolute bottom-24 right-16 h-24 w-24 rounded-full bg-white/5" />

        <div className="relative z-10 px-12 pt-12 xl:px-16 xl:pt-14">
          <div className="inline-flex rounded-xl bg-white px-6 py-4">
            <img
              src={proliantLogo}
              alt="Proliant"
              className="h-auto w-44 object-contain"
            />
          </div>

          <div className="mt-20 max-w-lg">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
              Admin Portal
            </p>

            <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
              Manage your organization with confidence.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-white/80">
              Access employees, job postings, candidates and
              enquiries from one secure administration portal.
            </p>
          </div>
        </div>

        <div className="relative z-10 px-12 pb-12 xl:px-16 xl:pb-14">
          <div className="mb-4 h-px w-20 bg-white/40" />

          <p className="text-sm text-white/70">
            Authorized Proliant personnel only
          </p>
        </div>
      </section>

      {/* -----------------------------------------
          RIGHT SIDE
      ----------------------------------------- */}

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

          {/* =========================================
              FORGOT PASSWORD
          ========================================= */}

          {showForgotPassword ? (
            <ForgotPassword
              onBackToLogin={() => {
                setShowForgotPassword(false);
                setErrors({});
              }}
            />
          ) : (
            <>
              {/* =====================================
                  LOGIN
              ===================================== */}

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
                      Enter your credentials to access the
                      Proliant admin portal.
                    </p>
                  </div>

                  {renderError()}

                  <form
                    onSubmit={handleLogin}
                    noValidate
                  >
                    {/* Email */}

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

                    {/* Password */}

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
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
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

                    {/* Forgot Password */}

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

                    {renderError()}

                    {/* Sign In */}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-lg bg-[#EF3B3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isLoading
                        ? "Signing In..."
                        : "Continue"}
                    </button>
                  </form>
                </>
              )}

              {/* =====================================
                  LOGIN OTP
              ===================================== */}

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

                  <form
                    onSubmit={handleVerifyLoginOtp}
                    noValidate
                  >
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
                      {isLoading
                        ? "Verifying..."
                        : "Verify & Continue"}
                    </button>
                  </form>
                </>
              )}

              {/* =====================================
                  MUST CHANGE PASSWORD
              ===================================== */}

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
                      Your account is using a temporary password.
                      Please create a new password to continue.
                    </p>
                  </div>

                  {renderError()}

                  <form
                    onSubmit={handleChangePassword}
                    noValidate
                  >
                    {/* New Password */}

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
                          type={
                            showNewPassword
                              ? "text"
                              : "password"
                          }
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
                            setShowNewPassword(
                              (previous) => !previous
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                          aria-label={
                            showNewPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showNewPassword ? (
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

                      {errors.newPassword && (
                        <p className="mt-2 text-xs font-medium text-red-500">
                          {errors.newPassword}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}

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
                        ? "Updating Password..."
                        : "Change Password"}
                    </button>
                  </form>
                </>
              )}

              {/* =====================================
                  PASSWORD SUCCESS
              ===================================== */}

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
                    Your password has been updated. You can now
                    continue to your dashboard.
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

          {/* Footer */}

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
    </div>
  );
}

export default Login;