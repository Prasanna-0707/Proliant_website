import { useState } from "react";
import { useNavigate } from "react-router-dom";
import proliantLogo from "../assets/logo/Proliant Black/proliant_black.png";
import LoginForm from "../components/Login";

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

  const validateLogin = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /*
   * POST /api/auth/login
   * Password is verified and an OTP is sent.
   * JWT is returned only after OTP verification.
   */
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

  /*
   * POST /api/auth/verify-login-otp
   * Backend returns token and admin information.
   */
  const handleVerifyLoginOtp = async (event) => {
    event.preventDefault();

    const otp = formData.otp.trim();
    const newErrors = {};

    if (!otp) {
      newErrors.otp = "OTP is required.";
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = "Enter the 6-digit OTP.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Development-only OTP shortcut.
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

  /*
   * PATCH /api/auth/change-password
   * Uses the JWT received after OTP verification.
   */
  const handleChangePassword = async (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword =
        "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your new password.";
    } else if (
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
        const storedAdmin = localStorage.getItem("adminUser");

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* LEFT BRANDING SECTION — original UI preserved */}
      <section className="relative hidden min-h-screen w-5/12 overflow-hidden bg-[#DA3838] lg:flex lg:flex-col lg:justify-between">
        {/* Decorative Circles */}
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
              Access employees, job postings, candidates and enquiries
              from one secure administration portal.
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

      {/* RIGHT SIDE — reusable form component */}
      <LoginForm
        step={step}
        formData={formData}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showNewPassword={showNewPassword}
        setShowNewPassword={setShowNewPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        errors={errors}
        setErrors={setErrors}
        isLoading={isLoading}
        showForgotPassword={showForgotPassword}
        setShowForgotPassword={setShowForgotPassword}
        handleChange={handleChange}
        handleLogin={handleLogin}
        handleVerifyLoginOtp={handleVerifyLoginOtp}
        handleChangePassword={handleChangePassword}
        handleBack={handleBack}
        navigate={navigate}
      />
    </div>
  );
}

export default Login;