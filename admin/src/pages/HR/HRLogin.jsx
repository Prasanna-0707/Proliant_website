import React from "react";
import LoginLeftPanel from "../../components/LoginLeftPanel";

function HRLogin() {
  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Reusable Left Branding Panel */}
      <LoginLeftPanel
        portalName="HR Portal"
        heading="Build your workforce with confidence."
        description="Manage candidates, job openings, interviews, and recruitment activities from one centralized HR portal."
        footerText="Secure access for authorized HR personnel"
      />

      {/* HR Login Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Logo / Heading */}
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#DA3838]">
              HR Portal
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              Welcome back
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to access your HR dashboard.
            </p>
          </div>

          {/* Login Form UI */}
          <form
            onSubmit={(e) => {
              e.preventDefault();

              // HR login API integration will be added later.
            }}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#DA3838] focus:ring-2 focus:ring-red-100"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#DA3838] focus:ring-2 focus:ring-red-100"
              />
            </div>

            {/* Remember Me / Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="h-4 w-4 rounded border-gray-300 accent-[#DA3838]"
                />

                Remember me
              </label>

              <button
                type="button"
                className="text-sm font-medium text-[#DA3838] hover:underline"
                onClick={() => {
                  // Forgot password flow can be added later.
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#DA3838] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              Sign In
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Proliant. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
export default HRLogin;

// function HRLogin() {
//   return (
//     <div className="min-h-screen bg-red-500 p-10 text-white">
//       <h1 className="text-4xl font-bold">
//         HR LOGIN PAGE WORKING
//       </h1>
//     </div>
//   );
// }



// export default HRLogin;