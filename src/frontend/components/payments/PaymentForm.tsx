"use client";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Info,
  Loader2,
  Lock,
  Plus,
  ReceiptText,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useToast } from "@/frontend/providers/ToastProvider";
import { CategoryIcon } from "@/frontend/components/ui/CategoryIcon";
import { ClientApiError, apiRequest } from "@/frontend/lib/api";
import {
  CATEGORY_DEFINITIONS,
  CATEGORY_FIELDS,
  PAYMENT_CATEGORIES,
  PAYMENT_PLATFORMS,
  type PaymentCategory,
} from "@/models/domain";
import { formatCurrency, formatDate, formatFileSize } from "@/frontend/lib/format";
import { todayIsoDate } from "@/models/validation/date";
import { transactionInputSchema } from "@/models/validation/transaction";
import { zodFieldErrors } from "@/models/validation/zod-errors";
import type { TransactionDto } from "@/models/api";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const ALLOWED_ATTACHMENT_MIME = ["application/pdf", "image/jpeg", "image/png"];

interface CommonFields {
  amount: string;
  transaction_date: string;
  platform: string;
  description: string;
}

function emptyMetadata(category: PaymentCategory): Record<string, string> {
  return Object.fromEntries(CATEGORY_FIELDS[category].map((field) => [field.name, ""]));
}

function attachmentValidationError(file: File): string | null {
  const lowerName = file.name.toLowerCase();
  const extension = ALLOWED_ATTACHMENT_EXTENSIONS.find((candidate) =>
    lowerName.endsWith(candidate),
  );
  if (!extension) {
    return "Only synthetic PDF, JPG, JPEG, or PNG samples are supported.";
  }
  if (!ALLOWED_ATTACHMENT_MIME.includes(file.type)) {
    return "The attachment type does not match a supported PDF or image file.";
  }
  if (file.size === 0) {
    return "The selected attachment is empty.";
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return "Attachment must be 5 MB or smaller.";
  }
  return null;
}

