import { useState } from "react";

import {
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
} from "../../services/candidatePortal.js";

const inputClass =
  "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50";

const buttonClass =
  "w-full rounded-xl bg-[#EF3B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#d93231] disabled:cursor-not-allowed disabled:opacity-60";

// Three steps: email -> OTP -> new password.
export default function CandidatePasswordReset({ onBack }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const run = async (action) => {
    setBusy(true);
    setError("");
    setInfo("");

    try {
      await action();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const sendCode = (event) => {
    event?.preventDefault();

    return run(async () => {
      const result = await requestPasswordReset(email.trim());

      setInfo(result.message);
      setStep("otp");
    });
  };

  const verifyCode = (event) => {
    event.preventDefault();

    return run(async () => {
      const result = await verifyPasswordResetOtp(email.trim(), otp.trim());

      setResetToken(result.resetToken);
      setStep("password");
    });
  };

  const savePassword = (event) => {
    event.preventDefault();

    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }

    return run(async () => {
      const result = await resetPassword({
        email: email.trim(),
        resetToken,
        newPassword: password,
      });

      setInfo(result.message);
      setStep("done");
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-sm font-medium text-gray-500 transition hover:text-[#EF3B3A]"
      >
        ← Back to Login
      </button>

      <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EF3B3A]">
        Account Recovery
      </p>

      <h2 className="text-3xl font-bold tracking-tight text-gray-900">
        {step === "done" ? "Password updated" : "Forgot your password?"}
      </h2>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {info && step !== "email" && (
        <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {info}
        </p>
      )}

      {step === "email" && (
        <form onSubmit={sendCode} className="mt-5 space-y-4">
          <p className="text-sm leading-6 text-gray-500">
            Enter the email address of your candidate account. We will send you
            a 6-digit verification code.
          </p>

          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className={inputClass}
          />

          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? "Sending..." : "Send verification code"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyCode} className="mt-5 space-y-4">
          <p className="text-sm leading-6 text-gray-500">
            Enter the 6-digit code sent to <strong>{email}</strong>. It expires
            in 5 minutes.
          </p>

          <input
            required
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className={`${inputClass} text-center tracking-[0.5em]`}
          />

          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? "Verifying..." : "Verify code"}
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => sendCode()}
            className="w-full text-sm font-medium text-gray-500 hover:text-[#EF3B3A]"
          >
            Resend code
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={savePassword} className="mt-5 space-y-4">
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New password (min. 8 characters)"
            autoComplete="new-password"
            className={inputClass}
          />

          <input
            required
            type="password"
            minLength={8}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            className={inputClass}
          />

          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? "Saving..." : "Set new password"}
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-gray-500">
            You can now sign in with your new password. A confirmation email
            was sent to you.
          </p>

          <button type="button" onClick={onBack} className={buttonClass}>
            Back to sign in
          </button>
        </div>
      )}
    </div>
  );
}
