import { useMemo, useState } from "react";
import { ClipboardList, Plus, Trash2 } from "lucide-react";

import useApi from "../../services/useApi.js";
import {
  listEvaluationForms,
  createEvaluationForm,
  updateEvaluationFormDraft,
  setEvaluationFormStatus,
} from "../../services/interviews.js";
import { listJobsWithManagers } from "../../services/hiringAssignments.js";
import { formatDate } from "../../services/format.js";

import DataState, { EmptyState } from "../../components/StateMessage";
import Modal, {
  Field,
  inputClass,
  primaryButton,
  secondaryButton,
} from "../../components/common/Modal";

const RESPONSE_TYPES = ["RATING", "TEXT", "RATING_AND_TEXT", "YES_NO"];

const STATUS_STYLES = {
  Draft: "bg-amber-50 text-amber-700",
  Published: "bg-emerald-50 text-emerald-700",
  Archived: "bg-gray-100 text-gray-600",
};

const blankQuestion = (index) => ({
  questionCode: `Q${index + 1}`,
  category: "General",
  questionText: "",
  helpText: "",
  responseType: "RATING_AND_TEXT",
  isRequired: true,
});

const blankForm = () => ({
  stageCode: "L1",
  stageName: "L1 Interview",
  formName: "",
  description: "",
  job: "",
  questions: [blankQuestion(0)],
});