export function PaymentForm({ category }: { category: PaymentCategory }) {
  const definition = CATEGORY_DEFINITIONS[category];
  const fields = CATEGORY_FIELDS[category];
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [common, setCommon] = useState<CommonFields>({
    amount: "",
    transaction_date: todayIsoDate(),
    platform: "UPI",
    description: "",
  });
  const [metadata, setMetadata] = useState<Record<string, string>>(() =>
    emptyMetadata(category),
  );
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<TransactionDto | null>(null);

  function clearFieldError(key: string) {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function updateCommon(key: keyof CommonFields, value: string) {
    setCommon((current) => ({ ...current, [key]: value }));
    clearFieldError(key);
  }

  function updateMetadata(key: string, value: string) {
    setMetadata((current) => ({ ...current, [key]: value }));
    clearFieldError(`metadata.${key}`);
  }

  function handleFile(file: File | null) {
    setAttachmentError("");
    if (!file) {
      setAttachment(null);
      return;
    }
    const error = attachmentValidationError(file);
    if (error) {
      setAttachment(null);
      setAttachmentError(error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setAttachment(file);
  }

  function resetForm() {
    setCommon({
      amount: "",
      transaction_date: todayIsoDate(),
      platform: "UPI",
      description: "",
    });
    setMetadata(emptyMetadata(category));
    setAttachment(null);
    setAttachmentError("");
    setFieldErrors({});
    setFormError("");
    setSaved(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});
    setAttachmentError("");

    if (attachment) {
      const fileError = attachmentValidationError(attachment);
      if (fileError) {
        setAttachmentError(fileError);
        return;
      }
    }

    const validation = transactionInputSchema.safeParse({
      category,
      amount: common.amount,
      transaction_date: common.transaction_date,
      platform: common.platform,
      description: common.description,
      metadata,
    });

    if (!validation.success) {
      const errors = zodFieldErrors(validation.error);
      setFieldErrors(errors);
      setFormError("Please correct the highlighted payment details before saving.");
      const firstKey = Object.keys(errors)[0] ?? "";
      const elementId = firstKey.startsWith("metadata.")
        ? firstKey.split(".")[1]
        : firstKey;
      window.setTimeout(() => document.getElementById(elementId)?.focus(), 0);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("category", category);
      formData.set("amount", String(validation.data.amount));
      formData.set("transaction_date", validation.data.transaction_date);
      formData.set("platform", validation.data.platform);
      formData.set("description", validation.data.description);
      formData.set("metadata", JSON.stringify(validation.data.metadata));
      if (attachment) {
        formData.set("attachment", attachment);
      }

      const response = await apiRequest<{ transaction: TransactionDto }>("/api/transactions", {
        method: "POST",
        body: formData,
      });
      setSaved(response.transaction);
      showToast({
        tone: "success",
        title: "Synthetic payment saved",
        message: `${definition.label} record was stored under this demo user.`,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error instanceof ClientApiError) {
        setFieldErrors(error.fields);
        setFormError(error.message);
        if (error.fields.attachment) setAttachmentError(error.fields.attachment);
        showToast({
          tone: "error",
          title: error.code === "duplicate_transaction" ? "Duplicate payment" : "Could not save payment",
          message: error.message,
        });
      } else {
        setFormError("The demo payment could not be saved. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="payment-layout">
      <div className="payment-main">
        <nav className="category-tabs" aria-label="Payment category">
          {PAYMENT_CATEGORIES.map((item) => {
            const itemDefinition = CATEGORY_DEFINITIONS[item];
            const active = item === category;
            return (
              <Link
                key={item}
                href={`/payments/new/${item}`}
                className={`category-tab ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <CategoryIcon category={item} size={17} />
                <span>{itemDefinition.label}</span>
              </Link>
            );
          })}
        </nav>

        {saved ? (
          <section className="card payment-success">
            <span className="payment-success-icon">
              <CheckCircle2 size={28} aria-hidden="true" />
            </span>
            <p className="eyebrow">Record stored</p>
            <h2>Synthetic payment saved</h2>
            <p className="payment-success-lead">
              The {definition.label.toLowerCase()} record has been added to your demo account and
              is ready for retrieval and assessment.
            </p>

            <dl className="payment-success-details">
              <div>
                <dt>Transaction ID</dt>
                <dd className="mono">{saved.id.slice(0, 8).toUpperCase()}</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>{formatCurrency(saved.amount, 2)}</dd>
              </div>
              <div>
                <dt>Transaction date</dt>
                <dd>{formatDate(saved.transactionDate)}</dd>
              </div>
              <div>
                <dt>Platform</dt>
                <dd>{saved.platform}</dd>
              </div>
              <div>
                <dt>Attachment</dt>
                <dd>{saved.attachment ? saved.attachment.filename : "None"}</dd>
              </div>
            </dl>

            <div className="payment-success-actions">
              <Link href="/assessment" className="btn btn-primary">
                Generate assessment
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/transactions" className="btn btn-secondary">
                View transaction history
              </Link>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                <Plus size={16} aria-hidden="true" />
                Add another payment
              </button>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {formError ? (
              <div className="alert alert-error" role="alert">
                <Info size={17} aria-hidden="true" />
                <p>{formError}</p>
              </div>
            ) : null}

            <section className="card form-card">
              <div className="form-card-header">
                <span className="form-section-icon">
                  <ReceiptText size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2>Payment details</h2>
                  <p>Use fictional amounts, descriptions, and references only.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className={`field ${fieldErrors.amount ? "field-invalid" : ""}`}>
                  <label htmlFor="amount">Payment amount</label>
                  <div className="amount-input">
                    <span aria-hidden="true">₹</span>
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="25000.00"
                      value={common.amount}
                      onChange={(event) => updateCommon("amount", event.target.value)}
                      aria-invalid={Boolean(fieldErrors.amount)}
                      aria-describedby={fieldErrors.amount ? "amount-error" : "amount-hint"}
                    />
                  </div>
                  {fieldErrors.amount ? (
                    <p className="field-error" id="amount-error" role="alert">
                      {fieldErrors.amount}
                    </p>
                  ) : (
                    <p className="field-hint" id="amount-hint">
                      Positive INR value with up to two decimal places.
                    </p>
                  )}
                </div>

                <div className={`field ${fieldErrors.transaction_date ? "field-invalid" : ""}`}>
                  <label htmlFor="transaction_date">Transaction date</label>
                  <div className="input-with-icon">
                    <CalendarDays size={17} aria-hidden="true" />
                    <input
                      id="transaction_date"
                      name="transaction_date"
                      type="date"
                      max={todayIsoDate()}
                      value={common.transaction_date}
                      onChange={(event) => updateCommon("transaction_date", event.target.value)}
                      aria-invalid={Boolean(fieldErrors.transaction_date)}
                      aria-describedby={
                        fieldErrors.transaction_date ? "transaction-date-error" : undefined
                      }
                    />
                  </div>
                  {fieldErrors.transaction_date ? (
                    <p className="field-error" id="transaction-date-error" role="alert">
                      {fieldErrors.transaction_date}
                    </p>
                  ) : null}
                </div>

                <div className={`field ${fieldErrors.platform ? "field-invalid" : ""}`}>
                  <label htmlFor="platform">Payment platform</label>
                  <div className="input-with-icon">
                    <CreditCard size={17} aria-hidden="true" />
                    <select
                      id="platform"
                      name="platform"
                      value={common.platform}
                      onChange={(event) => updateCommon("platform", event.target.value)}
                      aria-invalid={Boolean(fieldErrors.platform)}
                      aria-describedby={fieldErrors.platform ? "platform-error" : undefined}
                    >
                      <option value="">Select a platform</option>
                      {PAYMENT_PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.platform ? (
                    <p className="field-error" id="platform-error" role="alert">
                      {fieldErrors.platform}
                    </p>
                  ) : null}
                </div>

                <div className={`field field-full ${fieldErrors.description ? "field-invalid" : ""}`}>
                  <label htmlFor="description">Transaction description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    maxLength={300}
                    placeholder={`e.g. Synthetic ${definition.label.toLowerCase()} payment for prototype review`}
                    value={common.description}
                    onChange={(event) => updateCommon("description", event.target.value)}
                    aria-invalid={Boolean(fieldErrors.description)}
                    aria-describedby={fieldErrors.description ? "description-error" : "description-hint"}
                  />
                  <div className="field-foot">
                    {fieldErrors.description ? (
                      <p className="field-error" id="description-error" role="alert">
                        {fieldErrors.description}
                      </p>
                    ) : (
                      <p className="field-hint" id="description-hint">
                        Fictional description only.
                      </p>
                    )}
                    <span className="char-count">{common.description.length}/300</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="card form-card">
              <div className="form-card-header">
                <CategoryIcon category={category} size={20} />
                <div>
                  <h2>{definition.label} details</h2>
                  <p>{definition.description}</p>
                </div>
              </div>

              <div className="form-grid">
                {fields.map((field) => {
                  const errorKey = `metadata.${field.name}`;
                  const error = fieldErrors[errorKey];
                  const inputId = `metadata-${field.name}`;
                  return (
                    <div
                      className={`field ${error ? "field-invalid" : ""}`}
                      key={field.name}
                    >
                      <label htmlFor={inputId}>{field.label}</label>
                      {field.type === "select" ? (
                        <select
                          id={inputId}
                          name={field.name}
                          value={metadata[field.name] ?? ""}
                          onChange={(event) => updateMetadata(field.name, event.target.value)}
                          aria-invalid={Boolean(error)}
                          aria-describedby={error ? `${inputId}-error` : `${inputId}-hint`}
                        >
                          <option value="">{field.placeholder}</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={inputId}
                          name={field.name}
                          type="text"
                          placeholder={field.placeholder}
                          value={metadata[field.name] ?? ""}
                          onChange={(event) => updateMetadata(field.name, event.target.value)}
                          aria-invalid={Boolean(error)}
                          aria-describedby={error ? `${inputId}-error` : `${inputId}-hint`}
                        />
                      )}
                      {error ? (
                        <p className="field-error" id={`${inputId}-error`} role="alert">
                          {error}
                        </p>
                      ) : (
                        <p className="field-hint" id={`${inputId}-hint`}>
                          {field.hint}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="card form-card">
              <div className="form-card-header">
                <span className="form-section-icon">
                  <UploadCloud size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2>Optional synthetic sample</h2>
                  <p>Attach a clearly fictional PDF, JPG, JPEG, or PNG document.</p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                id="attachment"
                name="attachment"
                type="file"
                className="sr-only"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                aria-describedby="attachment-hint attachment-error"
                tabIndex={-1}
              />

              <div className={`upload-zone ${attachment ? "upload-zone-selected" : ""}`}>
                {attachment ? (
                  <div className="upload-file">
                    <span className="upload-file-icon">
                      <FileText size={22} aria-hidden="true" />
                    </span>
                    <div className="upload-file-copy">
                      <p>{attachment.name}</p>
                      <span>
                        {formatFileSize(attachment.size)} ·{" "}
                        {attachment.type === "application/pdf"
                          ? "PDF"
                          : attachment.type.replace("image/", "").toUpperCase()}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => handleFile(null)}
                      aria-label="Remove attachment"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="upload-prompt"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="upload-prompt-icon">
                      <UploadCloud size={22} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>Select a synthetic sample</strong>
                      <span>PDF, JPG, JPEG, or PNG · max 5 MB</span>
                    </span>
                  </button>
                )}
              </div>
              {attachmentError ? (
                <p className="field-error" id="attachment-error" role="alert">
                  {attachmentError}
                </p>
              ) : (
                <p className="field-hint" id="attachment-hint">
                  Do not upload genuine bank statements, bills, identity documents, or any real
                  financial record.
                </p>
              )}
            </section>

            <div className="form-actions">
              <Link href="/dashboard" className="btn btn-ghost">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="spin" size={17} aria-hidden="true" />
                    Saving synthetic payment…
                  </>
                ) : (
                  <>
                    <Lock size={16} aria-hidden="true" />
                    Save synthetic payment
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <aside className="payment-aside">
        <section className="card summary-card">
          <p className="eyebrow">Record summary</p>
          <div className="summary-category">
            <CategoryIcon category={category} />
            <div>
              <strong>{definition.label}</strong>
              <span>{definition.shortLabel} payment</span>
            </div>
          </div>
          <dl className="summary-details">
            <div>
              <dt>Amount</dt>
              <dd>{formatCurrency(Number(common.amount) || 0, 2)}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{formatDate(common.transaction_date)}</dd>
            </div>
            <div>
              <dt>Platform</dt>
              <dd>{common.platform || "Not selected"}</dd>
            </div>
            <div>
              <dt>Attachment</dt>
              <dd>{attachment ? formatFileSize(attachment.size) : "None"}</dd>
            </div>
          </dl>
          <div className="summary-note">
            <Info size={15} aria-hidden="true" />
            <p>All values are synthetic and stored only for this internal prototype.</p>
          </div>
        </section>

        <section className="card guardrail-card">
          <div className="guardrail-heading">
            <ShieldCheck size={18} aria-hidden="true" />
            <h2>Demo guardrails</h2>
          </div>
          <ul>
            <li>Use fictional landlord, provider, operator, and consumer references.</li>
            <li>Uploads are limited to synthetic PDF or image samples up to 5 MB.</li>
            <li>Payment files are served only to the signed-in demo user.</li>
            <li>This form never connects to a bank, utility, telecom, or payment gateway.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
