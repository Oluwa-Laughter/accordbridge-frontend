"use client";
import { useState } from "react";
import { Agreement, emptyMilestone, validateAgreement } from "@/lib/agreement";

export function AgreementEditor({
  draft,
  onChange,
  onSave,
  onPublish,
  creating,
}: {
  draft: Agreement;
  onChange: (draft: Agreement) => void;
  onSave: () => void;
  onPublish: () => void;
  creating: boolean;
}) {
  const [errors, setErrors] = useState<string[]>([]);
  const field = <K extends keyof Agreement>(key: K, value: Agreement[K]) =>
    onChange({ ...draft, [key]: value });
  return (
    <section className="panel agreement-editor" aria-labelledby="editor-title">
      <span className="eyebrow">SAMPLE AGREEMENT BUILDER</span>
      <h2 id="editor-title">
        {creating
          ? "Create a project agreement"
          : "Propose a new agreement version"}
      </h2>
      <p>
        Maya is the sample client; Tobi is the sample freelancer. All dates use
        WAT (UTC+1), at 17:00. Use fictional details only.
      </p>
      {creating && (
        <p className="policy-note">
          Publishing replaces the current project in this single-project demo.
          Saving a draft leaves the current project unchanged.
        </p>
      )}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const next = validateAgreement(draft);
          setErrors(next);
          if (!next.length) onPublish();
        }}
      >
        {errors.length > 0 && (
          <div className="form-errors" role="alert">
            <strong>Check these fields before sending:</strong>
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <label>
          Project title
          <input
            value={draft.title}
            maxLength={100}
            onChange={(event) => field("title", event.target.value)}
          />
        </label>
        <label>
          Project description
          <textarea
            value={draft.description}
            maxLength={2000}
            onChange={(event) => field("description", event.target.value)}
          />
        </label>
        <div className="editor-milestones">
          {draft.milestones.map((milestone, index) => {
            const change = (key: keyof typeof milestone, value: string) =>
              field(
                "milestones",
                draft.milestones.map((item, i) =>
                  i === index ? { ...item, [key]: value } : item,
                ),
              );
            return (
              <fieldset key={index}>
                <legend>Milestone {index + 1}</legend>
                <label>
                  Milestone name
                  <input
                    value={milestone.name}
                    maxLength={100}
                    onChange={(event) => change("name", event.target.value)}
                  />
                </label>
                <div className="terms-grid">
                  <label>
                    Amount (USDC)
                    <input
                      inputMode="decimal"
                      value={milestone.amount}
                      onChange={(event) => change("amount", event.target.value)}
                    />
                  </label>
                  <label>
                    Delivery date
                    <input
                      type="date"
                      value={milestone.dueDate}
                      onChange={(event) =>
                        change("dueDate", event.target.value)
                      }
                    />
                  </label>
                </div>
                <label>
                  Deliverables
                  <textarea
                    value={milestone.scope}
                    maxLength={2000}
                    onChange={(event) => change("scope", event.target.value)}
                  />
                </label>
                <label>
                  Acceptance criteria (one per line)
                  <textarea
                    value={milestone.criteria}
                    maxLength={2000}
                    onChange={(event) => change("criteria", event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="secondary"
                  disabled={draft.milestones.length === 1}
                  onClick={() =>
                    field(
                      "milestones",
                      draft.milestones.filter((_, i) => i !== index),
                    )
                  }
                >
                  Remove milestone {index + 1}
                </button>
              </fieldset>
            );
          })}
        </div>
        <button
          type="button"
          className="secondary"
          disabled={draft.milestones.length >= 10}
          onClick={() =>
            field("milestones", [...draft.milestones, emptyMilestone()])
          }
        >
          Add milestone
        </button>
        <label>
          Exclusions
          <textarea
            value={draft.exclusions}
            maxLength={2000}
            onChange={(event) => field("exclusions", event.target.value)}
          />
        </label>
        <div className="terms-grid">
          <label>
            Included revision rounds
            <input
              type="number"
              min={0}
              max={10}
              value={Number.isNaN(draft.revisions) ? "" : draft.revisions}
              onChange={(event) =>
                field(
                  "revisions",
                  event.target.value === "" ? NaN : Number(event.target.value),
                )
              }
            />
          </label>
          <label>
            Review period (calendar days)
            <input
              type="number"
              min={1}
              max={30}
              value={Number.isNaN(draft.reviewDays) ? "" : draft.reviewDays}
              onChange={(event) =>
                field(
                  "reviewDays",
                  event.target.value === "" ? NaN : Number(event.target.value),
                )
              }
            />
          </label>
        </div>
        <p className="policy-note">
          Sample USDC only. Illustrative provider fee: 0.3%, rounded to cents;
          platform fee: 0%. Network fees are not estimated. Silence requires
          reviewer escalation. Resolver, cancellation and appeal terms remain
          unresolved, so these proposals cannot become live agreements.
        </p>
        <div className="button-row">
          <button className="primary">Send for review</button>
          <button type="button" className="secondary" onClick={onSave}>
            Save draft & close
          </button>
        </div>
        <p className="small">
          Drafts last for this browser session in memory only. Refreshing clears
          them. Sending resets both acceptances; it does not fund any work.
        </p>
      </form>
    </section>
  );
}

export function AgreementSummary({ agreement }: { agreement: Agreement }) {
  return (
    <div className="agreement-summary">
      <h3>{agreement.title}</h3>
      <p>{agreement.description}</p>
      {agreement.milestones.map((item, index) => (
        <article key={index}>
          <strong>
            {index + 1}. {item.name} · {item.amount} USDC
          </strong>
          <p>{item.scope}</p>
          <ul>
            {item.criteria
              .split("\n")
              .filter((line) => line.trim())
              .map((line, i) => (
                <li key={i}>{line}</li>
              ))}
          </ul>
          <p className="small">Due {item.dueDate}, 17:00 WAT (UTC+1)</p>
        </article>
      ))}
      <p>
        {agreement.revisions} revision rounds · {agreement.reviewDays} calendar
        days for review
      </p>
      <p>Exclusions: {agreement.exclusions}</p>
    </div>
  );
}
