import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import proliantLogo from "../assets/logo/proliant black/proliant_black.png";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("Login form:", formData);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Branding Section */}
      <section className="relative hidden min-h-screen w-5/12 overflow-hidden bg-[#EF3B3A] lg:flex lg:flex-col lg:justify-between">
        {/* Decorative Circles */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border-80 border-white/10" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-128 w-lg rounded-full border-90 border-white/10" />

        <div className="pointer-events-none absolute bottom-24 right-16 h-24 w-24 rounded-full bg-white/5" />

        {/* Branding Content */}
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
              Access employees, job postings, candidates and enquiries from
              one secure administration portal.
            </p>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="relative z-10 px-12 pb-12 xl:px-16 xl:pb-14">
          <div className="mb-4 h-px w-20 bg-white/40" />

          <p className="text-sm text-white/70">
            Authorized Proliant personnel only
          </p>
        </div>
      </section>

      {/* Right Login Section */}
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

          {/* Heading */}
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
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
                  onClick={() => setShowPassword((previous) => !previous)}
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
                className="text-sm font-medium text-gray-500 transition-colors hover:text-[#EF3B3A]"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#EF3B3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-100"
            >
              Sign In
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 border-t border-gray-100 pt-6 text-center">
            <p className="text-xs text-gray-400">
              Secure access for authorized Proliant administrators
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;