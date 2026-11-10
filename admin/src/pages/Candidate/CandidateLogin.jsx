
import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import proliantLogo from "../../assets/logo/proliant black/proliant_black.png";

function CandidateLogin() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Connect the existing authentication API here.
  };

  const handleRegister = (event) => {
    event.preventDefault();

    if (!acceptedTerms) {
      alert("Please accept the Terms and Conditions.");
      return;
    }

    // Connect the candidate registration API here.
    console.log({ firstName, lastName, email, password });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-[#e9f0fd] py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50";

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* LEFT BRANDING SECTION */}
      <section className="relative hidden h-full w-5/12 shrink-0 overflow-hidden bg-[#DA3838] lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border-[80px] border-white/10" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full border-[90px] border-white/10" />

        <div className="pointer-events-none absolute bottom-24 right-16 h-24 w-24 rounded-full bg-white/5" />

        {/* Logo and branding */}
        <div className="relative z-10 px-12 pt-10 xl:px-16 xl:pt-12">
          <div className="inline-flex rounded-xl bg-white px-6 py-4">
            <img
              src={proliantLogo}
              alt="Proliant Data"
              className="h-auto w-44 object-contain"
            />
          </div>

          <div className="mt-16 max-w-lg xl:mt-20">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-white/90">
              Candidate Portal
            </p>

            <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
              {isRegister
                ? "Start your journey with Proliant."
                : "Your next opportunity starts here."}
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-white/90">
              {isRegister
                ? "Create your account, explore exciting job opportunities and take the next step in your career with Proliant."
                : "Explore exciting job opportunities, track your applications and take the next step in your career with Proliant."}
            </p>
          </div>
        </div>

        {/* Left footer */}
        <div className="relative z-10 px-12 pb-10 xl:px-16 xl:pb-12">
          <div className="mb-4 h-px w-20 bg-white/50" />
          <p className="text-sm text-white/80">
            Build your future with Proliant.
          </p>
        </div>
      </section>

      {/* RIGHT FORM SECTION */}
      <section className="flex h-full min-w-0 flex-1 items-center justify-center overflow-y-auto bg-white px-6 py-6 sm:px-10 lg:px-12 xl:px-16">
        <div
          className={`w-full max-w-lg ${
            isRegister ? "py-2" : ""
          }`}
        >
          {/* Mobile branding */}
          <div className="mb-6 flex flex-col items-center lg:hidden">
            <img
              src={proliantLogo}
              alt="Proliant Data"
              className="h-auto w-40 object-contain"
            />
            <p className="mt-2 text-sm font-medium text-gray-500">
              Candidate Portal
            </p>
          </div>

          {/* Forgot password placeholder */}
          {showForgotPassword ? (
            <div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="mb-6 text-sm font-medium text-gray-500 transition hover:text-[#EF3B3A]"
              >
                ← Back to Login
              </button>

              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EF3B3A]">
                Account Recovery
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Forgot your password?
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Password recovery will be available when candidate
                authentication is connected.
              </p>
            </div>
          ) : isRegister ? (
            <>
              {/* REGISTER HEADER */}
              <div className="mb-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#EF3B3A]">
                  Create an account
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Register as a Candidate
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Fill in your details to create your account and start
                  applying for opportunities at Proliant.
                </p>
              </div>

              {/* REGISTER FORM */}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="first-name"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      First Name *
                    </label>

                    <div className="relative">
                      <UserRound
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        id="first-name"
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        required
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="last-name"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Last Name *
                    </label>

                    <div className="relative">
                      <UserRound
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        id="last-name"
                        type="text"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        required
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="register-email"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Email Address *
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="register-password"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Password *
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  <p className="mt-1.5 text-xs leading-5 text-gray-500">
                    Use at least 8 characters with a mix of letters, numbers
                    and a special character.
                  </p>
                </div>

                <label className="flex items-start gap-3 pt-1 text-sm leading-5 text-gray-700">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#EF3B3A]"
                  />

                  <span>
                    I agree to the{" "}
                    <a
                      href="/terms"
                      className="font-medium text-[#EF3B3A] hover:underline"
                    >
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="font-medium text-[#EF3B3A] hover:underline"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#EF3B3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-100"
                >
                  Create Account
                </button>

                <p className="pt-1 text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="font-semibold text-[#EF3B3A] hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              </form>
            </>
          ) : (
            <>
              {/* LOGIN HEADER */}
              <div className="mb-9">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EF3B3A]">
                  Welcome back
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Sign in to your account
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                  Enter your credentials to access the Proliant candidate
                  portal.
                </p>
              </div>

              {/* LOGIN FORM */}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="candidate-email"
                    className="mb-2.5 block text-sm font-semibold text-gray-800"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="candidate-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className={`${inputClass} pl-12`}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="candidate-password"
                    className="mb-2.5 block text-sm font-semibold text-gray-800"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="candidate-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-8 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-medium text-gray-500 transition-colors hover:text-[#EF3B3A]"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#EF3B3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-100"
                >
                  Continue
                </button>
              </form>

              {/* REGISTER LINK */}
              <div className="mt-6 border border-gray-100 py-4 text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="font-semibold text-[#EF3B3A] hover:underline"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </>
          )}

          {/* FOOTER */}
          {!showForgotPassword && (
            <div className="mt-6 border-t border-gray-100 pt-5 text-center">
              <p className="text-xs text-gray-400">
                Secure access for registered Proliant candidates only
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default CandidateLogin;
