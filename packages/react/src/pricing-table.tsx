"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Surface } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description?: string;
  features: string[];
  details?: string;
  disabled?: boolean;
}

export interface PricingTableProps extends SurfaceProps {
  plans: PricingPlan[];
  onChoose: (id: string) => void | Promise<void>;
  value?: string;
  label?: string;
  disabled?: boolean;
}

type PlanSnapshot = PricingPlan & { features: string[] };
type Review = {
  token: number;
  plan: PlanSnapshot;
  signature: string;
  value: string | undefined;
  onChoose: PricingTableProps["onChoose"];
  trigger: HTMLButtonElement;
};
type Attempt = { review: Review };
type Feedback = { token: number; pending: boolean; error: boolean };
type Context = {
  plans: Map<string, { plan: PlanSnapshot; signature: string }>;
  value: string | undefined;
  disabled: boolean;
  onChoose: PricingTableProps["onChoose"];
};

const useCommittedEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
const planSignature = (plan: PricingPlan) =>
  JSON.stringify([
    plan.id,
    plan.name,
    plan.price,
    plan.description ?? null,
    plan.features,
    plan.details ?? null,
    Boolean(plan.disabled),
  ]);
const planSnapshot = (plan: PricingPlan): PlanSnapshot => ({
  id: plan.id,
  name: plan.name,
  price: plan.price,
  description: plan.description,
  features: [...plan.features],
  details: plan.details,
  disabled: plan.disabled,
});

