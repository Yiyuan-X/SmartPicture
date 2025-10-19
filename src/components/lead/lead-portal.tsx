"use client";

import { useMemo, useState } from "react";
import { leadPortalConfig } from "@/data/lead-portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Field =
  | {
      name: string;
      label: string;
      type: "text" | "email";
      required?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "textarea";
      required?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "select";
      required?: boolean;
      options: string[];
    }
  | {
      name: string;
      label: string;
      type: "multiselect";
      required?: boolean;
      options: string[];
    };

type LeadForm = (typeof leadPortalConfig.forms)[number];

function getFieldInitialValue(field: Field) {
  if (field.type === "select") {
    return "";
  }
  if (field.type === "multiselect") {
    return [] as string[];
  }
  return "";
}

export function LeadPortalActions() {
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formsMap = useMemo(() => {
    const record = new Map<string, LeadForm>();
    for (const form of leadPortalConfig.forms) {
      record.set(form.id, form);
    }
    return record;
  }, []);

  const [formState, setFormState] = useState<Record<string, Record<string, unknown>>>(() => {
    const initial: Record<string, Record<string, unknown>> = {};
    for (const form of leadPortalConfig.forms) {
      const state: Record<string, unknown> = {};
      for (const field of form.fields) {
        state[field.name] = getFieldInitialValue(field as Field);
      }
      initial[form.id] = state;
    }
    return initial;
  });

  const activeForm = activeFormId ? formsMap.get(activeFormId) : null;

  const handleInputChange = (formId: string, field: Field, value: unknown) => {
    setFormState((prev) => ({
      ...prev,
      [formId]: {
        ...prev[formId],
        [field.name]: value,
      },
    }));
  };

  const handleClose = () => {
    setActiveFormId(null);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeForm) return;
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const payload: Record<string, unknown> = {
        ...formState[activeForm.id],
        ...activeForm.submit.payload,
      };

      const response = await fetch(activeForm.submit.api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`提交失败，状态码 ${response.status}`);
      }

      setSuccessMessage(activeForm.submit.success_message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "提交失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
        {leadPortalConfig.triggers.buttons.map((button) => (
          <Button
            type="button"
            key={button.form_id}
            onClick={() => {
              setActiveFormId(button.form_id);
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className={
              button.style === "primary"
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                : button.style === "secondary"
                  ? "border-orange-300 text-orange-600 hover:bg-orange-50"
                  : "bg-gradient-to-r from-orange-100 to-orange-300 text-orange-700 hover:from-orange-200 hover:to-orange-400"
            }
            variant={button.style === "secondary" ? "outline" : "default"}
          >
            {button.label}
          </Button>
        ))}
      </div>

      {activeForm ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl border border-orange-200 bg-white p-6 shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-orange-300">
            <div className="max-h-[80vh] overflow-y-auto pr-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{activeForm.title}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                    {activeForm.description}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  关闭
                </Button>
              </div>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              {activeForm.fields.map((rawField) => {
                const field = rawField as Field;
                const value = formState[activeForm.id]?.[field.name] ?? "";
                if (field.type === "textarea") {
                  return (
                    <div key={field.name} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700" htmlFor={`${activeForm.id}-${field.name}`}>
                        {field.label}
                        {field.required ? <span className="ml-1 text-red-500">*</span> : null}
                      </label>
                      <Textarea
                        id={`${activeForm.id}-${field.name}`}
                        value={String(value ?? "")}
                        onChange={(event) =>
                          handleInputChange(activeForm.id, field, event.currentTarget.value)
                        }
                        rows={4}
                        required={field.required}
                        className="w-full"
                      />
                    </div>
                  );
                }

                if (field.type === "select") {
                  const selectValue = String(value ?? "");
                  return (
                    <div key={field.name} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700" htmlFor={`${activeForm.id}-${field.name}`}>
                        {field.label}
                        {field.required ? <span className="ml-1 text-red-500">*</span> : null}
                      </label>
                      <select
                        id={`${activeForm.id}-${field.name}`}
                        required={field.required}
                        value={selectValue}
                        onChange={(event) => {
                          handleInputChange(activeForm.id, field, event.currentTarget.value);
                        }}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      >
                        <option value="">请选择</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (field.type === "multiselect") {
                  const selectValue = Array.isArray(value) ? value.map(String) : [];
                  return (
                    <div key={field.name} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700" htmlFor={`${activeForm.id}-${field.name}`}>
                        {field.label}
                        {field.required ? <span className="ml-1 text-red-500">*</span> : null}
                      </label>
                      <select
                        id={`${activeForm.id}-${field.name}`}
                        multiple
                        required={field.required}
                        value={selectValue}
                        onChange={(event) => {
                          const options = Array.from(event.currentTarget.selectedOptions).map(
                            (option) => option.value
                          );
                          handleInputChange(activeForm.id, field, options);
                        }}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={field.name} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor={`${activeForm.id}-${field.name}`}>
                      {field.label}
                      {field.required ? <span className="ml-1 text-red-500">*</span> : null}
                    </label>
                    <Input
                      id={`${activeForm.id}-${field.name}`}
                      type={field.type}
                      required={field.required}
                      value={String(value ?? "")}
                      onChange={(event) =>
                        handleInputChange(activeForm.id, field, event.currentTarget.value)
                      }
                    />
                  </div>
                );
              })}

              {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
              {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                {isSubmitting ? "提交中…" : "提交"}
              </Button>
            </form>

            <div className="mt-6 rounded-xl border border-dashed border-orange-200 bg-orange-50/60 p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-800">直接联系</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="font-medium">邮箱：</span>
                  <a
                    href={`mailto:${activeForm.contact.email}`}
                    className="text-orange-600 hover:underline"
                  >
                    {activeForm.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="font-medium">微信：</span>
                  <img
                    src={activeForm.contact.wechat_qr}
                    alt="微信二维码"
                    className="h-20 w-20 rounded-lg border border-orange-100 object-cover"
                  />
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
