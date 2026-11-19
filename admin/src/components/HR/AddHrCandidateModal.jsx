import { useState } from "react";

import Modal, {
  Field,
  inputClass,
  primaryButton,
  secondaryButton,
} from "../common/Modal";
import { createHrCandidate } from "../../services/registrations.js";

const NOTICE_PERIODS = ["Immediately", "30 Days", "60 Days", "90 Days"];

const blank = {
  name: "",
  email: "",
  phone: "",
  position: "",
  areaOfInterest: "",
  isFresher: "false",
  yearsOfExperience: "",
  highestQualification: "",
  currentCompany: "",
  location: "",
  noticePeriod: "30 Days",
  coverMessage: "",
};

// POST /api/hr-candidates: HR records an application manually.
export default function AddHrCandidateModal({ onClose, onCreated }) {
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (event) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const body = {
        ...form,
        isFresher: form.isFresher === "true",
        yearsOfExperience:
          form.yearsOfExperience === "" ? undefined : Number(form.yearsOfExperience),
      };

      await createHrCandidate(body);
      onCreated();
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  };

  return (
    <Modal title="Add candidate" wide onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {[
          ["name", "Name", true],
          ["email", "Email", true, "email"],
          ["phone", "Phone", true],
          ["position", "Position applied for", true],
          ["areaOfInterest", "Area of interest", true],
          ["highestQualification", "Highest qualification", true],
          ["currentCompany", "Current company"],
          ["location", "Location"],
        ].map(([key, label, required, type]) => (
          <Field key={key} label={label}>
            <input
              required={required}
              type={type || "text"}
              value={form[key]}
              onChange={set(key)}
              className={inputClass}
            />
          </Field>
        ))}

        <Field label="Experience level">
          <select value={form.isFresher} onChange={set("isFresher")} className={inputClass}>
            <option value="false">Experienced</option>
            <option value="true">Fresher</option>
          </select>
        </Field>

        <Field label="Years of experience">
          <input
            type="number"
            min="0"
            value={form.yearsOfExperience}
            onChange={set("yearsOfExperience")}
            className={inputClass}
          />
        </Field>

        <Field label="Notice period">
          <select value={form.noticePeriod} onChange={set("noticePeriod")} className={inputClass}>
            {NOTICE_PERIODS.map((period) => (
              <option key={period}>{period}</option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Cover message">
            <textarea rows={3} value={form.coverMessage} onChange={set("coverMessage")} className={inputClass} />
          </Field>
        </div>

        {error && (
          <p className="text-sm text-red-600 sm:col-span-2" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 sm:col-span-2">
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={primaryButton}>
            {saving ? "Saving..." : "Add candidate"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