/** Review emits consumer intent only. Current plan and any account changes remain application-owned. */
export function PricingTable({
  plans,
  onChoose,
  value,
  label = "Pricing plans",
  disabled = false,
  ...props
}: PricingTableProps) {
  const id = useId();
  const [review, setReview] = useState<Review | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [nativeDialog, setNativeDialog] = useState(true);
  const container = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const committed = useRef<Context | null>(null);
  const active = useRef<Review | null>(null);
  const flight = useRef<Attempt | null>(null);
  const nextToken = useRef(0);
  const mounted = useRef(false);

  function matches(owner: Review, context: Context | null) {
    const plan = context?.plans.get(owner.plan.id);
    return Boolean(
      context &&
      !context.disabled &&
      plan &&
      !plan.plan.disabled &&
      plan.signature === owner.signature &&
      context.value === owner.value &&
      context.value !== owner.plan.id &&
      context.onChoose === owner.onChoose,
    );
  }

  function dismiss(owner: Review, restoreFocus = true) {
    if (active.current !== owner) return;
    active.current = null;
    flight.current = null;
    const element = dialog.current;
    if (element?.open) {
      try {
        element.close();
      } catch {
        element.removeAttribute("open");
      }
    }
    setReview(null);
    setFeedback(null);
    if (restoreFocus) {
      if (owner.trigger.isConnected && !owner.trigger.disabled)
        owner.trigger.focus();
      else container.current?.focus();
    }
  }

  useCommittedEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      active.current = null;
      flight.current = null;
      const element = dialog.current;
      if (element?.open) {
        try {
          element.close();
        } catch {
          element.removeAttribute("open");
        }
      }
      committed.current = null;
    };
  }, []);

  // Only committed props can invalidate a review; a speculative render cannot poison a pending choice.
  useCommittedEffect(() => {
    const context: Context = {
      plans: new Map(
        plans.map((plan) => [
          plan.id,
          {
            plan: planSnapshot(plan),
            signature: planSignature(plan),
          },
        ]),
      ),
      value,
      disabled,
      onChoose,
    };
    committed.current = context;
    if (active.current && !matches(active.current, context))
      dismiss(active.current);
  });

  const selectedPlan = review
    ? plans.find((plan) => plan.id === review.plan.id)
    : undefined;
  const visible = Boolean(
    review &&
    selectedPlan &&
    !disabled &&
    !selectedPlan.disabled &&
    value === review.value &&
    value !== review.plan.id &&
    planSignature(selectedPlan) === review.signature,
  );

  useCommittedEffect(() => {
    if (!review || !visible || active.current !== review) return;
    const element = dialog.current;
    if (nativeDialog) {
      if (!element || typeof element.showModal !== "function") {
        setNativeDialog(false);
        return;
      }
      try {
        if (!element.open) element.showModal();
      } catch {
        if (element.open) {
          try {
            element.close();
          } catch {
            element.removeAttribute("open");
          }
        }
        setNativeDialog(false);
        return;
      }
    }
    closeButton.current?.focus();
  }, [review, visible, nativeDialog]);

  function openReview(planId: string, trigger: HTMLButtonElement) {
    const context = committed.current,
      selected = context?.plans.get(planId);
    if (
      !mounted.current ||
      !context ||
      context.disabled ||
      !selected ||
      selected.plan.disabled ||
      context.value === planId
    )
      return;
    if (active.current) dismiss(active.current, false);
    const owner: Review = {
      token: ++nextToken.current,
      plan: planSnapshot(selected.plan),
      signature: selected.signature,
      value: context.value,
      onChoose: context.onChoose,
      trigger,
    };
    active.current = owner;
    flight.current = null;
    setFeedback(null);
    setNativeDialog(true);
    setReview(owner);
  }

  function owns(attempt: Attempt) {
    return (
      mounted.current &&
      flight.current === attempt &&
      active.current === attempt.review &&
      matches(attempt.review, committed.current)
    );
  }

  async function choose(owner: Review) {
    if (
      active.current !== owner ||
      flight.current ||
      !matches(owner, committed.current)
    )
      return;
    const attempt: Attempt = { review: owner };
    flight.current = attempt;
    setFeedback({ token: owner.token, pending: true, error: false });
    try {
      await owner.onChoose(owner.plan.id);
      if (owns(attempt)) dismiss(owner);
    } catch {
      if (owns(attempt))
        setFeedback({ token: owner.token, pending: false, error: true });
    } finally {
      if (flight.current === attempt) flight.current = null;
    }
  }

  const currentFeedback = feedback?.token === review?.token ? feedback : null;
  const pending = currentFeedback?.pending ?? false;
  const titleId = `${id}-review-title`;
  const content =
    review && visible ? (
      <div className="ac-pricing-drawer-body">
        <header className="ac-pricing-drawer-heading">
          <div>
            <span className="ac-eyebrow">Plan review</span>
            <h3 className="ac-title" id={titleId}>
              Review {review.plan.name}
            </h3>
          </div>
          <button
            ref={closeButton}
            className="ac-button"
            type="button"
            onClick={() => dismiss(review)}
          >
            Close review
          </button>
        </header>
        <p className="ac-pricing-price">{review.plan.price}</p>
        {review.plan.description && (
          <p className="ac-body">{review.plan.description}</p>
        )}
        <ul className="ac-pricing-features">
          {review.plan.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
        {review.plan.details && (
          <p className="ac-body ac-pricing-details">{review.plan.details}</p>
        )}
        <p className="ac-muted ac-small">Review this plan before continuing.</p>
        <div className="ac-pricing-drawer-actions">
          <button
            className="ac-button ac-primary"
            type="button"
            disabled={pending}
            onClick={() => {
              void choose(review);
            }}
          >
            {pending
              ? "Choosing…"
              : currentFeedback?.error
                ? `Retry ${review.plan.name}`
                : `Confirm ${review.plan.name}`}
          </button>
          {pending && (
            <p className="ac-muted ac-small" role="status">
              Waiting for confirmation…
            </p>
          )}
          {currentFeedback?.error && (
            <p className="ac-error" role="alert">
              Could not confirm this selection. Try again.
            </p>
          )}
        </div>
      </div>
    ) : null;

  return (
    <Surface {...props} title={label} eyebrow="Plans">
      <div className="ac-pricing-content" ref={container} tabIndex={-1}>
        {plans.length === 0 ? (
          <p className="ac-empty" role="status">
            No plans are available.
          </p>
        ) : (
          <ul className="ac-pricing-grid">
            {plans.map((plan) => {
              const current = plan.id === value;
              return (
                <li
                  key={plan.id}
                  className="ac-pricing-plan"
                  data-current={current}
                >
                  <div className="ac-row">
                    <h4 className="ac-title">{plan.name}</h4>
                    {current && (
                      <span className="ac-tag ac-pricing-current">
                        Current plan
                      </span>
                    )}
                  </div>
                  <p className="ac-pricing-price">{plan.price}</p>
                  {plan.description && (
                    <p className="ac-body">{plan.description}</p>
                  )}
                  <ul className="ac-pricing-features">
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="ac-button"
                    disabled={disabled || plan.disabled || current}
                    aria-expanded={Boolean(
                      visible && review?.plan.id === plan.id,
                    )}
                    onClick={(event) =>
                      openReview(plan.id, event.currentTarget)
                    }
                  >
                    {current ? "Current plan" : `Choose ${plan.name}`}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {disabled && (
          <p className="ac-muted ac-small" role="status">
            Plan selection is unavailable.
          </p>
        )}
        {content &&
          review &&
          (nativeDialog ? (
            <dialog
              key={review.token}
              ref={dialog}
              className="ac-pricing-drawer"
              aria-labelledby={titleId}
              onCancel={(event) => {
                event.preventDefault();
                dismiss(review);
              }}
              onClose={() => dismiss(review)}
              onClick={(event) => {
                if (event.target === event.currentTarget) dismiss(review);
              }}
            >
              {content}
            </dialog>
          ) : (
            <section
              key={review.token}
              className="ac-pricing-drawer ac-pricing-drawer--inline"
              role="region"
              aria-labelledby={titleId}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  dismiss(review);
                }
              }}
            >
              {content}
            </section>
          ))}
      </div>
    </Surface>
  );
}
