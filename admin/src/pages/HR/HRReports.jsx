import { useState } from "react";
import { Mail } from "lucide-react";

import RecruitmentStatistics from "../../components/DeptAdmin/RecruitmentStatistics.jsx";
import {
  getRecruitmentSummary,
  emailRecruitmentSummary,
} from "../../services/registrations.js";
import { inputClass, primaryButton } from "../../components/common/Modal";

// Aggregate email panel. Only counts are sent: never candidate names,
// contact details or interview feedback. The email is sent when HR presses
// the button; nothing is scheduled automatically (the reporting frequency is
// still to be confirmed by management).
function EmailPanel({ params }) {
  const [recipients, setRecipients] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const send = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage({ type: "", text: "" });

    try {
      const list = recipients
        .split(/[\s,;]+/)
        .map((item) => item.trim())
        .filter(Boolean);

      const result = await emailRecruitmentSummary({ ...params, recipients: list });

      setMessage({ type: "success", text: result.message });
    } catch (requestError) {
      setMessage({ type: "error", text: requestError.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={send}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-1 flex items-center gap-2 text-base font-bold sm:text-lg">
        <Mail size={18} /> Email this summary
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Sends the table above (with the current filters) to the recipients. The
        email contains aggregate counts only, with no candidate-level information.
        Reports are sent manually; there is no automatic schedule.
      </p>

      <label className="block text-sm">
        <span className="mb-1 block text-xs font-medium text-slate-500">
          Recipient email addresses (comma or space separated, up to 20)
        </span>
        <textarea
          required
          rows={2}
          value={recipients}
          onChange={(event) => setRecipients(event.target.value)}
          className={inputClass}
        />
      </label>

      <div className="mt-4 flex items-center gap-4">
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? "Sending..." : "Send summary"}
        </button>

        {message.text && (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={`text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}
          >
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}

export default function HRReports() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Recruitment Reports
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Organization-wide and department-wise recruitment statistics. Share them
          by email when a Department Head cannot sign in regularly.
        </p>
      </div>

      <RecruitmentStatistics
        fetcher={getRecruitmentSummary}
        renderFooter={(params) => <EmailPanel params={params} />}
      />
    </div>
  );
}
