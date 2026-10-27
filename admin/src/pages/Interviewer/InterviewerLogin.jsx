import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import proliantLogo from "../../assets/logo/proliant black/proliant_black.png";

function InterviewerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    // UI preview only.
    // Connect interviewer authentication to your API here.
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* LEFT BRANDING SECTION */}
      <section className="relative hidden min-h-screen w-5/12 overflow-hidden bg-[#DA3838] lg:flex lg:flex-col lg:justify-between">
        {/* Decorative Circles */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border-[80px] border-white/10" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full border-[90px] border-white/10" />

        <div className="pointer-events-none absolute bottom-24 right-16 h-24 w-24 rounded-full bg-white/5" />

        {/* Logo and Branding */}
        <div className="relative z-10 px-12 pt-12 xl:px-16 xl:pt-14">
          <div className="inline-flex rounded-xl bg-white px-6 py-4">
            <img
              src={proliantLogo}
              alt="Proliant Data"
              className="h-auto w-44 object-contain"
            />
          </div>

          <div className="mt-20 max-w-lg">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
              Interviewer Portal
            </p>

            <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
              Find the right talent, together.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-white/80">
              Review candidates, manage interview schedules
              and share feedback with the Proliant hiring team.
            </p>
          </div>
        </div>

        {/* LEFT FOOTER */}
        <div className="relative z-10 px-12 pb-12 xl:px-16 xl:pb-14">
          <div className="mb-4 h-px w-20 bg-white/40" />

          <p className="text-sm text-white/70">
            Help build great teams with Proliant.
          </p>
        </div>
      </section>

      {/* RIGHT LOGIN SECTION */}
      <section className="flex min-h-screen w-full items-center justify-center bg-white px-6 py-10 sm:px-10 lg:w-7/12 lg:px-16 xl:px-24">
        <div className="w-full max-w-lg">
          {/* Mobile Branding */}
          <div className="mb-12 flex flex-col items-center lg:hidden">
            <img
              src={proliantLogo}
              alt="Proliant Data"
              className="h-auto w-44 object-contain"
            />

            <p className="mt-2 text-sm font-medium text-gray-500">
              Interviewer Portal
            </p>
          </div>

          {/* FORGOT PASSWORD SECTION */}
          {showForgotPassword ? (
            <div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="mb-8 text-sm font-medium text-gray-500 transition-colors hover:text-[#EF3B3A]"
              >
                ← Back to Login
              </button>

              <div className="mb-9">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EF3B3A]">
                  Account Recovery
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Forgot your password?
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                  Password recovery will be available when
                  interviewer authentication is connected.
                </p>
              </div>
            </div>
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
                  Enter your credentials to access the
                  Proliant interviewer portal.
                </p>
              </div>

              {/* LOGIN FORM */}
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-6">
                  <label
                    htmlFor="interviewer-email"
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
                      id="interviewer-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@proliant.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label
                    htmlFor="interviewer-password"
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
                      id="interviewer-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white py-3.5 pl-12 pr-12 text-sm text-gray-900 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
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
                </div>

                {/* Forgot Password */}
                <div className="mb-8 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-medium text-gray-500 transition-colors hover:text-[#EF3B3A]"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Continue Button */}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#EF3B3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-100"
                >
                  Continue
                </button>
              </form>
            </>
          )}

          {/* RIGHT FOOTER */}
          {!showForgotPassword && (
            <div className="mt-10 border-t border-gray-100 pt-6 text-center">
              <p className="text-xs text-gray-400">
                Secure access for authorized Proliant interviewers only
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default InterviewerLogin;