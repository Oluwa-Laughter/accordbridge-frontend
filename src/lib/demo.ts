import {
  Agreement,
  payout,
  sampleAgreement,
  total,
  validateAgreement,
} from "./agreement";
export type Role = "client" | "freelancer";
export type Stage =
  | "agreement"
  | "unfunded"
  | "funding-pending"
  | "funding-unknown"
  | "working"
  | "review"
  | "revision"
  | "payment-pending"
  | "released"
  | "disputed";
export type Submission = { version: number; notes: string };
export type DemoState = {
  agreement: Agreement;
  agreementVersion: number;
  history: {
    agreement: Agreement;
    version: number;
    accepted: Record<Role, boolean>;
  }[];
  stage: Stage;
  accepted: Record<Role, boolean>;
  submissions: Submission[];
  feedback: string;
  activity: string[];
};
export type Action =
  | { type: "accept"; role: Role; version: number }
  | { type: "publish-agreement"; agreement: Agreement; version: number }
  | { type: "create-agreement"; agreement: Agreement }
  | { type: "fund"; role: Role }
  | { type: "funding-unknown" }
  | { type: "confirm-funding" }
  | { type: "submit"; role: Role; notes: string }
  | { type: "revise"; role: Role; feedback: string }
  | { type: "approve"; role: Role }
  | { type: "confirm-payment" }
  | { type: "dispute"; role: Role }
  | { type: "reset"; scenario: "new" | "funded" | "review" };

export function initialState(
  scenario: "new" | "funded" | "review" = "new",
): DemoState {
  return {
    agreement: sampleAgreement(),
    agreementVersion: 1,
    history: [],
    stage:
      scenario === "new"
        ? "agreement"
        : scenario === "funded"
          ? "working"
          : "review",
    accepted: { client: scenario !== "new", freelancer: scenario !== "new" },
    submissions:
      scenario === "review"
        ? [
            {
              version: 1,
              notes:
                "Five page layouts with desktop and mobile variants are ready for review. Sample evidence only.",
            },
          ]
        : [],
    feedback: "",
    activity: [
      scenario === "new"
        ? "Agreement v1 prepared for both parties."
        : "Sample design milestone funding confirmed: 150 USDC.",
    ],
  };
}

// Prototype transitions only. This is not a contract or a production authorization boundary.
export function demoReducer(state: DemoState, action: Action): DemoState {
  const update = (patch: Partial<DemoState>, event: string): DemoState => ({
    ...state,
    ...patch,
    activity: [event, ...state.activity],
  });
  switch (action.type) {
    case "create-agreement":
      if (validateAgreement(action.agreement).length) return state;
      return {
        ...initialState(),
        agreement: structuredClone(action.agreement),
      };
    case "publish-agreement":
      if (
        !["agreement", "unfunded"].includes(state.stage) ||
        action.version !== state.agreementVersion ||
        validateAgreement(action.agreement).length
      )
        return state;
      if (JSON.stringify(action.agreement) === JSON.stringify(state.agreement))
        return state;
      return update(
        {
          agreement: structuredClone(action.agreement),
          agreementVersion: state.agreementVersion + 1,
          accepted: { client: false, freelancer: false },
          stage: "agreement",
          history: [
            ...state.history,
            {
              agreement: structuredClone(state.agreement),
              version: state.agreementVersion,
              accepted: { ...state.accepted },
            },
          ],
        },
        `Agreement v${state.agreementVersion + 1} proposed. Both parties must accept again.`,
      );
    case "reset":
      return initialState(action.scenario);
    case "accept": {
      if (
        state.stage !== "agreement" ||
        state.accepted[action.role] ||
        action.version !== state.agreementVersion
      )
        return state;
      const accepted = { ...state.accepted, [action.role]: true };
      return update(
        {
          accepted,
          stage:
            accepted.client && accepted.freelancer ? "unfunded" : "agreement",
        },
        `${action.role === "client" ? "Maya" : "Tobi"} accepted agreement v${state.agreementVersion} in this demo.`,
      );
    }
    case "fund":
      if (action.role !== "client" || state.stage !== "unfunded") return state;
      return update(
        { stage: "funding-pending" },
        "Simulated funding submitted; confirmation pending.",
      );
    case "funding-unknown":
      if (state.stage !== "funding-pending") return state;
      return update(
        { stage: "funding-unknown" },
        "Funding outcome unknown. Check the existing transaction before retrying.",
      );
    case "confirm-funding":
      if (!["funding-pending", "funding-unknown"].includes(state.stage))
        return state;
      return update(
        { stage: "working" },
        `Sample ${state.agreement.milestones[0].name} funding confirmed: ${state.agreement.milestones[0].amount} USDC. Other milestones remain unfunded.`,
      );
    case "submit":
      if (
        action.role !== "freelancer" ||
        !["working", "revision"].includes(state.stage) ||
        !action.notes.trim()
      )
        return state;
      const version = state.submissions.length + 1;
      return update(
        {
          stage: "review",
          submissions: [
            ...state.submissions,
            { version, notes: action.notes.trim() },
          ],
        },
        `Tobi submitted ${state.agreement.milestones[0].name} v${version} under agreement v${state.agreementVersion}.`,
      );
    case "revise":
      if (
        action.role !== "client" ||
        state.stage !== "review" ||
        !action.feedback.trim()
      )
        return state;
      return update(
        { stage: "revision", feedback: action.feedback.trim() },
        `Maya requested a revision to submission v${state.submissions.length}: ${action.feedback.trim()}`,
      );
    case "approve":
      if (action.role !== "client" || state.stage !== "review") return state;
      return update(
        { stage: "payment-pending" },
        `Maya approved submission v${state.submissions.length}; payment is still pending.`,
      );
    case "confirm-payment":
      if (state.stage !== "payment-pending") return state;
      return update(
        { stage: "released" },
        `Simulated payout confirmed: ${payout(state.agreement.milestones[0].amount).net} USDC net to Tobi, ${payout(state.agreement.milestones[0].amount).fee} USDC illustrative provider fee.`,
      );
    case "dispute":
      if (!["working", "review", "revision"].includes(state.stage))
        return state;
      return update(
        { stage: "disputed" },
        `${action.role === "client" ? "Maya" : "Tobi"} requested a reviewer decision. Funds remain held.`,
      );
  }
}

export function balances(state: DemoState) {
  const locked = [
    "working",
    "review",
    "revision",
    "payment-pending",
    "disputed",
  ].includes(state.stage)
    ? payout(state.agreement.milestones[0].amount).gross
    : 0;
  const released =
    state.stage === "released"
      ? payout(state.agreement.milestones[0].amount).gross
      : 0;
  return {
    locked,
    released,
    disputed: state.stage === "disputed" ? locked : 0,
    unfunded:
      Math.round((total(state.agreement) - locked - released) * 100) / 100,
  };
}

export const stageLabels: Record<Stage, string> = {
  agreement: "Awaiting acceptance",
  unfunded: "Awaiting funding",
  "funding-pending": "Funding pending",
  "funding-unknown": "Funding outcome unknown",
  working: "Ready for work",
  review: "Ready for review",
  revision: "Revision requested",
  "payment-pending": "Approved · payment pending",
  released: "Payment confirmed",
  disputed: "Reviewer decision pending",
};
