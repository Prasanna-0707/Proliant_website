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

import proliantLogo from "../../assets/logo/Proliant Black/proliant_black.png";
import ForgotPassword from "./ForgotPassword";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const initialFormData = {
  email: "",
  password: "",
  otp: "",
  newPassword: "",
  confirmPassword: "",
};

function Login() {
  const navigate = useNavigate();

  const [step, setStep] = useState("login");
  const [formData, setFormData] = useState(initialFormData);

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Handle input changes
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

  // Validate email and password
  const validateLogin = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // POST /api/auth/login
  const handleLogin = async (event) => {
    event.preventDefault();

    if (!validateLogin()) return;

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
          submit: result.message || "Invalid email or password.",
        });
        return;
      }

      // JWT is returned only after OTP verification.
      localStorage.removeItem("adminToken");

      setFormData((previous) => ({
        ...previous,
        otp: "",
      }));

      setStep("login-otp");
    } catch (error) {
      console.error("Login error:", error);

      setErrors({
        submit: "Unable to connect to the server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // POST /api/auth/verify-login-otp
  const handleVerifyLoginOtp = async (event) => {
    event.preventDefault();

    const otp = formData.otp.trim();
    const nextErrors = {};

    if (!otp) {
      nextErrors.otp = "OTP is required.";
    } else if (!/^\d{6}$/.test(otp)) {
      nextErrors.otp = "Enter the 6-digit OTP.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    // Development-only OTP shortcut retained from existing code.
    if (import.meta.env.DEV && otp === "123456") {
      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          name: "Proliant User",
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

      if (!result.token) {
        setErrors({
          submit:
            "OTP verified, but no authentication token was returned.",
        });
        return;
      }

      localStorage.setItem("adminToken", result.token);

      if (result.admin) {
        localStorage.setItem(
          "adminUser",
          JSON.stringify(result.admin)
        );
      }

      if (result.admin?.mustChangePassword) {
        setStep("change-password");
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Login OTP verification error:", error);

      setErrors({
        submit: "Unable to verify OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // PATCH /api/auth/change-password
  const handleChangePassword = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!formData.newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (formData.newPassword.length < 8) {
      nextErrors.newPassword =
        "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword =
        "Please confirm your new password.";
    } else if (
      formData.newPassword !== formData.confirmPassword
    ) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setErrors({
          submit: "Your session has expired. Please login again.",
        });

        setStep("login");
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
            currentPassword: formData.password,
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

      if (result.admin) {
        localStorage.setItem(
          "adminUser",
          JSON.stringify(result.admin)
        );
      } else {
        const storedUser = localStorage.getItem("adminUser");

        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);

            user.mustChangePassword = false;

            localStorage.setItem(
              "adminUser",
              JSON.stringify(user)
            );
          } catch (parseError) {
            console.error(
              "Unable to update stored user:",
              parseError
            );
          }
        }
      }

      setStep("password-success");
    } catch (error) {
      console.error("Change password error:", error);

      setErrors({
        submit: "Unable to connect to the server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Back button handling
  const handleBack = () => {
    setErrors({});

    if (step === "login-otp") {
      setStep("login");

      setFormData((previous) => ({
        ...previous,
        otp: "",
      }));
    }
  };

  // Error message
  const renderError = () => {
    if (!errors.submit) return null;

    return (
      <div
        role="alert"
        className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
      >
        <p className="text-sm font-medium text-red-600">
          {errors.submit}
        </p>
      </div>
    );
  };

  const inputClass = (hasError, extra = "") =>
    `w-full rounded-lg border bg-white py-3.5 text-sm text-gray-900 outline-none transition focus:ring-4 ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
        : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
    } ${extra}`;

  const renderFieldError = (name) =>
    errors[name] ? (
      <p className="mt-2 text-xs font-medium text-red-500">
        {errors[name]}
      </p>
    ) : null;

  return (
    <main className="flex min-h-screen bg-gray-50">
      {/* Shared left branding panel */}
      <section className="relative hidden min-h-screen w-5/12 overflow-hidden bg-[#DA3838] lg:flex lg:flex-col lg:justify-between">
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
              Hiring Portal
            </p>

            <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
              Bringing great people and opportunities together.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-white/80">
              A single, secure workspace to manage hiring,
              candidates, interviews, and recruitment activities.
            </p>
          </div>
        </div>

        <div className="relative z-10 px-12 pb-10 xl:px-16">
          <div className="mb-5 h-px w-full bg-white/20" />

          <p className="text-xs leading-5 text-white/70">
            Proliant Hiring Portal · Secure access for authorized users
          </p>
        </div>
      </section>

      {/* Right login section */}
      <section className="flex min-h-screen w-full items-center justify-center bg-white px-6 py-10 sm:px-10 lg:w-7/12 lg:px-16 xl:px-24">
        <div className="w-full max-w-lg">
          {/* Mobile branding */}
          <div className="mb-10 flex flex-col items-center lg:hidden">
            <img
              src={proliantLogo}
              alt="Proliant"
              className="h-auto w-44 object-contain"
            />

            <p className="mt-2 text-sm font-medium text-gray-500">
              Hiring Portal
            </p>
          </div>

          {showForgotPassword ? (
            <ForgotPassword
              onBackToLogin={() => {
                setShowForgotPassword(false);
                setErrors({});
              }}
            />
          ) : (
            <>
              {/* Login screen */}
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
                      Enter your work credentials to access the
                      Proliant Hiring Portal.
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
                          placeholder="name@proliant.com"
                          autoComplete="email"
                          aria-invalid={Boolean(errors.email)}
                          className={inputClass(
                            Boolean(errors.email),
                            "pl-12 pr-4"
                          )}
                        />
                      </div>

                      {renderFieldError("email")}
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
                          aria-invalid={Boolean(errors.password)}
                          className={inputClass(
                            Boolean(errors.password),
                            "pl-12 pr-12"
                          )}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((previous) => !previous)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={19} strokeWidth={1.8} />
                          ) : (
                            <Eye size={19} strokeWidth={1.8} />
                          )}
                        </button>
                      </div>

                      {renderFieldError("password")}
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

              {/* OTP verification screen */}
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
                      We&apos;ve sent a 6-digit OTP to{" "}
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
                        aria-invalid={Boolean(errors.otp)}
                        className={inputClass(
                          Boolean(errors.otp),
                          "px-4 text-center text-lg font-semibold tracking-[0.35em]"
                        )}
                      />

                      {renderFieldError("otp")}
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

              {/* Change password screen */}
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
                      Your account is using a temporary password. Please
                      create a new password to continue.
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
                          aria-invalid={Boolean(errors.newPassword)}
                          className={inputClass(
                            Boolean(errors.newPassword),
                            "pl-12 pr-12"
                          )}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword((previous) => !previous)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                          aria-label={
                            showNewPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showNewPassword ? (
                            <EyeOff size={19} strokeWidth={1.8} />
                          ) : (
                            <Eye size={19} strokeWidth={1.8} />
                          )}
                        </button>
                      </div>

                      {renderFieldError("newPassword")}
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
                          aria-invalid={Boolean(errors.confirmPassword)}
                          className={inputClass(
                            Boolean(errors.confirmPassword),
                            "pl-12 pr-12"
                          )}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((previous) => !previous)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={19} strokeWidth={1.8} />
                          ) : (
                            <Eye size={19} strokeWidth={1.8} />
                          )}
                        </button>
                      </div>

                      {renderFieldError("confirmPassword")}
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

              {/* Password success screen */}
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
                    Your password has been updated. You can now continue to
                    your dashboard.
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
            ["login", "login-otp", "change-password"].includes(step) && (
              <div className="mt-10 border-t border-gray-100 pt-6 text-center">
                <p className="text-xs text-gray-400">
                  Secure access for authorized Proliant Recruitment Portal users
                </p>
              </div>
            )}
        </div>
      </section>
    </main>
  );
}

export default Login;