// HR / Global Administrator: define the evaluation forms interviewers use.
export default function EvaluationForms() {
  const [statusFilter, setStatusFilter] = useState("");

  const forms = useApi(
    (signal) => listEvaluationForms({ status: statusFilter }, signal),
    [statusFilter]
  );
  const jobs = useApi((signal) => listJobsWithManagers(signal), []);

  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const jobTitle = useMemo(() => {
    const map = new Map((jobs.data?.jobs || []).map((job) => [job._id, job.title]));
    return (id) => (id ? map.get(id) || "Specific job" : "All jobs (default)");
  }, [jobs.data]);

  const openCreate = () => {
    setError("");
    setEditor({ mode: "create", form: blankForm() });
  };

  const openEdit = (item) => {
    setError("");
    setEditor({
      mode: "edit",
      id: item._id,
      form: {
        stageCode: item.stageCode,
        stageName: item.stageName,
        formName: item.formName,
        description: item.description || "",
        job: item.job || "",
        questions: (item.questions || []).map((question) => ({ ...question })),
      },
    });
  };

  const setField = (key) => (event) =>
    setEditor((previous) => ({
      ...previous,
      form: { ...previous.form, [key]: event.target.value },
    }));

  const setQuestion = (index, key, value) =>
    setEditor((previous) => ({
      ...previous,
      form: {
        ...previous.form,
        questions: previous.form.questions.map((question, position) =>
          position === index ? { ...question, [key]: value } : question
        ),
      },
    }));

  const addQuestion = () =>
    setEditor((previous) => ({
      ...previous,
      form: {
        ...previous.form,
        questions: [
          ...previous.form.questions,
          blankQuestion(previous.form.questions.length),
        ],
      },
    }));

  const removeQuestion = (index) =>
    setEditor((previous) => ({
      ...previous,
      form: {
        ...previous.form,
        questions: previous.form.questions.filter(
          (_, position) => position !== index
        ),
      },
    }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const { form } = editor;

      const body = {
        ...form,
        job: form.job || null,
        questions: form.questions.map((question, index) => ({
          ...question,
          displayOrder: index,
        })),
      };

      if (editor.mode === "create") {
        await createEvaluationForm(body);
      } else {
        // The stage cannot change on an existing form.
        delete body.stageCode;
        delete body.job;
        await updateEvaluationFormDraft(editor.id, body);
      }

      setEditor(null);
      setMessage({ type: "success", text: "Evaluation form saved." });
      forms.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (item, status) => {
    try {
      const result = await setEvaluationFormStatus(item._id, status);
      setMessage({ type: "success", text: result.message });
      forms.reload();
    } catch (requestError) {
      setMessage({ type: "error", text: requestError.message });
    }
  };

  const list = forms.data?.forms || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <ClipboardList size={24} className="text-red-500" />
            Evaluation Forms
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Interviewers fill the published form for the interview stage.
            Publishing a form archives the previous published version.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className={`${primaryButton} flex items-center gap-2`}
        >
          <Plus size={16} />
          New form
        </button>
      </div>

      {message.text && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={`${inputClass} sm:w-48`}
          >
            <option value="">All statuses</option>
            <option>Draft</option>
            <option>Published</option>
            <option>Archived</option>
          </select>
        </div>

        <DataState loading={forms.loading} error={forms.error} onRetry={forms.reload}>
          {list.length === 0 ? (
            <EmptyState text="No evaluation forms yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
                  <tr>
                    {["Form", "Stage", "Job", "Version", "Questions", "Status", "Updated", "Actions"].map(
                      (heading) => (
                        <th key={heading} className="px-4 py-3 font-semibold">
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {list.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {item.formName}
                      </td>
                      <td className="px-4 py-3">{item.stageCode}</td>
                      <td className="px-4 py-3">{jobTitle(item.job)}</td>
                      <td className="px-4 py-3">v{item.version}</td>
                      <td className="px-4 py-3">{item.questions?.length || 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            STATUS_STYLES[item.status] || ""
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatDate(item.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3 text-xs font-medium">
                          {item.status === "Draft" && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                className="text-blue-600 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => changeStatus(item, "Published")}
                                className="text-emerald-600 hover:underline"
                              >
                                Publish
                              </button>
                            </>
                          )}
                          {item.status === "Published" && (
                            <button
                              type="button"
                              onClick={() => changeStatus(item, "Archived")}
                              className="text-red-600 hover:underline"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataState>
      </div>

      {editor && (
        <Modal
          wide
          title={editor.mode === "create" ? "New evaluation form" : "Edit draft form"}
          onClose={() => setEditor(null)}
        >
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Stage code" hint="Letters, numbers, _ and - (e.g. L1)">
                <input
                  required
                  disabled={editor.mode === "edit"}
                  value={editor.form.stageCode}
                  onChange={setField("stageCode")}
                  className={inputClass}
                />
              </Field>

              <Field label="Stage name">
                <input
                  required
                  value={editor.form.stageName}
                  onChange={setField("stageName")}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Form name">
              <input
                required
                value={editor.form.formName}
                onChange={setField("formName")}
                className={inputClass}
              />
            </Field>

            <Field label="Description">
              <textarea
                rows={2}
                value={editor.form.description}
                onChange={setField("description")}
                className={inputClass}
              />
            </Field>

            {editor.mode === "create" && (
              <Field label="Job" hint="Leave empty for the default form of this stage">
                <select
                  value={editor.form.job}
                  onChange={setField("job")}
                  className={inputClass}
                >
                  <option value="">All jobs (default)</option>
                  {(jobs.data?.jobs || []).map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Questions</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  + Add question
                </button>
              </div>

              {editor.form.questions.map((question, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Code">
                      <input
                        required
                        value={question.questionCode}
                        onChange={(event) =>
                          setQuestion(index, "questionCode", event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Category">
                      <input
                        value={question.category}
                        onChange={(event) =>
                          setQuestion(index, "category", event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Response type">
                      <select
                        value={question.responseType}
                        onChange={(event) =>
                          setQuestion(index, "responseType", event.target.value)
                        }
                        className={inputClass}
                      >
                        {RESPONSE_TYPES.map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Question">
                    <textarea
                      required
                      rows={2}
                      value={question.questionText}
                      onChange={(event) =>
                        setQuestion(index, "questionText", event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Help text">
                    <input
                      value={question.helpText}
                      onChange={(event) =>
                        setQuestion(index, "helpText", event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={question.isRequired !== false}
                        onChange={(event) =>
                          setQuestion(index, "isRequired", event.target.checked)
                        }
                      />
                      Required
                    </label>

                    {editor.form.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        aria-label="Remove question"
                        className="text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditor(null)} className={secondaryButton}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className={primaryButton}>
                {saving ? "Saving..." : "Save draft"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
